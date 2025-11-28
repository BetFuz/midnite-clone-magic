import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClientWithAuth, createServiceClient } from "../_shared/supabase-client.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

/**
 * Withdrawal Function - Ready for Payment Provider Integration
 * 
 * TODO: Add API keys as secrets:
 * - FLUTTERWAVE_SECRET_KEY (for bank transfers)
 * - GO_WITHDRAWAL_SERVICE_URL (for KYC/fraud checks)
 */

interface WithdrawalRequest {
  amount: number;
  method: 'bank_transfer' | 'mobile_money' | 'crypto';
  account_details: {
    account_number?: string;
    account_name?: string;
    bank_code?: string;
    phone_number?: string;
    wallet_address?: string;
  };
  currency?: string;
}

interface WithdrawalValidation {
  isValid: boolean;
  error?: string;
  fees?: number;
  netAmount?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401);
    }

    const supabase = createClientWithAuth(authHeader);
    const serviceClient = createServiceClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body: WithdrawalRequest = await req.json();
    const { amount, method, account_details, currency = 'NGN' } = body;

    // Validation
    if (!amount || amount <= 0) {
      return jsonResponse({ error: 'Invalid amount' }, 400);
    }

    if (!method) {
      return jsonResponse({ error: 'Withdrawal method required' }, 400);
    }

    if (!account_details || Object.keys(account_details).length === 0) {
      return jsonResponse({ error: 'Account details required' }, 400);
    }

    // Get user's current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance, email, full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: 'Profile not found' }, 404);
    }

    // Check KYC requirement for withdrawals > ₦50,000 (NLRC requirement)
    if (amount > 50000) {
      const { data: kycData, error: kycError } = await serviceClient
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('verification_status', 'verified')
        .single();

      if (kycError || !kycData) {
        console.log('KYC verification required for withdrawal:', user.id);
        return jsonResponse({
          error: 'KYC verification required for withdrawals above ₦50,000. Please complete NIN verification before proceeding.',
          requiresKyc: true,
          nlrcCompliance: true
        }, 403);
      }

      // Check if KYC has expired
      if (kycData.expires_at && new Date(kycData.expires_at) < new Date()) {
        console.log('KYC verification expired for user:', user.id);
        return jsonResponse({
          error: 'Your KYC verification has expired. Please re-verify your NIN before withdrawing.',
          requiresKyc: true,
          nlrcCompliance: true
        }, 403);
      }

      console.log('KYC verification confirmed for user:', user.id, 'Score:', kycData.verification_score);
    }

    // Validate withdrawal
    const validation = validateWithdrawal(amount, profile.balance, method);
    if (!validation.isValid) {
      return jsonResponse({ error: validation.error }, 400);
    }

    const requestId = crypto.randomUUID();
    const reference = `WDW-${Date.now()}-${user.id.slice(0, 8)}`;

    // Log withdrawal attempt to admin audit
    await serviceClient.from('admin_audit_log').insert({
      admin_id: user.id,
      action: 'withdrawal_requested',
      resource_type: 'transaction',
      resource_id: reference,
      status: 'pending',
      payload_hash: JSON.stringify({ 
        amount, 
        method, 
        fees: validation.fees,
        netAmount: validation.netAmount 
      })
    });

    // Log to immutable ledger (financial audit trail)
    await serviceClient.rpc('log_ledger_entry', {
      p_user_id: user.id,
      p_transaction_type: 'withdrawal',
      p_amount: -amount,
      p_currency: currency,
      p_balance_before: profile.balance,
      p_balance_after: profile.balance - amount,
      p_reference_id: null,
      p_reference_type: 'withdrawal_request',
      p_description: `Withdrawal via ${method} - ${reference} (Net: ₦${validation.netAmount})`,
      p_metadata: {
        method,
        reference,
        grossAmount: amount,
        fees: validation.fees,
        netAmount: validation.netAmount,
        accountDetails: account_details
      }
    });

    // Trigger AML detection in background (non-blocking)
    serviceClient.functions.invoke('aml-detection', {
      body: {
        userId: user.id,
        transactionType: 'withdrawal',
        amount,
        metadata: { method, reference, accountDetails: account_details },
      },
    }).catch(err => console.error('AML detection failed:', err));

    // TODO: Call Go service for KYC/fraud checks
    /*
    const goServiceUrl = Deno.env.get('GO_WITHDRAWAL_SERVICE_URL');
    if (goServiceUrl) {
      const kycCheck = await fetch(`${goServiceUrl}/kyc/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          amount: amount,
          method: method
        })
      });
      
      const kycResult = await kycCheck.json();
      if (!kycResult.approved) {
        return jsonResponse({ 
          error: 'Withdrawal requires verification',
          kyc_required: true 
        }, 403);
      }
    }
    */

    // Process withdrawal based on method
    if (method === 'bank_transfer') {
      return await processBankTransfer(
        user.id,
        reference,
        amount,
        validation.netAmount!,
        account_details,
        profile.email
      );
    } else if (method === 'mobile_money') {
      return await processMobileMoneyTransfer(
        user.id,
        reference,
        amount,
        validation.netAmount!,
        account_details
      );
    } else if (method === 'crypto') {
      return await processCryptoTransfer(
        user.id,
        reference,
        amount,
        validation.netAmount!,
        account_details
      );
    } else {
      return jsonResponse({ error: 'Invalid withdrawal method' }, 400);
    }

  } catch (error) {
    console.error('Error in withdraw function:', error);
    return jsonResponse({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Validate withdrawal request
 */
function validateWithdrawal(
  amount: number, 
  balance: number, 
  method: string
): WithdrawalValidation {
  
  const MIN_WITHDRAWAL = 1000; // ₦1,000
  const MAX_WITHDRAWAL = 5000000; // ₦5,000,000

  if (amount < MIN_WITHDRAWAL) {
    return { 
      isValid: false, 
      error: `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}` 
    };
  }

  if (amount > MAX_WITHDRAWAL) {
    return { 
      isValid: false, 
      error: `Maximum withdrawal is ₦${MAX_WITHDRAWAL.toLocaleString()}` 
    };
  }

  // Calculate fees based on method
  let fees = 0;
  if (method === 'bank_transfer') {
    fees = amount > 50000 ? 100 : 50; // ₦50 for <₦50k, ₦100 for ≥₦50k
  } else if (method === 'mobile_money') {
    fees = amount * 0.015; // 1.5% fee
  } else if (method === 'crypto') {
    fees = 0; // No platform fee, only network gas
  }

  const totalRequired = amount + fees;
  const netAmount = amount - fees;

  if (balance < totalRequired) {
    return { 
      isValid: false, 
      error: `Insufficient balance. Required: ₦${totalRequired.toLocaleString()} (including ₦${fees.toFixed(2)} fee)` 
    };
  }

  return { 
    isValid: true, 
    fees, 
    netAmount 
  };
}

/**
 * Process Bank Transfer
 * TODO: Uncomment when FLUTTERWAVE_SECRET_KEY is added
 */
async function processBankTransfer(
  userId: string,
  reference: string,
  amount: number,
  netAmount: number,
  accountDetails: any,
  email: string
): Promise<Response> {
  
  // TODO: Uncomment when ready
  /*
  const flutterwaveKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
  if (!flutterwaveKey) {
    return jsonResponse({ error: 'Bank transfer not configured' }, 500);
  }

  const response = await fetch('https://api.flutterwave.com/v3/transfers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${flutterwaveKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      account_bank: accountDetails.bank_code,
      account_number: accountDetails.account_number,
      amount: netAmount,
      narration: `Betfuz Withdrawal - ${reference}`,
      currency: 'NGN',
      reference: reference,
      callback_url: `${Deno.env.get('APP_URL')}/webhooks/withdrawal`,
      debit_currency: 'NGN',
      meta: {
        user_id: userId,
        email: email
      }
    })
  });

  const data = await response.json();

  if (data.status === 'success') {
    return jsonResponse({
      requestId: reference,
      status: 'processing',
      method: 'bank_transfer',
      amount: amount,
      netAmount: netAmount,
      fees: amount - netAmount,
      account: accountDetails.account_number,
      reference: data.data.reference,
      message: 'Withdrawal is being processed'
    });
  } else {
    return jsonResponse({ 
      error: data.message || 'Transfer failed' 
    }, 400);
  }
  */

  // STUB RESPONSE
  console.log(`[STUB] Bank transfer initiated: ${reference} for user ${userId}, net amount: ₦${netAmount}`);
  return jsonResponse({
    requestId: reference,
    status: 'pending',
    method: 'bank_transfer',
    amount: amount,
    netAmount: netAmount,
    fees: amount - netAmount,
    account: accountDetails.account_number,
    message: 'STUB: Add FLUTTERWAVE_SECRET_KEY to complete integration',
    estimatedTime: '2-4 hours'
  });
}

/**
 * Process Mobile Money Transfer
 */
async function processMobileMoneyTransfer(
  userId: string,
  reference: string,
  amount: number,
  netAmount: number,
  accountDetails: any
): Promise<Response> {
  
  // STUB RESPONSE
  console.log(`[STUB] Mobile money transfer: ${reference} to ${accountDetails.phone_number}`);
  return jsonResponse({
    requestId: reference,
    status: 'pending',
    method: 'mobile_money',
    amount: amount,
    netAmount: netAmount,
    fees: amount - netAmount,
    phone: accountDetails.phone_number,
    message: 'STUB: Mobile money integration pending',
    estimatedTime: '1-2 hours'
  });
}

/**
 * Process Crypto Transfer
 */
async function processCryptoTransfer(
  userId: string,
  reference: string,
  amount: number,
  netAmount: number,
  accountDetails: any
): Promise<Response> {
  
  // STUB RESPONSE
  console.log(`[STUB] Crypto transfer: ${reference} to ${accountDetails.wallet_address}`);
  return jsonResponse({
    requestId: reference,
    status: 'pending',
    method: 'crypto',
    amount: amount,
    netAmount: netAmount,
    fees: 0,
    wallet: accountDetails.wallet_address,
    message: 'STUB: Crypto integration pending',
    estimatedTime: '15-30 minutes'
  });
}

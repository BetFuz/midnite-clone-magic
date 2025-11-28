import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BankStatementRow {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get date range for reconciliation (previous day)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(`Reconciling transactions from ${yesterday.toISOString()} to ${today.toISOString()}`);

    // Fetch bank statement CSV from storage or API
    // For now, we'll accept CSV data in the request body
    const body = await req.json();
    const { csv_data, csv_url } = body;

    let bankStatementData: string;

    if (csv_url) {
      // Fetch CSV from URL (e.g., from Supabase storage or external source)
      const response = await fetch(csv_url);
      bankStatementData = await response.text();
    } else if (csv_data) {
      bankStatementData = csv_data;
    } else {
      return new Response(JSON.stringify({ error: 'No CSV data provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse CSV (simple parser - assumes headers: Date,Description,Debit,Credit,Balance,Reference)
    const lines = bankStatementData.trim().split('\n');
    const headers = lines[0].split(',');
    
    const bankTransactions: BankStatementRow[] = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        date: values[0],
        description: values[1],
        debit: parseFloat(values[2]) || 0,
        credit: parseFloat(values[3]) || 0,
        balance: parseFloat(values[4]) || 0,
        reference: values[5] || '',
      };
    });

    console.log(`Parsed ${bankTransactions.length} bank transactions`);

    // Fetch ledger entries for the same period
    const { data: ledgerEntries, error: ledgerError } = await supabaseClient
      .from('ledger_entries')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString())
      .in('transaction_type', ['deposit', 'withdrawal']);

    if (ledgerError) {
      throw new Error(`Failed to fetch ledger entries: ${ledgerError.message}`);
    }

    console.log(`Fetched ${ledgerEntries.length} ledger entries`);

    // Calculate totals
    const bankTotalCredits = bankTransactions.reduce((sum, tx) => sum + tx.credit, 0);
    const bankTotalDebits = bankTransactions.reduce((sum, tx) => sum + tx.debit, 0);
    
    const ledgerTotalDeposits = ledgerEntries
      .filter(entry => entry.transaction_type === 'deposit')
      .reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0);
    
    const ledgerTotalWithdrawals = ledgerEntries
      .filter(entry => entry.transaction_type === 'withdrawal')
      .reduce((sum, entry) => sum + Math.abs(parseFloat(entry.amount.toString())), 0);

    // Calculate discrepancies
    const creditDiscrepancy = Math.abs(bankTotalCredits - ledgerTotalDeposits);
    const debitDiscrepancy = Math.abs(bankTotalDebits - ledgerTotalWithdrawals);
    const totalDiscrepancy = creditDiscrepancy + debitDiscrepancy;

    console.log('Reconciliation Results:');
    console.log(`Bank Credits: ₦${bankTotalCredits.toFixed(2)}`);
    console.log(`Ledger Deposits: ₦${ledgerTotalDeposits.toFixed(2)}`);
    console.log(`Credit Discrepancy: ₦${creditDiscrepancy.toFixed(2)}`);
    console.log(`Bank Debits: ₦${bankTotalDebits.toFixed(2)}`);
    console.log(`Ledger Withdrawals: ₦${ledgerTotalWithdrawals.toFixed(2)}`);
    console.log(`Debit Discrepancy: ₦${debitDiscrepancy.toFixed(2)}`);
    console.log(`Total Discrepancy: ₦${totalDiscrepancy.toFixed(2)}`);

    // Alert if discrepancy exceeds ₦1,000
    const ALERT_THRESHOLD = 1000;

    if (totalDiscrepancy > ALERT_THRESHOLD) {
      console.warn(`⚠️ ALERT: Discrepancy exceeds threshold (₦${ALERT_THRESHOLD})`);

      // Create admin audit log entry
      await supabaseClient.rpc('log_admin_action', {
        _admin_id: '00000000-0000-0000-0000-000000000000', // System
        _action: 'BANK_RECONCILIATION_ALERT',
        _resource_type: 'reconciliation',
        _resource_id: yesterday.toISOString(),
        _status: 'failed',
        _error_message: `Discrepancy of ₦${totalDiscrepancy.toFixed(2)} detected`,
        _payload_hash: JSON.stringify({
          date: yesterday.toISOString(),
          bank_credits: bankTotalCredits,
          ledger_deposits: ledgerTotalDeposits,
          credit_discrepancy: creditDiscrepancy,
          bank_debits: bankTotalDebits,
          ledger_withdrawals: ledgerTotalWithdrawals,
          debit_discrepancy: debitDiscrepancy,
          total_discrepancy: totalDiscrepancy,
        }),
      });

      // Send alert (TODO: integrate with notification system)
      console.log('Sending alert to finance team...');
      
      // In production, you would send this via email, Slack, SMS, etc.
      // For now, we'll just log and return the alert
    }

    // Find unmatched transactions
    const unmatchedBankTransactions = bankTransactions.filter(bankTx => {
      // Try to match by reference or amount+date
      return !ledgerEntries.some(ledgerEntry => {
        const amountMatch = Math.abs(
          parseFloat(ledgerEntry.amount.toString()) - (bankTx.credit || bankTx.debit)
        ) < 0.01;
        
        const referenceMatch = ledgerEntry.reference_id === bankTx.reference;
        
        return amountMatch || referenceMatch;
      });
    });

    const unmatchedLedgerEntries = ledgerEntries.filter(ledgerEntry => {
      // Try to match by reference or amount+date
      return !bankTransactions.some(bankTx => {
        const amountMatch = Math.abs(
          parseFloat(ledgerEntry.amount.toString()) - (bankTx.credit || bankTx.debit)
        ) < 0.01;
        
        const referenceMatch = ledgerEntry.reference_id === bankTx.reference;
        
        return amountMatch || referenceMatch;
      });
    });

    return new Response(JSON.stringify({
      success: true,
      reconciliation_date: yesterday.toISOString(),
      summary: {
        bank_credits: bankTotalCredits,
        ledger_deposits: ledgerTotalDeposits,
        credit_discrepancy: creditDiscrepancy,
        bank_debits: bankTotalDebits,
        ledger_withdrawals: ledgerTotalWithdrawals,
        debit_discrepancy: debitDiscrepancy,
        total_discrepancy: totalDiscrepancy,
        alert_triggered: totalDiscrepancy > ALERT_THRESHOLD,
      },
      unmatched_bank_transactions: unmatchedBankTransactions.length,
      unmatched_ledger_entries: unmatchedLedgerEntries.length,
      details: {
        unmatched_bank: unmatchedBankTransactions,
        unmatched_ledger: unmatchedLedgerEntries.map(entry => ({
          id: entry.id,
          amount: entry.amount,
          type: entry.transaction_type,
          reference: entry.reference_id,
          created_at: entry.created_at,
        })),
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bank reconciliation:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

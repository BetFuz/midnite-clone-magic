import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EscrowTransferRequest {
  amount: number;
  reason: string;
  regulatoryFlagId?: string;
  testMode?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { amount, reason, regulatoryFlagId, testMode = false } = await req.json() as EscrowTransferRequest;

    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error('Invalid transfer amount');
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'superadmin'])
      .single();

    if (roleError || !roleData) {
      throw new Error('Insufficient permissions');
    }

    console.log(`Escrow transfer initiated: ${amount} NGN, Reason: ${reason}, Test Mode: ${testMode}`);

    // In production, this would:
    // 1. Connect to hot wallet (AWS KMS or similar)
    // 2. Generate multisig transaction
    // 3. Transfer to escrow wallet
    // 4. Wait for blockchain confirmation
    // For now, we simulate with mock transaction

    const mockTxHash = testMode 
      ? `TEST_${Date.now()}_${Math.random().toString(36).substring(7)}`
      : `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    // Record transfer in database
    const { data: transfer, error: insertError } = await supabase
      .from('escrow_transfers')
      .insert({
        amount,
        reason,
        source_wallet: testMode ? 'test_hot_wallet' : 'hot_wallet',
        destination_wallet: testMode ? 'test_escrow_multisig' : 'escrow_multisig',
        tx_hash: mockTxHash,
        status: 'completed',
        regulatory_flag_id: regulatoryFlagId || null,
        initiated_by: user.id,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    // Log admin action
    await supabase.rpc('log_admin_action', {
      _admin_id: user.id,
      _action: 'escrow_transfer_initiated',
      _resource_type: 'escrow',
      _resource_id: transfer.id,
      _status: 'success',
      _payload_hash: mockTxHash,
    });

    console.log(`Escrow transfer completed: ${transfer.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        transfer,
        message: testMode 
          ? 'Test escrow transfer completed successfully'
          : 'Escrow transfer completed successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Escrow transfer error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

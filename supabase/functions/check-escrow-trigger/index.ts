import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Checking for active regulatory freeze flags...');

    // Check for active NLRC freeze flag
    const { data: activeFlags, error: flagError } = await supabase
      .from('regulatory_flags')
      .select('*')
      .eq('flag_type', 'nlrc_freeze')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (flagError) {
      console.error('Error fetching regulatory flags:', flagError);
      throw flagError;
    }

    if (!activeFlags || activeFlags.length === 0) {
      console.log('No active regulatory freeze flags found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active regulatory freeze. Escrow transfer not required.',
          flagsChecked: true,
          transferTriggered: false,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const activeFlag = activeFlags[0];
    console.log(`Active NLRC freeze detected: ${activeFlag.id}`);

    // Calculate 20% of platform float
    // In production, this would query actual hot wallet balance
    // For now, we use mock calculation
    const mockPlatformFloat = 10000000; // ₦10M mock float
    const escrowAmount = mockPlatformFloat * 0.20; // 20% = ₦2M

    console.log(`Calculating escrow amount: 20% of ₦${mockPlatformFloat} = ₦${escrowAmount}`);

    // Check if transfer already exists for this flag today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existingTransfer } = await supabase
      .from('escrow_transfers')
      .select('id')
      .eq('regulatory_flag_id', activeFlag.id)
      .gte('created_at', today.toISOString())
      .single();

    if (existingTransfer) {
      console.log('Escrow transfer already completed today for this flag');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Escrow transfer already completed today',
          flagsChecked: true,
          transferTriggered: false,
          existingTransferId: existingTransfer.id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initiate escrow transfer
    const { data: transfer, error: transferError } = await supabase
      .from('escrow_transfers')
      .insert({
        amount: escrowAmount,
        reason: `Automatic escrow transfer due to ${activeFlag.reason || 'NLRC regulatory freeze'}`,
        source_wallet: 'hot_wallet',
        destination_wallet: 'escrow_multisig',
        tx_hash: `AUTO_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        status: 'completed',
        regulatory_flag_id: activeFlag.id,
        initiated_by: null, // System-initiated
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transferError) {
      console.error('Transfer creation error:', transferError);
      throw transferError;
    }

    console.log(`Automatic escrow transfer completed: ${transfer.id}, Amount: ₦${escrowAmount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Automatic escrow transfer completed: ₦${escrowAmount.toLocaleString()}`,
        flagsChecked: true,
        transferTriggered: true,
        transfer,
        activeFlag,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Escrow trigger check error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

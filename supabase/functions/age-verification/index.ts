import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, nin } = await req.json();

    if (action === 'verify_age') {
      // TODO: Integrate with NIMC (National Identity Management Commission) API
      // or YouVerify/NIBSS to get NIN data including DOB
      
      // Mock response - in production, this would call actual NIN verification API
      const mockNinData = {
        nin: nin,
        dateOfBirth: '1995-06-15', // Mock DOB
        firstName: 'John',
        lastName: 'Doe',
        verified: true
      };

      // Calculate age
      const dob = new Date(mockNinData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      const isOfLegalAge = age >= 18;

      // Update profile with DOB and verification status
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          date_of_birth: mockNinData.dateOfBirth,
          is_age_verified: isOfLegalAge,
          nin_verification_status: isOfLegalAge ? 'verified' : 'rejected'
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log to admin audit
      await supabase.rpc('log_admin_action', {
        _admin_id: userId,
        _action: 'age_verification',
        _resource_type: 'user',
        _resource_id: userId,
        _status: isOfLegalAge ? 'success' : 'failed',
        _error_message: isOfLegalAge ? null : 'User is under 18 years old'
      });

      if (!isOfLegalAge) {
        return new Response(
          JSON.stringify({ 
            verified: false, 
            age,
            message: 'User must be 18+ to deposit and bet. Account blocked.',
            error: 'UNDERAGE_USER'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      return new Response(
        JSON.stringify({ 
          verified: true, 
          age,
          profile,
          message: 'Age verification successful'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'check_before_deposit') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_age_verified, date_of_birth, nin_verification_status')
        .eq('id', userId)
        .single();

      if (!profile) {
        return new Response(
          JSON.stringify({ error: 'Profile not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      if (!profile.is_age_verified) {
        return new Response(
          JSON.stringify({ 
            allowed: false, 
            message: 'Age verification required before first deposit',
            verificationStatus: profile.nin_verification_status
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      return new Response(
        JSON.stringify({ allowed: true, message: 'User is age-verified' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error: any) {
    console.error('Error in age-verification:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

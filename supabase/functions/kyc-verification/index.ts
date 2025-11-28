import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const YOUVERIFY_API_KEY = Deno.env.get('YOUVERIFY_API_KEY');
const YOUVERIFY_BASE_URL = 'https://api.youverify.co/v2';

interface KycVerificationRequest {
  nin: string;
  selfieUrl: string;
  provider?: 'youverify' | 'nibss';
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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { nin, selfieUrl, provider = 'youverify' }: KycVerificationRequest = await req.json();

    console.log(`KYC verification requested for user ${user.id} via ${provider}`);

    // Check if user already has verified KYC
    const { data: existingKyc } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('verification_status', 'verified')
      .single();

    if (existingKyc) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'User already verified',
          verification: existingKyc,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let verificationResult: any;

    if (provider === 'youverify') {
      // Call YouVerify API
      const youVerifyResponse = await fetch(`${YOUVERIFY_BASE_URL}/identities/ng/nin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${YOUVERIFY_API_KEY}`,
        },
        body: JSON.stringify({
          id: nin,
          isSubjectConsent: true,
          validations: {
            selfie: {
              image: selfieUrl,
              mode: 'liveness',
            },
          },
        }),
      });

      verificationResult = await youVerifyResponse.json();
      console.log('YouVerify response:', JSON.stringify(verificationResult));

      // Parse YouVerify response
      const isVerified = verificationResult?.data?.verified === true &&
        verificationResult?.data?.validations?.selfie?.match === true;

      const verificationScore = verificationResult?.data?.validations?.selfie?.similarity || 0;

      // Store KYC verification result
      const { data: kycRecord, error: kycError } = await supabase
        .from('kyc_verifications')
        .insert({
          user_id: user.id,
          nin,
          selfie_url: selfieUrl,
          verification_status: isVerified ? 'verified' : 'failed',
          provider: 'youverify',
          provider_response: verificationResult,
          verification_score: verificationScore,
          verified_at: isVerified ? new Date().toISOString() : null,
          expires_at: isVerified
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
            : null,
        })
        .select()
        .single();

      if (kycError) {
        console.error('Error storing KYC record:', kycError);
        throw kycError;
      }

      return new Response(
        JSON.stringify({
          success: isVerified,
          message: isVerified ? 'KYC verification successful' : 'KYC verification failed',
          verification: kycRecord,
          score: verificationScore,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (provider === 'nibss') {
      // NIBSS integration (placeholder - requires NIBSS API credentials and documentation)
      console.log('NIBSS verification not yet implemented');
      return new Response(
        JSON.stringify({
          error: 'NIBSS provider not yet implemented. Please use YouVerify.',
        }),
        {
          status: 501,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid provider specified' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in kyc-verification function:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

// Calculate fuzzy match score (0-100)
function calculateFuzzyScore(name1: string, name2: string): number {
  // Normalize names: lowercase, remove special chars, trim whitespace
  const normalize = (str: string) => 
    str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const n1 = normalize(name1);
  const n2 = normalize(name2);

  // Exact match
  if (n1 === n2) return 100;

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(n1, n2);
  const maxLength = Math.max(n1.length, n2.length);
  
  // Convert to similarity score (0-100)
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return Math.max(0, Math.min(100, similarity));
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { withdrawalId, bankName, kycName } = await req.json();
    
    console.log('Validating NUBAN name match:', {
      userId: user.id,
      withdrawalId,
      bankName,
      kycName
    });

    // Calculate fuzzy match score
    const fuzzyScore = calculateFuzzyScore(bankName, kycName);
    
    // Determine match result based on 85% threshold
    let matchResult: 'approved' | 'manual_review' | 'rejected';
    
    if (fuzzyScore >= 85) {
      matchResult = 'approved';
    } else if (fuzzyScore >= 60) {
      matchResult = 'manual_review';
    } else {
      matchResult = 'rejected';
    }

    // Log validation to database
    const { data: validation, error: validationError } = await supabaseClient
      .from('nuban_validations')
      .insert({
        user_id: user.id,
        withdrawal_id: withdrawalId,
        bank_name: bankName,
        kyc_name: kycName,
        fuzzy_score: fuzzyScore,
        match_result: matchResult
      })
      .select()
      .single();

    if (validationError) {
      throw validationError;
    }

    console.log('NUBAN validation complete:', {
      userId: user.id,
      fuzzyScore: fuzzyScore.toFixed(2),
      matchResult
    });

    // If manual review required, create alert for admin
    if (matchResult === 'manual_review') {
      await supabaseClient.rpc('log_admin_action', {
        _admin_id: '00000000-0000-0000-0000-000000000000',
        _action: 'nuban_manual_review_required',
        _resource_type: 'withdrawal',
        _resource_id: withdrawalId,
        _status: 'warning',
        _error_message: `Name mismatch: ${bankName} vs ${kycName} (${fuzzyScore.toFixed(1)}% match)`
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        validation: {
          id: validation.id,
          fuzzyScore: parseFloat(fuzzyScore.toFixed(2)),
          matchResult,
          bankName,
          kycName,
          approved: matchResult === 'approved',
          requiresReview: matchResult === 'manual_review',
          rejected: matchResult === 'rejected'
        },
        message: matchResult === 'approved' ? 
          'Name validation passed' :
          matchResult === 'manual_review' ?
          'Manual review required - name similarity below 85%' :
          'Name validation failed - insufficient similarity'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('NUBAN validation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

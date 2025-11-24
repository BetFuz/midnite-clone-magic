import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface IdempotencyRecord {
  key: string;
  response: any;
  created_at: string;
}

// In-memory cache for idempotency (in production, use Redis or database)
const idempotencyCache = new Map<string, IdempotencyRecord>();

export async function checkIdempotency(
  client: SupabaseClient,
  key: string | null,
  tableName: string = 'idempotency_keys'
): Promise<{ exists: boolean; response?: any }> {
  if (!key) {
    return { exists: false };
  }

  // Check in-memory cache first
  const cached = idempotencyCache.get(key);
  if (cached) {
    const age = Date.now() - new Date(cached.created_at).getTime();
    if (age < 24 * 60 * 60 * 1000) { // 24 hours
      console.log('Idempotency key found in cache:', key);
      return { exists: true, response: cached.response };
    } else {
      idempotencyCache.delete(key);
    }
  }

  // For production: Check database
  // const { data, error } = await client
  //   .from(tableName)
  //   .select('response')
  //   .eq('key', key)
  //   .single();
  // 
  // if (data && !error) {
  //   return { exists: true, response: data.response };
  // }

  return { exists: false };
}

export async function storeIdempotency(
  client: SupabaseClient,
  key: string | null,
  response: any,
  tableName: string = 'idempotency_keys'
): Promise<void> {
  if (!key) return;

  const record: IdempotencyRecord = {
    key,
    response,
    created_at: new Date().toISOString(),
  };

  // Store in memory cache
  idempotencyCache.set(key, record);

  // For production: Store in database
  // await client
  //   .from(tableName)
  //   .insert({
  //     key,
  //     response,
  //     expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  //   });

  console.log('Stored idempotency key:', key);
}

export function generateIdempotencyKey(data: any): string {
  const str = JSON.stringify(data);
  return Array.from(str)
    .reduce((hash, char) => {
      const chr = char.charCodeAt(0);
      hash = ((hash << 5) - hash) + chr;
      return hash | 0;
    }, 0)
    .toString(36);
}

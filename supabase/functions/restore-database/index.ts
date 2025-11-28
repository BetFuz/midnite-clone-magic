import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filename } = await req.json();

    if (!filename) {
      throw new Error('Backup filename is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const encryptionKey = Deno.env.get('BACKUP_ENCRYPTION_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Starting database restore from: ${filename}`);

    // Download encrypted backup from Supabase Storage
    const { data: encryptedData, error: downloadError } = await supabase.storage
      .from('backups')
      .download(filename);

    if (downloadError || !encryptedData) {
      throw new Error(`Failed to download backup: ${downloadError?.message}`);
    }

    // Decrypt backup data
    const encryptedBytes = new Uint8Array(await encryptedData.arrayBuffer());
    const decrypted = await decryptData(encryptedBytes, encryptionKey);
    const backup = JSON.parse(decrypted);

    console.log(`Backup version: ${backup.version}, timestamp: ${backup.timestamp}`);
    console.log(`Tables to restore: ${Object.keys(backup.tables).length}`);

    let restoredTables = 0;
    let restoredRows = 0;
    const errors: string[] = [];

    // Restore each table
    for (const [tableName, tableData] of Object.entries(backup.tables)) {
      try {
        console.log(`Restoring table: ${tableName} (${(tableData as any[]).length} rows)`);

        // Delete existing data (optional - could be made configurable)
        await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Insert backup data in batches
        const batchSize = 100;
        const data = tableData as any[];
        
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          const { error } = await supabase.from(tableName).insert(batch);
          
          if (error) {
            console.error(`Error restoring ${tableName} batch ${i}:`, error);
            errors.push(`${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          } else {
            restoredRows += batch.length;
          }
        }

        restoredTables++;
      } catch (error) {
        console.error(`Failed to restore table ${tableName}:`, error);
        errors.push(`${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Log restore to admin audit log
    await supabase.rpc('log_admin_action', {
      _admin_id: '00000000-0000-0000-0000-000000000000',
      _action: 'backup.restored',
      _resource_type: 'database',
      _resource_id: filename,
      _status: errors.length > 0 ? 'partial' : 'success',
    });

    const result = {
      success: errors.length === 0,
      filename,
      timestamp: backup.timestamp,
      restoredTables,
      restoredRows,
      totalTables: Object.keys(backup.tables).length,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log('Restore completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Restore failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function decryptData(encryptedBytes: Uint8Array, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  // Extract IV and encrypted data
  const iv = encryptedBytes.slice(0, 12);
  const data = encryptedBytes.slice(12);

  // Use Web Crypto API for decryption
  const keyBytes = encoder.encode(key.padEnd(32, '0').slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );

  return decoder.decode(decryptedData);
}

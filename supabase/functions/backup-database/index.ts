import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackupResult {
  success: boolean;
  filename: string;
  size: number;
  tables: number;
  timestamp: string;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const encryptionKey = Deno.env.get('BACKUP_ENCRYPTION_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting database backup...');

    // Get all table names from public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .not('table_name', 'like', 'pg_%');

    if (tablesError) {
      throw new Error(`Failed to fetch tables: ${tablesError.message}`);
    }

    const backup: any = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      tables: {},
    };

    // Backup each table
    for (const table of tables || []) {
      const tableName = table.table_name;
      console.log(`Backing up table: ${tableName}`);

      const { data, error } = await supabase
        .from(tableName)
        .select('*');

      if (error) {
        console.error(`Error backing up ${tableName}:`, error);
        continue;
      }

      backup.tables[tableName] = data;
    }

    // Encrypt backup data
    const backupJson = JSON.stringify(backup);
    const encrypted = await encryptData(backupJson, encryptionKey);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.enc`;

    // Create backup bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'backups');

    if (!bucketExists) {
      await supabase.storage.createBucket('backups', {
        public: false,
        fileSizeLimit: 1024 * 1024 * 1024, // 1GB
      });
    }

    // Upload encrypted backup to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('backups')
      .upload(filename, encrypted, {
        contentType: 'application/octet-stream',
      });

    if (uploadError) {
      throw new Error(`Failed to upload backup: ${uploadError.message}`);
    }

    console.log(`Backup completed: ${filename}`);

    const result: BackupResult = {
      success: true,
      filename,
      size: encrypted.byteLength,
      tables: Object.keys(backup.tables).length,
      timestamp: backup.timestamp,
    };

    // Log backup to admin audit log
    await supabase.rpc('log_admin_action', {
      _admin_id: '00000000-0000-0000-0000-000000000000',
      _action: 'backup.created',
      _resource_type: 'database',
      _resource_id: filename,
      _status: 'success',
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Backup failed:', error);

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

async function encryptData(data: string, key: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  
  // Use Web Crypto API for encryption
  const keyBytes = encoder.encode(key.padEnd(32, '0').slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    dataBytes
  );

  // Combine IV and encrypted data
  const result = new Uint8Array(iv.length + encryptedData.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(encryptedData), iv.length);

  return result;
}

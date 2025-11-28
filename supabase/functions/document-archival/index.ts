import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArchiveRequest {
  documentType: 'bet_ticket' | 'ledger_entry' | 'kyc_document' | 'audit_log';
  documentId: string;
  userId?: string;
  documentData: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { documentType, documentId, userId, documentData }: ArchiveRequest = await req.json();

    console.log(`Archiving document: ${documentType} - ${documentId}`);

    // Calculate retention date (7 years from now)
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() + 7);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${documentType}/${timestamp}-${documentId}.json`;

    // Ensure archives bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'archives');

    if (!bucketExists) {
      await supabase.storage.createBucket('archives', {
        public: false,
        fileSizeLimit: 1024 * 1024 * 100, // 100MB
      });
    }

    // Upload document to storage
    const documentJson = JSON.stringify({
      document_type: documentType,
      document_id: documentId,
      user_id: userId,
      archived_at: new Date().toISOString(),
      retention_until: retentionDate.toISOString(),
      data: documentData,
    }, null, 2);

    const { error: uploadError } = await supabase.storage
      .from('archives')
      .upload(filename, documentJson, {
        contentType: 'application/json',
        cacheControl: '3600',
        upsert: false, // Immutable - cannot overwrite
      });

    if (uploadError) {
      throw new Error(`Failed to upload to storage: ${uploadError.message}`);
    }

    // Create archive record in database
    const { error: dbError } = await supabase
      .from('document_archives')
      .insert({
        document_type: documentType,
        document_id: documentId,
        user_id: userId,
        storage_path: filename,
        retention_until: retentionDate.toISOString().split('T')[0],
        is_immutable: true,
        metadata: {
          original_created_at: documentData.created_at,
          file_size_bytes: new Blob([documentJson]).size,
        },
      });

    if (dbError) {
      console.error('Failed to create archive record:', dbError);
      // Don't throw - document is already stored
    }

    console.log(`Document archived successfully: ${filename}`);

    return new Response(
      JSON.stringify({
        success: true,
        storage_path: filename,
        retention_until: retentionDate.toISOString().split('T')[0],
        message: 'Document archived with 7-year immutable retention',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Document archival failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

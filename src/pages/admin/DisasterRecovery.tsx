import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database, Download, HardDrive, Play, RefreshCw, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Backup {
  name: string;
  created_at: string;
  size: number;
}

const DisasterRecovery = () => {
  const navigate = useNavigate();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingRestore, setTestingRestore] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('backups')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      setBackups(data.map(file => ({
        name: file.name,
        created_at: file.created_at,
        size: file.metadata?.size || 0,
      })));
    } catch (error) {
      console.error('Failed to load backups:', error);
      toast.error('Failed to load backups');
    }
  };

  const runBackup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('backup-database');

      if (error) throw error;

      toast.success(`Backup created: ${data.filename}`, {
        description: `${data.tables} tables backed up (${formatBytes(data.size)})`,
      });

      loadBackups();
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error('Backup failed', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testRestore = async (filename: string) => {
    if (!confirm(`Test restore from backup: ${filename}?\n\nThis will verify the backup integrity without modifying production data.`)) {
      return;
    }

    setTestingRestore(true);
    try {
      const { data, error } = await supabase.functions.invoke('restore-database', {
        body: { filename, dryRun: true },
      });

      if (error) throw error;

      toast.success('Restore test completed', {
        description: `${data.restoredTables} tables verified successfully`,
      });
    } catch (error) {
      console.error('Restore test failed:', error);
      toast.error('Restore test failed', {
        description: error.message,
      });
    } finally {
      setTestingRestore(false);
    }
  };

  const downloadBackup = async (filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('backups')
        .download(filename);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Backup downloaded');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Disaster Recovery & Backups
          </h1>
          <p className="text-muted-foreground mt-2">
            Automated nightly backups with monthly restore testing
          </p>
        </div>
        <Button onClick={runBackup} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Creating Backup...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Run Manual Backup
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
            <p className="text-xs text-muted-foreground">
              Encrypted backups in storage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Backup</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backups.length > 0 ? formatDate(backups[0].created_at).split(',')[0] : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {backups.length > 0 ? formatDate(backups[0].created_at).split(',')[1] : 'No backups yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Daily</div>
            <p className="text-xs text-muted-foreground">
              02:00 WAT (01:00 UTC)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>
            All encrypted database backups stored in Supabase Storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No backups available yet. Run a manual backup or wait for the nightly cron job.
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div
                  key={backup.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{backup.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(backup.created_at)} • {formatBytes(backup.size)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testRestore(backup.name)}
                      disabled={testingRestore}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Test Restore
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadBackup(backup.name)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Nightly Cron Job (Automated)</h3>
            <p className="text-sm text-muted-foreground">
              Configure pg_cron to run backups daily at 02:00 WAT (01:00 UTC):
            </p>
            <pre className="mt-2 p-4 bg-muted rounded-md text-sm overflow-x-auto">
{`SELECT cron.schedule(
  'nightly-database-backup',
  '0 1 * * *', -- 01:00 UTC (02:00 WAT)
  $$
  SELECT net.http_post(
    url:='${window.location.origin}/functions/v1/backup-database',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Monthly Restore Testing</h3>
            <p className="text-sm text-muted-foreground">
              Test the most recent backup every month using the "Test Restore" button above, or automate it:
            </p>
            <pre className="mt-2 p-4 bg-muted rounded-md text-sm overflow-x-auto">
{`SELECT cron.schedule(
  'monthly-restore-test',
  '0 3 1 * *', -- 1st of every month at 03:00 UTC
  $$
  -- Test restore logic here
  $$
);`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Backup Retention</h3>
            <p className="text-sm text-muted-foreground">
              Backups are encrypted using AES-256-GCM with your BACKUP_ENCRYPTION_KEY.
              Consider implementing retention policies to manage storage costs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DisasterRecovery;

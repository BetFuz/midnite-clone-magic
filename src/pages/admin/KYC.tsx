import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface KYCRequest {
  id: string;
  user_id: string;
  tier: string;
  document_type: string;
  submitted_at: string;
  sla_deadline: string;
  status: string;
  escalated_at?: string;
}

const SLA_MINUTES = {
  BRONZE: 30,
  SILVER: 15,
  GOLD: 5,
};

export default function KYC() {
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKYCSubmissions();
  }, []);

  const fetchKYCSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching KYC submissions:', error);
      toast.error('Failed to load KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success("KYC approved successfully");
      fetchKYCSubmissions();
    } catch (error: any) {
      console.error('Error approving KYC:', error);
      toast.error('Failed to approve KYC');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: 'Documents do not meet requirements',
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success("KYC rejected");
      fetchKYCSubmissions();
    } catch (error: any) {
      console.error('Error rejecting KYC:', error);
      toast.error('Failed to reject KYC');
    }
  };

  const getSLAStatus = (submission: KYCRequest) => {
    if (submission.status !== 'pending') return null;
    
    const now = new Date();
    const deadline = new Date(submission.sla_deadline);
    const minutesRemaining = Math.floor((deadline.getTime() - now.getTime()) / 60000);
    
    if (minutesRemaining < 0) {
      return { status: 'breached', minutes: Math.abs(minutesRemaining), color: 'destructive' };
    } else if (minutesRemaining < 5) {
      return { status: 'critical', minutes: minutesRemaining, color: 'warning' };
    }
    return { status: 'ok', minutes: minutesRemaining, color: 'default' };
  };

  const columns: ColumnDef<KYCRequest>[] = [
    {
      accessorKey: "tier",
      header: "Tier",
      cell: ({ row }) => (
        <Badge variant={
          row.original.tier === 'GOLD' ? 'default' : 
          row.original.tier === 'SILVER' ? 'secondary' : 
          'outline'
        }>
          {row.original.tier}
        </Badge>
      ),
    },
    {
      accessorKey: "user_id",
      header: "User ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.user_id.substring(0, 8)}...
        </span>
      ),
    },
    {
      accessorKey: "document_type",
      header: "Document Type",
    },
    {
      accessorKey: "submitted_at",
      header: "Submitted",
      cell: ({ row }) => new Date(row.original.submitted_at).toLocaleString(),
    },
    {
      id: "sla",
      header: "SLA Status",
      cell: ({ row }) => {
        const slaStatus = getSLAStatus(row.original);
        if (!slaStatus) return <span className="text-muted-foreground">-</span>;
        
        return (
          <div className="flex items-center gap-2">
            {slaStatus.status === 'breached' && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            {slaStatus.status === 'critical' && (
              <Clock className="h-4 w-4 text-warning" />
            )}
            <span className={
              slaStatus.status === 'breached' ? 'text-destructive font-semibold' :
              slaStatus.status === 'critical' ? 'text-warning' :
              'text-muted-foreground'
            }>
              {slaStatus.status === 'breached' 
                ? `${slaStatus.minutes}m overdue` 
                : `${slaStatus.minutes}m remaining`}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={
          row.original.status === 'approved' ? 'default' :
          row.original.status === 'rejected' ? 'destructive' :
          row.original.status === 'escalated' ? 'secondary' :
          'secondary'
        }>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleApprove(row.original.id)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(row.original.id)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <p>Loading KYC submissions...</p>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const breachedCount = requests.filter(r => {
    const sla = getSLAStatus(r);
    return sla?.status === 'breached';
  }).length;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">KYC Verification Queue</h1>
            <p className="text-muted-foreground">
              Review and approve identity documents with SLA tracking
            </p>
            <div className="flex gap-4 mt-4">
              <div className="bg-card border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">SLA Breached</p>
                <p className="text-2xl font-bold text-destructive">{breachedCount}</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">SLA Targets</p>
                <p className="text-xs">Gold: 5m, Silver: 15m, Bronze: 30m</p>
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={requests}
            searchKey="user_id"
            searchPlaceholder="Search by user ID..."
          />
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

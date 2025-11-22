import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuditEntry {
  id: string;
  adminId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  status: string;
  createdAt: string;
  ipAddress: string | null;
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // TODO: DEV – add pagination, full-text search
        const { data, error } = await supabase
          .from("admin_audit_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        
        const mappedLogs = (data || []).map((log) => ({
          id: log.id,
          adminId: log.admin_id,
          action: log.action,
          resourceType: log.resource_type,
          resourceId: log.resource_id,
          status: log.status,
          createdAt: log.created_at,
          ipAddress: log.ip_address,
        }));
        
        setLogs(mappedLogs);
      } catch (error: any) {
        toast.error("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const columns: ColumnDef<AuditEntry>[] = [
    {
      accessorKey: "action",
      header: "Action",
    },
    {
      accessorKey: "resourceType",
      header: "Resource",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === "success" ? "default" : "destructive";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "adminId",
      header: "Admin ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.adminId.substring(0, 8)}...</span>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
    },
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
  ];

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Audit Log</h1>
            <p className="text-muted-foreground">
              Immutable log of all administrative actions
            </p>
          </div>

          <DataTable
            columns={columns}
            data={logs}
            searchKey="action"
            searchPlaceholder="Search by action..."
          />
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

import { useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface KYCRequest {
  id: string;
  userId: string;
  email: string;
  documentType: string;
  submittedAt: string;
  status: string;
}

const mockRequests: KYCRequest[] = [
  {
    id: "1",
    userId: "user123",
    email: "user@example.com",
    documentType: "Passport",
    submittedAt: "2025-01-10T14:30:00Z",
    status: "pending",
  },
  // TODO: DEV – fetch from kyc_submissions table
];

export default function KYC() {
  const [requests] = useState<KYCRequest[]>(mockRequests);

  const handleApprove = (id: string) => {
    // TODO: DEV – update status, send email, enable withdrawals
    toast.success("KYC approved");
  };

  const handleReject = (id: string) => {
    // TODO: DEV – update status, send email with reason
    toast.success("KYC rejected");
  };

  const columns: ColumnDef<KYCRequest>[] = [
    {
      accessorKey: "email",
      header: "User",
    },
    {
      accessorKey: "documentType",
      header: "Document Type",
    },
    {
      accessorKey: "submittedAt",
      header: "Submitted",
      cell: ({ row }) => new Date(row.original.submittedAt).toLocaleString(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
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
        </div>
      ),
    },
  ];

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">KYC Verification Queue</h1>
            <p className="text-muted-foreground">Review and approve identity documents</p>
          </div>

          <DataTable
            columns={columns}
            data={requests}
            searchKey="email"
            searchPlaceholder="Search by email..."
          />
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

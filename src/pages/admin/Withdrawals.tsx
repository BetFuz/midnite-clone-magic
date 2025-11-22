import { useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Withdrawal {
  id: string;
  userId: string;
  email: string;
  amount: number;
  method: string;
  requestedAt: string;
  status: string;
}

const mockWithdrawals: Withdrawal[] = [
  {
    id: "1",
    userId: "user123",
    email: "user@example.com",
    amount: 50000,
    method: "Bank Transfer",
    requestedAt: "2025-01-10T09:00:00Z",
    status: "pending",
  },
  // TODO: DEV – fetch from withdrawal_requests table
];

export default function Withdrawals() {
  const [withdrawals] = useState<Withdrawal[]>(mockWithdrawals);

  const handleApprove = (id: string) => {
    // TODO: DEV – create txn, call payment API, update balance, log audit
    toast.success("Withdrawal approved");
  };

  const handleReject = (id: string) => {
    // TODO: DEV – update status, refund balance, send email with note
    toast.success("Withdrawal rejected");
  };

  const columns: ColumnDef<Withdrawal>[] = [
    {
      accessorKey: "email",
      header: "User",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => `₦${row.original.amount.toLocaleString()}`,
    },
    {
      accessorKey: "method",
      header: "Method",
    },
    {
      accessorKey: "requestedAt",
      header: "Requested",
      cell: ({ row }) => new Date(row.original.requestedAt).toLocaleString(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => handleApprove(row.original.id)}
            disabled={row.original.status !== "pending"}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleReject(row.original.id)}
            disabled={row.original.status !== "pending"}
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
            <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
            <p className="text-muted-foreground">Process pending withdrawal requests</p>
          </div>

          <DataTable
            columns={columns}
            data={withdrawals}
            searchKey="email"
            searchPlaceholder="Search by email..."
          />
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

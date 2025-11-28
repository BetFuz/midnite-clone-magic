import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LedgerEntry {
  id: string;
  entry_number: number;
  created_at: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  balance_before: number;
  balance_after: number;
  reference_id: string | null;
  reference_type: string | null;
  description: string;
  metadata: any;
  entry_hash: string;
}

export default function Ledger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchLedger();
  }, [filter]);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('ledger_entries')
        .select('*')
        .order('entry_number', { ascending: false })
        .limit(500);

      if (filter !== "all") {
        query = query.eq('transaction_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching ledger:', error);
      toast.error('Failed to fetch ledger entries');
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    const headers = ['Entry #', 'Date', 'User ID', 'Type', 'Amount', 'Currency', 'Balance Before', 'Balance After', 'Description', 'Hash'];
    const rows = entries.map(e => [
      e.entry_number,
      new Date(e.created_at).toISOString(),
      e.user_id,
      e.transaction_type,
      e.amount,
      e.currency,
      e.balance_before,
      e.balance_after,
      e.description,
      e.entry_hash
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Ledger exported successfully');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'default';
      case 'withdrawal': return 'secondary';
      case 'bet_placement': return 'outline';
      case 'bet_win': return 'success';
      case 'bet_loss': return 'destructive';
      case 'bonus_credit': return 'default';
      case 'commission_earned': return 'default';
      default: return 'secondary';
    }
  };

  const columns: ColumnDef<LedgerEntry>[] = [
    {
      accessorKey: "entry_number",
      header: "#",
      cell: ({ row }) => <span className="font-mono text-xs">#{row.original.entry_number}</span>,
    },
    {
      accessorKey: "created_at",
      header: "Date/Time",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
    {
      accessorKey: "transaction_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={getTypeColor(row.original.transaction_type) as any}>
          {row.original.transaction_type.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.original.amount;
        const color = amount >= 0 ? 'text-green-600' : 'text-red-600';
        return <span className={`font-bold ${color}`}>
          {amount >= 0 ? '+' : ''}{row.original.currency} {amount.toLocaleString()}
        </span>;
      },
    },
    {
      accessorKey: "balance_after",
      header: "Balance After",
      cell: ({ row }) => `${row.original.currency} ${row.original.balance_after.toLocaleString()}`,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-md truncate text-sm">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "entry_hash",
      header: "Hash",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.entry_hash.slice(0, 12)}...
        </span>
      ),
    },
  ];

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Immutable Ledger</h1>
              <p className="text-muted-foreground">
                Complete audit trail of all financial transactions
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchLedger} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="default" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            {['all', 'deposit', 'withdrawal', 'bet_placement', 'bet_win', 'bet_loss', 'bonus_credit', 'commission_earned'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f.replace(/_/g, ' ').toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{entries.length.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deposits</p>
                <p className="text-2xl font-bold text-green-600">
                  ₦{entries.filter(e => e.transaction_type === 'deposit').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                <p className="text-2xl font-bold text-red-600">
                  ₦{Math.abs(entries.filter(e => e.transaction_type === 'withdrawal').reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bets</p>
                <p className="text-2xl font-bold">
                  ₦{Math.abs(entries.filter(e => e.transaction_type === 'bet_placement').reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={entries}
            searchKey="description"
            searchPlaceholder="Search transactions..."
          />

          <div className="text-xs text-muted-foreground p-4 bg-muted/50 rounded-lg">
            <p className="font-semibold mb-2">🔒 Immutable Ledger Security</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All entries are cryptographically hashed and cannot be modified or deleted</li>
              <li>Each entry includes SHA-256 hash for tamper detection</li>
              <li>Sequential entry numbers ensure chronological integrity</li>
              <li>Full audit trail maintained for regulatory compliance (NLRC)</li>
            </ul>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

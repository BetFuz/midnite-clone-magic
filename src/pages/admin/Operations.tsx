import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Ban, DollarSign, Download, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Operations() {
  const [searchType, setSearchType] = useState("email");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [voidBetId, setVoidBetId] = useState("");
  const [voidReason, setVoidReason] = useState("");

  const [payoutUserId, setPayoutUserId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutReason, setPayoutReason] = useState("");
  const [payoutType, setPayoutType] = useState("manual_payout");

  const handleUserSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter search term");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-search', {
        body: { searchTerm, searchType },
      });

      if (error) throw error;

      setSearchResults(data.users || []);
      toast.success(`Found ${data.users?.length || 0} users`);
    } catch (error: any) {
      console.error('Error searching users:', error);
      toast.error(error.message || 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleVoidBet = async () => {
    if (!voidBetId || !voidReason) {
      toast.error("Please enter bet ID and reason");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-void-bet', {
        body: { betSlipId: voidBetId, reason: voidReason },
      });

      if (error) throw error;

      toast.success(`Bet voided. Refunded: ₦${data.refundedAmount}`);
      setVoidBetId("");
      setVoidReason("");
    } catch (error: any) {
      console.error('Error voiding bet:', error);
      toast.error(error.message || 'Failed to void bet');
    } finally {
      setLoading(false);
    }
  };

  const handleManualPayout = async () => {
    if (!payoutUserId || !payoutAmount || !payoutReason) {
      toast.error("Please fill all payout fields");
      return;
    }

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manual-payout', {
        body: { 
          userId: payoutUserId, 
          amount, 
          reason: payoutReason,
          transactionType: payoutType 
        },
      });

      if (error) throw error;

      toast.success(`Payout processed: ₦${data.amount}. New balance: ₦${data.newBalance}`);
      setPayoutUserId("");
      setPayoutAmount("");
      setPayoutReason("");
    } catch (error: any) {
      console.error('Error processing payout:', error);
      toast.error(error.message || 'Failed to process payout');
    } finally {
      setLoading(false);
    }
  };

  const handleExportLedger = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-export-ledger', {
        body: { 
          format: 'csv',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          endDate: new Date().toISOString()
        },
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ledger_export_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Ledger exported successfully");
    } catch (error: any) {
      console.error('Error exporting ledger:', error);
      toast.error(error.message || 'Failed to export ledger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Operations</h1>
          <p className="text-muted-foreground">Manage users, bets, and payouts</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Users
              </CardTitle>
              <CardDescription>Search users by email, phone, name, or ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Type</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="id">User ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search Term</Label>
                <Input 
                  placeholder={`Enter ${searchType}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
                />
              </div>

              <Button onClick={handleUserSearch} disabled={loading} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>

              {searchResults.length > 0 && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Bets</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{user.full_name || 'N/A'}</div>
                              <div className="text-muted-foreground">{user.email}</div>
                              <div className="text-xs text-muted-foreground">{user.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>₦{Number(user.balance).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Total: {user.totalBets}</div>
                              <div className="text-muted-foreground">Pending: {user.pendingBets}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Void Bet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                Void Bet
              </CardTitle>
              <CardDescription>Cancel bet and refund stake (Superadmin only)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bet Slip ID</Label>
                <Input 
                  placeholder="Enter bet slip UUID..."
                  value={voidBetId}
                  onChange={(e) => setVoidBetId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea 
                  placeholder="Why is this bet being voided?"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleVoidBet} disabled={loading} variant="destructive" className="w-full">
                <Ban className="mr-2 h-4 w-4" />
                Void Bet
              </Button>
            </CardContent>
          </Card>

          {/* Manual Payout */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Manual Payout
              </CardTitle>
              <CardDescription>Issue manual payout to user (Superadmin only)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input 
                  placeholder="Enter user UUID..."
                  value={payoutUserId}
                  onChange={(e) => setPayoutUserId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Amount (₦)</Label>
                <Input 
                  type="number"
                  placeholder="0.00"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <Select value={payoutType} onValueChange={setPayoutType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual_payout">Manual Payout</SelectItem>
                    <SelectItem value="compensation">Compensation</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea 
                  placeholder="Why is this payout being issued?"
                  value={payoutReason}
                  onChange={(e) => setPayoutReason(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleManualPayout} disabled={loading} className="w-full">
                <DollarSign className="mr-2 h-4 w-4" />
                Process Payout
              </Button>
            </CardContent>
          </Card>

          {/* Export Ledger */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Ledger
              </CardTitle>
              <CardDescription>Download ledger entries as CSV (Last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportLedger} disabled={loading} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

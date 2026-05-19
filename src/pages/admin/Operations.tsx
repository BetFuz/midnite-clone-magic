import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { KillSwitch } from "@/components/admin/KillSwitch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api/admin";
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
      const data = await adminApi.getUsers({ search: searchTerm, limit: 20 });
      const users = Array.isArray(data) ? data : (data?.users ?? []);
      setSearchResults(users);
      if (users.length === 0) toast.info("No users found");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVoidBet = async () => {
    if (!voidBetId.trim() || !voidReason.trim()) {
      toast.error("Bet ID and reason are required");
      return;
    }
    setLoading(true);
    try {
      await adminApi.voidBet(voidBetId.trim(), voidReason.trim());
      toast.success("Bet voided successfully");
      setVoidBetId("");
      setVoidReason("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Failed to void bet");
    } finally {
      setLoading(false);
    }
  };

  const handleManualPayout = async () => {
    if (!payoutUserId.trim() || !payoutAmount || !payoutReason.trim()) {
      toast.error("User ID, amount and reason are required");
      return;
    }
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }
    setLoading(true);
    try {
      await adminApi.creditUser(payoutUserId.trim(), amount, `[${payoutType}] ${payoutReason}`);
      toast.success(`₦${amount.toLocaleString()} credited to user`);
      setPayoutUserId("");
      setPayoutAmount("");
      setPayoutReason("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Payout failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExportLedger = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getTransactions({ limit: 1000 });
      const rows = Array.isArray(data) ? data : (data?.transactions ?? []);
      const csv = [
        "id,userId,type,amount,status,createdAt",
        ...rows.map((r: any) => `"${r.id}","${r.userId}","${r.type}","${r.amount}","${r.status}","${r.createdAt}"`),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ledger_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Ledger exported successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Export failed");
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

        <KillSwitch />

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
                  onKeyDown={(e) => e.key === "Enter" && handleUserSearch()}
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
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-muted-foreground">{user.email}</div>
                              <div className="text-xs text-muted-foreground">{user.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>₦{Number(user.balance || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user.status === "active" ? "bg-green-100 text-green-700" :
                              user.status === "suspended" ? "bg-red-100 text-red-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {user.status || "active"}
                            </span>
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
                Manual Payout / Credit
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
                  placeholder="0"
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
              <CardDescription>Download transaction ledger as CSV</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportLedger} disabled={loading} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                {loading ? "Exporting..." : "Download CSV"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency } from "@/lib/currency";
import { ArrowUpRight, ArrowDownLeft, Filter, Download, Search, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Transactions = () => {
  const [filter, setFilter] = useState<"all" | "deposits" | "withdrawals">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();

  // Mock transaction data
  const transactions = [
    { id: "TXN001", type: "deposit", method: "Mobile Money", amount: 25000, status: "completed", date: "2025-01-09 14:32", reference: "DEP-2025-001" },
    { id: "TXN002", type: "deposit", method: "Bank Transfer", amount: 100000, status: "completed", date: "2025-01-08 09:15", reference: "DEP-2025-002" },
    { id: "TXN003", type: "deposit", method: "Debit Card", amount: 50000, status: "pending", date: "2025-01-07 18:45", reference: "DEP-2025-003" },
    { id: "WTH001", type: "withdrawal", method: "Bank Transfer", amount: 50000, status: "completed", date: "2025-01-08 10:20", reference: "WTH-2025-001" },
    { id: "WTH002", type: "withdrawal", method: "Mobile Money", amount: 25000, status: "processing", date: "2025-01-09 16:15", reference: "WTH-2025-002" },
    { id: "WTH003", type: "withdrawal", method: "PayPal", amount: 75000, status: "pending", date: "2025-01-09 18:30", reference: "WTH-2025-003" },
  ];

  // Apply all filters
  const filteredTransactions = transactions.filter(t => {
    if (filter !== "all" && t.type !== filter.slice(0, -1)) return false;
    if (methodFilter !== "all" && t.method !== methodFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchQuery && !t.reference.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "processing": return "secondary";
      case "pending": return "outline";
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <ArrowDownLeft className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Deposits</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(175000)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/20 rounded-lg">
                    <ArrowUpRight className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(150000)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/20 rounded-lg">
                    <Filter className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Balance</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(25000)}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deposits">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Advanced Filters */}
            <Card className="p-6 bg-card border-border mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Advanced Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by reference..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "From Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </Card>

            {/* Transactions List */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Transaction History ({filteredTransactions.length} results)
              </h3>
              {filteredTransactions.length > 0 ? (
                <div className="space-y-4">
                  {filteredTransactions.map((txn, index) => (
                  <div key={txn.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          txn.type === "deposit" 
                            ? "bg-primary/10" 
                            : "bg-destructive/10"
                        }`}>
                          {txn.type === "deposit" ? (
                            <ArrowDownLeft className={`h-5 w-5 ${
                              txn.type === "deposit" ? "text-primary" : "text-destructive"
                            }`} />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground capitalize">{txn.type}</p>
                            <Badge variant="secondary" className="text-xs">
                              {txn.method}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{txn.date}</p>
                          <p className="text-xs text-muted-foreground">Ref: {txn.reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          txn.type === "deposit" ? "text-success" : "text-destructive"
                        }`}>
                          {txn.type === "deposit" ? "+" : "-"}{formatCurrency(txn.amount)}
                        </p>
                        <Badge variant={getStatusColor(txn.status)} className="text-xs mt-1">
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                    {index !== filteredTransactions.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No transactions found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Transactions;

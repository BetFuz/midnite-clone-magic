import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { AccountNav } from "@/components/account/AccountNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency } from "@/lib/currency";
import { Search, Calendar as CalendarIcon, Download, Filter, TrendingUp, Trophy, Target } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const BettingHistory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sportFilter, setSportFilter] = useState("all");
  const [betTypeFilter, setBetTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Mock betting history data - ready for n8n integration
  const bets = [
    { 
      id: "159104", 
      ticketId: "159104",
      date: "10/11 07:04", 
      event: "Multiple Bet", 
      sport: "Football",
      betType: "Multiple",
      selections: 8,
      stake: 50000, 
      odds: 337.00, 
      status: "won", 
      returns: 17355407.30,
      profitLoss: 17305407.30
    },
    { 
      id: "158956", 
      ticketId: "158956",
      date: "09/11 19:31", 
      event: "Multiple Bet", 
      sport: "Football",
      betType: "Multiple",
      selections: 7,
      stake: 50000, 
      odds: 336.77, 
      status: "running", 
      returns: null,
      profitLoss: null,
      potentialWin: 17343655.00
    },
    { 
      id: "158723", 
      ticketId: "158723",
      date: "08/11 14:20", 
      event: "Man United vs Liverpool", 
      sport: "Football",
      betType: "Single",
      selections: 1,
      stake: 10000, 
      odds: 2.35, 
      status: "lost", 
      returns: 0,
      profitLoss: -10000
    },
    { 
      id: "158601", 
      ticketId: "158601",
      date: "07/11 18:45", 
      event: "Multiple Bet", 
      sport: "Basketball",
      betType: "Multiple",
      selections: 5,
      stake: 25000, 
      odds: 45.60, 
      status: "won", 
      returns: 1254000.00,
      profitLoss: 1229000.00
    },
    { 
      id: "158450", 
      ticketId: "158450",
      date: "06/11 12:15", 
      event: "Lakers vs Warriors", 
      sport: "Basketball",
      betType: "Single",
      selections: 1,
      stake: 15000, 
      odds: 1.92, 
      status: "lost", 
      returns: 0,
      profitLoss: -15000
    },
    { 
      id: "158301", 
      ticketId: "158301",
      date: "05/11 20:30", 
      event: "System Bet", 
      sport: "Tennis",
      betType: "System",
      selections: 6,
      stake: 30000, 
      odds: 12.45, 
      status: "won", 
      returns: 387500.00,
      profitLoss: 357500.00
    },
  ];

  // Calculate summary statistics
  const totalBets = bets.length;
  const wonBets = bets.filter(b => b.status === "won").length;
  const lostBets = bets.filter(b => b.status === "lost").length;
  const runningBets = bets.filter(b => b.status === "running").length;
  const totalStaked = bets.reduce((sum, b) => sum + b.stake, 0);
  const totalReturns = bets.reduce((sum, b) => sum + (b.returns || 0), 0);
  const totalProfitLoss = bets.reduce((sum, b) => sum + (b.profitLoss || 0), 0);
  const winRate = totalBets > 0 ? ((wonBets / (totalBets - runningBets)) * 100).toFixed(1) : "0.0";

  // Filter bets
  const filteredBets = bets.filter(bet => {
    if (statusFilter !== "all" && bet.status !== statusFilter) return false;
    if (sportFilter !== "all" && bet.sport !== sportFilter) return false;
    if (betTypeFilter !== "all" && bet.betType !== betTypeFilter) return false;
    if (searchQuery && !bet.event.toLowerCase().includes(searchQuery.toLowerCase()) && !bet.id.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Betting History</h1>
                <p className="text-muted-foreground">Complete record of all your bets</p>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>

            <AccountNav />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Bets</p>
                    <p className="text-2xl font-bold text-foreground">{totalBets}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Trophy className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="text-2xl font-bold text-success">{winRate}%</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <TrendingUp className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Staked</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(totalStaked)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${totalProfitLoss >= 0 ? 'bg-success/10' : 'bg-destructive/10'} rounded-lg`}>
                    <TrendingUp className={`h-5 w-5 ${totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profit/Loss</p>
                    <p className={`text-xl font-bold ${totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(totalProfitLoss)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-6 bg-card border-border mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="Football">Football</SelectItem>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                    <SelectItem value="Tennis">Tennis</SelectItem>
                    <SelectItem value="Cricket">Cricket</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={betTypeFilter} onValueChange={setBetTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bet Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Multiple">Multiple</SelectItem>
                    <SelectItem value="System">System</SelectItem>
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

            {/* Bets List */}
            <div className="space-y-4">
              {filteredBets.map((bet) => (
                <Card 
                  key={bet.id} 
                  className="p-5 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/bet-ticket/${bet.ticketId}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-muted-foreground">#{bet.id}</span>
                        <Badge 
                          className={
                            bet.status === 'won' 
                              ? 'bg-success text-success-foreground' 
                              : bet.status === 'lost'
                              ? 'bg-destructive text-destructive-foreground'
                              : 'bg-primary/20 text-primary border-primary/30'
                          }
                        >
                          {bet.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{bet.betType}</Badge>
                        <Badge variant="secondary">{bet.sport}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{bet.event}</h3>
                      <p className="text-sm text-muted-foreground">{bet.date} • {bet.selections} selection{bet.selections > 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">
                        {bet.status === "running" ? "Potential Win" : "Returns"}
                      </div>
                      <div className={`text-2xl font-bold ${
                        bet.status === "won" ? "text-success" : 
                        bet.status === "lost" ? "text-destructive" : 
                        "text-foreground"
                      }`}>
                        {bet.status === "running" && bet.potentialWin 
                          ? formatCurrency(bet.potentialWin)
                          : bet.returns !== null 
                          ? formatCurrency(bet.returns) 
                          : "-"}
                      </div>
                      {bet.profitLoss !== null && bet.status !== "running" && (
                        <div className={`text-sm font-semibold ${bet.profitLoss >= 0 ? "text-success" : "text-destructive"}`}>
                          {bet.profitLoss >= 0 ? "+" : ""}{formatCurrency(bet.profitLoss)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm border-t border-border pt-3">
                    <div>
                      <span className="text-muted-foreground">Stake:</span>{" "}
                      <span className="font-semibold text-foreground">{formatCurrency(bet.stake)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Odds:</span>{" "}
                      <span className="font-semibold text-odds">{bet.odds.toFixed(2)}</span>
                    </div>
                    {bet.status === "won" && (
                      <div>
                        <span className="text-muted-foreground">Profit:</span>{" "}
                        <span className="font-semibold text-success">{formatCurrency(bet.profitLoss!)}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {filteredBets.length === 0 && (
              <Card className="p-12 bg-card border-border text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No bets found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search query</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BettingHistory;

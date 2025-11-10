import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Trophy } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const BetTickets = () => {
  const navigate = useNavigate();
  const [showWinModal, setShowWinModal] = useState(false);
  const [selectedWin, setSelectedWin] = useState<any>(null);

  const tickets = [
    {
      id: "159104",
      type: "Multiple",
      status: "won",
      stake: 50000,
      odds: 337.00,
      bonus: 505497.30,
      potentialWin: 17355407.30,
      actualWin: 17355407.30,
      date: "10/11 07:04",
      selections: 8,
      percentile: 97,
    },
    {
      id: "158956",
      type: "Multiple",
      status: "running",
      stake: 50000,
      odds: 336.77,
      bonus: 505155.00,
      potentialWin: 17343655.00,
      date: "09/11 19:31",
      selections: 7,
    },
    {
      id: "158723",
      type: "Single",
      status: "lost",
      stake: 10000,
      odds: 2.35,
      potentialWin: 23500,
      date: "08/11 14:20",
      selections: 1,
    },
    {
      id: "158601",
      type: "Multiple",
      status: "won",
      stake: 25000,
      odds: 45.60,
      bonus: 114000.00,
      potentialWin: 1254000.00,
      actualWin: 1254000.00,
      date: "07/11 18:45",
      selections: 5,
      percentile: 85,
    },
  ];

  const handleTicketClick = (ticket: any) => {
    if (ticket.status === "won") {
      setSelectedWin(ticket);
      setShowWinModal(true);
    } else {
      navigate(`/bet-ticket/${ticket.id}`);
    }
  };

  const handleRebet = (ticketId: string) => {
    toast({
      title: "Bet Copied",
      description: `Ticket #${ticketId} selections added to bet slip`,
    });
  };

  const filterTickets = (status: string) => {
    if (status === "all") return tickets;
    return tickets.filter(t => t.status === status);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">My Bet Tickets</h1>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All Bets</TabsTrigger>
              <TabsTrigger value="running">Running</TabsTrigger>
              <TabsTrigger value="won">Won</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
            </TabsList>

            {["all", "running", "won", "lost"].map((status) => (
              <TabsContent key={status} value={status} className="space-y-4">
                {filterTickets(status).map((ticket) => (
                  <Card 
                    key={ticket.id}
                    className="p-5 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleTicketClick(ticket)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">Ticket ID: {ticket.id}</span>
                          <Badge 
                            className={
                              ticket.status === "won" 
                                ? "bg-success text-success-foreground" 
                                : ticket.status === "running"
                                ? "bg-primary/20 text-primary border-primary/30"
                                : "bg-destructive/20 text-destructive border-destructive/30"
                            }
                          >
                            {ticket.status === "won" && <Trophy className="h-3 w-3 mr-1" />}
                            {ticket.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">{ticket.date}</div>
                        <div className="text-lg font-bold text-foreground">{ticket.type}</div>
                        <div className="text-sm text-muted-foreground">{ticket.selections} selections</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Total Stake</div>
                        <div className="text-2xl font-bold text-foreground">{formatCurrency(ticket.stake)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-border">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Total Odds</div>
                        <div className="text-lg font-bold text-odds">{ticket.odds.toFixed(2)}</div>
                      </div>
                      {ticket.bonus && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Max Bonus</div>
                          <div className="text-lg font-bold text-primary">{formatCurrency(ticket.bonus)}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {ticket.status === "won" ? "Total Won" : "Pot. Win"}
                        </div>
                        <div className={`text-lg font-bold ${ticket.status === "won" ? "text-success" : "text-foreground"}`}>
                          {formatCurrency(ticket.status === "won" ? ticket.actualWin : ticket.potentialWin)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/bet-ticket/${ticket.id}`);
                        }}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-success text-success-foreground hover:bg-success/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRebet(ticket.id);
                        }}
                      >
                        Rebet
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>

      {/* Win Celebration Modal */}
      <Dialog open={showWinModal} onOpenChange={setShowWinModal}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-b from-background via-primary/5 to-primary/10">
          <DialogHeader className="sr-only">
            <DialogTitle>Congratulations on Your Win!</DialogTitle>
            <DialogDescription>You've won more than most users</DialogDescription>
          </DialogHeader>
          <div className="relative p-8 text-center">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                You have won more than <span className="text-success font-bold text-lg">{selectedWin?.percentile}%</span> of all users.
              </p>
              <h2 className="text-5xl font-black text-foreground mb-4 tracking-tight">
                YOU WON
              </h2>
              <div className="text-4xl font-black text-success mb-6">
                {selectedWin && formatCurrency(selectedWin.actualWin)}
              </div>
            </div>

            {/* Trophy Icon */}
            <div className="relative mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <Trophy className="h-32 w-32 text-primary relative z-10" strokeWidth={1.5} />
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Verify Code: <span className="text-success font-semibold">Bet Details</span>
            </p>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowWinModal(false);
                  navigate(`/bet-ticket/${selectedWin?.id}`);
                }}
              >
                Details
              </Button>
              <Button 
                className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                onClick={() => {
                  toast({
                    title: "Share Your Win!",
                    description: "Sharing feature coming soon!",
                  });
                }}
              >
                Show Off
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BetTickets;

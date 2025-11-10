import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Home, Copy, Share2, Info, Clock, CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const BetTicketDetail = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [privateNote, setPrivateNote] = useState("");

  // Mock ticket data - in real app, fetch by ticketId
  const ticket = {
    id: "159104",
    type: "Multiple",
    status: "won",
    stake: 50000,
    odds: 337.00,
    bonus: 505497.30,
    potentialWin: 17355407.30,
    actualWin: 17355407.30,
    returnAmount: 17355407.30,
    date: "10/11 07:04",
    bookingCode: "XY7K9L2M",
    matches: [
      {
        id: "12934",
        time: "10/11 16:30",
        home: "San Antonio Unido",
        away: "CD Concon National FC",
        pick: "1:3",
        odds: 19.39,
        market: "Correct Score",
        outcome: "1:3",
        status: "won",
      },
      {
        id: "15864",
        time: "10/11 16:30",
        home: "FC Dunav 2010",
        away: "FC Fratria Varna",
        pick: "2:0",
        odds: 17.38,
        market: "Correct Score",
        outcome: "2:0",
        status: "won",
      },
    ],
  };

  const handleCopyBookingCode = () => {
    navigator.clipboard.writeText(ticket.bookingCode);
    toast({
      title: "Copied!",
      description: "Booking code copied to clipboard",
    });
  };

  const handleShare = () => {
    toast({
      title: "Share Ticket",
      description: "Sharing feature coming soon!",
    });
  };

  const handleRebet = () => {
    toast({
      title: "Bet Copied",
      description: "Selections added to your bet slip",
    });
  };

  const handleAddNote = () => {
    setShowNoteDialog(false);
    toast({
      title: "Note Saved",
      description: "Your private note has been saved",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Red Header Bar */}
      <div className="bg-destructive text-white py-4 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/account/bet-tickets")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Ticket Details</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/")}
            >
              <Home className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-8rem)]">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Ticket Summary Card */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Ticket ID: <span className="font-mono">{ticket.id}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-foreground">{ticket.type}</h2>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-success border-success hover:bg-success/10"
                    >
                      Edit Bet
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">{ticket.date}</div>
                  <Badge className="bg-success text-success-foreground">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    WON
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 py-4 border-t border-b border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Betfuz Return</span>
                  <span className="text-2xl font-bold text-success">
                    {formatCurrency(ticket.returnAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Stake</span>
                  <span className="text-xl font-bold text-foreground">
                    {formatCurrency(ticket.stake)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Odds</span>
                  <span className="text-xl font-bold text-odds">{ticket.odds.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Max Bonus</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(ticket.bonus)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Pot. Win</span>
                  <span className="text-xl font-bold text-foreground">
                    {formatCurrency(ticket.potentialWin)}
                  </span>
                </div>
              </div>

              {/* Private Note Section */}
              <div className="mt-4 py-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Betfuz Note</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowNoteDialog(true)}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    <Badge className="bg-white/20 text-white mr-2">NEW</Badge>
                    Add Private Note
                  </Button>
                </div>
              </div>

              {/* Booking Code */}
              <div className="mt-4 py-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Booking Code</div>
                    <div className="flex items-center gap-3">
                      <Input
                        value={ticket.bookingCode}
                        readOnly
                        className="font-mono text-lg font-bold w-48"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCopyBookingCode}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="bg-success text-success-foreground hover:bg-success/90"
                    onClick={handleRebet}
                  >
                    Rebet
                  </Button>
                </div>
              </div>
            </Card>

            {/* Match Details */}
            {ticket.matches.map((match, index) => (
              <Card key={match.id} className="p-5 bg-card border-border">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`mt-1 ${match.status === "won" ? "text-success" : "text-destructive"}`}>
                    {match.status === "won" ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <XCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-2">
                      Game ID: {match.id} | {match.time}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {match.home} <span className="text-muted-foreground">v</span> {match.away}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-success/20 text-success">
                        <Clock className="h-3 w-3 mr-1" />
                        Match Tracker
                      </Badge>
                      <span className="text-xs text-muted-foreground">13</span>
                    </div>

                    <div className="bg-success/10 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Pick:</span>
                        <span className="text-base font-bold text-foreground">
                          {match.pick} @{match.odds}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Market:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-foreground">{match.market}</span>
                          {match.status === "won" && (
                            <Badge className="bg-primary/20 text-primary text-xs">
                              Bore Draw 0:0
                            </Badge>
                          )}
                        </div>
                      </div>
                      {match.outcome && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Outcome:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-success">{match.outcome}</span>
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Footer Info */}
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Number of Bets: {ticket.matches.length}</span>
                <Button variant="link" className="text-success">
                  Bet Details
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>

      {/* Private Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Private Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Textarea
              placeholder="Add your private notes about this bet..."
              value={privateNote}
              onChange={(e) => setPrivateNote(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowNoteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                onClick={handleAddNote}
              >
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BetTicketDetail;

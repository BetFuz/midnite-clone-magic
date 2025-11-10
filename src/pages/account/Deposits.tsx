import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreditCard, Smartphone, Building2, Wallet, Clock, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Deposits = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState("");
  
  // Mock user location - simulating Nigeria for regional payment detection
  const userRegion = "NG"; // Mock: Could be "US", "EU", "NG", etc.

  const methods = [
    { name: "Debit Card", icon: CreditCard, limits: `${formatCurrency(500)} - ${formatCurrency(500000)}`, instant: true, min: 500, max: 500000, regions: ["NG", "US", "EU"] },
    { name: "Mobile Money / Airtime", icon: Smartphone, limits: `${formatCurrency(100)} - ${formatCurrency(50000)}`, instant: true, min: 100, max: 50000, regions: ["NG"], featured: true },
    { name: "Bank Transfer", icon: Building2, limits: `${formatCurrency(2500)} - ${formatCurrency(2500000)}`, instant: false, min: 2500, max: 2500000, regions: ["NG", "US", "EU"] },
    { name: "PayPal", icon: Wallet, limits: `${formatCurrency(500)} - ${formatCurrency(250000)}`, instant: true, min: 500, max: 250000, regions: ["US", "EU"] },
  ].filter(method => method.regions.includes(userRegion));

  // Mock transaction history
  const recentTransactions = [
    { id: "TXN001", method: "Mobile Money", amount: 25000, status: "completed", date: "2025-01-09 14:32" },
    { id: "TXN002", method: "Bank Transfer", amount: 100000, status: "completed", date: "2025-01-08 09:15" },
    { id: "TXN003", method: "Debit Card", amount: 50000, status: "pending", date: "2025-01-07 18:45" },
  ];

  const handleDeposit = (methodName: string) => {
    setSelectedMethod(methodName);
    setIsDialogOpen(true);
  };

  const handleConfirmDeposit = () => {
    const numAmount = parseFloat(amount);
    const method = methods.find(m => m.name === selectedMethod);
    
    if (!method || !numAmount || numAmount < method.min || numAmount > method.max) {
      toast({
        title: "Invalid Amount",
        description: `Please enter an amount between ${formatCurrency(method?.min || 0)} and ${formatCurrency(method?.max || 0)}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deposit Initiated",
      description: `${selectedMethod} deposit of ${formatCurrency(numAmount)} is being processed.`,
    });
    setIsDialogOpen(false);
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Deposit Funds</h1>
          
          {/* Regional Info Banner */}
          <Card className="p-4 bg-primary/10 border-primary/20 mb-6 max-w-2xl">
            <p className="text-sm text-foreground">
              <strong>Payment methods for Nigeria</strong> - Showing region-specific options
            </p>
          </Card>

          {/* Payment Methods */}
          <div className="grid gap-4 max-w-2xl mb-8">
            {methods.map((method) => (
              <Card key={method.name} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <method.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground">{method.name}</h3>
                      {method.featured && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{method.limits}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {method.instant ? (
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Instant
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 1-3 business days
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleDeposit(method.name)}
                  >
                    Deposit
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Transactions */}
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Recent Deposits</h2>
            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
                {recentTransactions.map((txn) => (
                  <div key={txn.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{txn.method}</p>
                        <p className="text-sm text-muted-foreground">{txn.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{formatCurrency(txn.amount)}</p>
                        <Badge variant={txn.status === "completed" ? "default" : "secondary"} className="text-xs">
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                    {txn.id !== recentTransactions[recentTransactions.length - 1].id && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit with {selectedMethod}</DialogTitle>
            <DialogDescription>
              Enter the amount you wish to deposit. {methods.find(m => m.name === selectedMethod)?.limits}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button 
              onClick={handleConfirmDeposit}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirm Deposit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deposits;

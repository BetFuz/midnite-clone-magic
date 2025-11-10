import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreditCard, Smartphone, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const Deposits = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState("");

  const methods = [
    { name: "Debit Card", icon: CreditCard, limits: `${formatCurrency(500)} - ${formatCurrency(500000)}`, instant: true, min: 500, max: 500000 },
    { name: "PayPal", icon: Smartphone, limits: `${formatCurrency(500)} - ${formatCurrency(250000)}`, instant: true, min: 500, max: 250000 },
    { name: "Bank Transfer", icon: Building2, limits: `${formatCurrency(2500)} - ${formatCurrency(2500000)}`, instant: false, min: 2500, max: 2500000 },
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
          <div className="grid gap-4 max-w-2xl">
            {methods.map((method) => (
              <Card key={method.name} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <method.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">{method.name}</h3>
                    <p className="text-sm text-muted-foreground">{method.limits}</p>
                    {method.instant && <p className="text-xs text-success">Instant</p>}
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

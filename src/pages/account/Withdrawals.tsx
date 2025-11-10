import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Withdrawals = () => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const balance = 127190; // Example balance in Naira
  
  // Mock withdrawal history
  const recentWithdrawals = [
    { id: "WTH001", method: "Bank Transfer", amount: 50000, status: "completed", date: "2025-01-08 10:20" },
    { id: "WTH002", method: "Mobile Money", amount: 25000, status: "processing", date: "2025-01-09 16:15" },
    { id: "WTH003", method: "PayPal", amount: 75000, status: "pending", date: "2025-01-09 18:30" },
  ];

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Withdrawal Requested",
      description: `Request for ${formatCurrency(parseFloat(amount))} submitted successfully`,
    });
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">Withdraw Funds</h1>
          <Card className="p-6 bg-card border-border max-w-2xl">
            <div className="space-y-4">
              <div className="p-4 bg-secondary rounded-lg">
                <div className="text-sm text-muted-foreground">Available Balance</div>
                <div className="text-3xl font-bold text-foreground">{formatCurrency(balance)}</div>
              </div>
              <div>
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="₦0.00" 
                  className="bg-secondary"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="method">Withdrawal Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-full bg-secondary">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer (1-3 days)</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money (Instant)</SelectItem>
                    <SelectItem value="paypal">PayPal (1-2 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleWithdraw}
              >
                Request Withdrawal
              </Button>
              <p className="text-xs text-muted-foreground">Withdrawals are typically processed within 1-3 business days</p>
            </div>
          </Card>

          {/* Recent Withdrawals */}
          <div className="mt-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Recent Withdrawals</h2>
            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
                {recentWithdrawals.map((txn) => (
                  <div key={txn.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{txn.method}</p>
                        <p className="text-sm text-muted-foreground">{txn.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">-{formatCurrency(txn.amount)}</p>
                        <Badge 
                          variant={
                            txn.status === "completed" ? "default" : 
                            txn.status === "processing" ? "secondary" : 
                            "outline"
                          } 
                          className="text-xs"
                        >
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                    {txn.id !== recentWithdrawals[recentWithdrawals.length - 1].id && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Withdrawals;

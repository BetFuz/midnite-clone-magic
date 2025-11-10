import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Withdrawals = () => {
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
                <div className="text-3xl font-bold text-foreground">£2,543.80</div>
              </div>
              <div>
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <Input id="amount" type="number" placeholder="£0.00" className="bg-secondary" />
              </div>
              <div>
                <Label htmlFor="method">Withdrawal Method</Label>
                <select id="method" className="w-full p-2 rounded-md bg-secondary border-border">
                  <option>Bank Transfer</option>
                  <option>PayPal</option>
                  <option>Debit Card</option>
                </select>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Request Withdrawal</Button>
              <p className="text-xs text-muted-foreground">Withdrawals are typically processed within 1-3 business days</p>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Withdrawals;

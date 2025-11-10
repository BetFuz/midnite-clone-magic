import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, Building2 } from "lucide-react";

const Deposits = () => {
  const methods = [
    { name: "Debit Card", icon: CreditCard, limits: "£10 - £10,000", instant: true },
    { name: "PayPal", icon: Smartphone, limits: "£10 - £5,000", instant: true },
    { name: "Bank Transfer", icon: Building2, limits: "£50 - £50,000", instant: false },
  ];

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
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Deposit</Button>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Deposits;

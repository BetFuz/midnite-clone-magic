import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const AccaBoost = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Acca Boost</h1>
            </div>
            <Card className="p-8 bg-gradient-card border-border mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-4">Get up to 50% Extra on Your Accas</h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">5+</div>
                  <div className="text-sm text-muted-foreground">Selections</div>
                  <div className="text-2xl font-bold text-odds mt-2">+10%</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">10+</div>
                  <div className="text-sm text-muted-foreground">Selections</div>
                  <div className="text-2xl font-bold text-odds mt-2">+20%</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">15+</div>
                  <div className="text-sm text-muted-foreground">Selections</div>
                  <div className="text-2xl font-bold text-odds mt-2">+35%</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">20+</div>
                  <div className="text-sm text-muted-foreground">Selections</div>
                  <div className="text-2xl font-bold text-odds mt-2">+50%</div>
                </div>
              </div>
              <p className="text-muted-foreground">Build your accumulator with 5 or more selections and get a boost on your winnings!</p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccaBoost;

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useEffect, useState } from "react";

interface Winner {
  id: string;
  name: string;
  amount: number;
  promotion: string;
  time: string;
}

export const RecentWinners = () => {
  const [winners, setWinners] = useState<Winner[]>([
    { id: "1", name: "Chidi O.", amount: 15000, promotion: "Welcome Bonus", time: "2 min ago" },
    { id: "2", name: "Amara N.", amount: 45000, promotion: "Acca Boost", time: "5 min ago" },
    { id: "3", name: "Tunde K.", amount: 15000, promotion: "Welcome Bonus", time: "8 min ago" },
    { id: "4", name: "Fatima A.", amount: 82000, promotion: "Acca Boost", time: "12 min ago" },
    { id: "5", name: "Emeka J.", amount: 15000, promotion: "Welcome Bonus", time: "15 min ago" },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % winners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [winners.length]);

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-success/10 rounded-lg">
          <Trophy className="h-5 w-5 text-success" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Recent Winners</h3>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {winners.slice(currentIndex, currentIndex + 3).map((winner, i) => (
          <div 
            key={winner.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-fade-in"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{winner.name}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {winner.promotion}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-success">{formatCurrency(winner.amount)}</p>
              <p className="text-xs text-muted-foreground">{winner.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

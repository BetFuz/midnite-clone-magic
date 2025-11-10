import { Card } from "@/components/ui/card";
import { Users, Trophy, Zap, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface Stat {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix: string;
  color: string;
}

export const SocialProofStats = () => {
  const stats: Stat[] = [
    { icon: Users, label: "Players Claimed Today", value: 10234, suffix: "", color: "text-primary" },
    { icon: Trophy, label: "Total Winnings", value: 4.5, suffix: "M", color: "text-success" },
    { icon: Zap, label: "Active Promotions", value: 6, suffix: "", color: "text-accent" },
    { icon: TrendingUp, label: "Avg. Boost", value: 28, suffix: "%", color: "text-odds" },
  ];

  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    stats.forEach((stat, index) => {
      let currentStep = 0;
      const increment = stat.value / steps;

      const timer = setInterval(() => {
        currentStep++;
        setAnimatedValues((prev) => {
          const newValues = [...prev];
          newValues[index] = Math.min(increment * currentStep, stat.value);
          return newValues;
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, interval);
    });
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 bg-card border-border hover:border-primary/30 transition-all">
          <div className="flex flex-col items-center text-center">
            <div className={`p-3 bg-${stat.color}/10 rounded-full mb-3`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className={`text-3xl font-bold ${stat.color} mb-1`}>
              {animatedValues[index].toFixed(stat.suffix === "M" ? 1 : 0).toLocaleString()}
              {stat.suffix}
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

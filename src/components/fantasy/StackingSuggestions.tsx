import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Zap } from "lucide-react";
import { toast } from "sonner";

interface Stack {
  id: string;
  type: "team" | "game" | "position";
  players: any[];
  correlation: number;
  reasoning: string;
}

interface StackingSuggestionsProps {
  currentLineup: any[];
  onApplyStack: (players: any[]) => void;
}

export function StackingSuggestions({ currentLineup, onApplyStack }: StackingSuggestionsProps) {
  const stacks: Stack[] = [
    {
      id: "1",
      type: "team",
      players: [
        { id: "p1", name: "Harry Kane", position: "FWD", team: "Bayern", salary: 120000 },
        { id: "p2", name: "Jamal Musiala", position: "MID", team: "Bayern", salary: 95000 }
      ],
      correlation: 0.78,
      reasoning: "Bayern attacking stack vs weak defense"
    },
    {
      id: "2",
      type: "game",
      players: [
        { id: "p3", name: "Erling Haaland", position: "FWD", team: "Man City", salary: 130000 },
        { id: "p4", name: "Mohamed Salah", position: "FWD", team: "Liverpool", salary: 125000 }
      ],
      correlation: 0.85,
      reasoning: "High-scoring game expected (O/U 3.5)"
    },
    {
      id: "3",
      type: "position",
      players: [
        { id: "p5", name: "Bukayo Saka", position: "MID", team: "Arsenal", salary: 98000 },
        { id: "p6", name: "Phil Foden", position: "MID", team: "Man City", salary: 102000 }
      ],
      correlation: 0.72,
      reasoning: "Top midfielders with penalty upside"
    }
  ];

  const getStackIcon = (type: string) => {
    switch (type) {
      case "team": return <Users className="w-4 h-4" />;
      case "game": return <Zap className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const applyStack = (stack: Stack) => {
    onApplyStack(stack.players);
    toast.success(`Applied ${stack.type} stack`);
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-accent/5 to-primary/5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Stacking Suggestions</h3>
      </div>

      <div className="space-y-3">
        {stacks.map((stack) => (
          <div
            key={stack.id}
            className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStackIcon(stack.type)}
                <Badge variant="outline" className="capitalize">
                  {stack.type} Stack
                </Badge>
                <Badge variant="secondary">
                  {(stack.correlation * 100).toFixed(0)}% Correlation
                </Badge>
              </div>
              <Button size="sm" onClick={() => applyStack(stack)}>
                Apply
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {stack.reasoning}
            </p>

            <div className="space-y-1">
              {stack.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {player.position}
                    </Badge>
                    <span>{player.name}</span>
                    <span className="text-muted-foreground">({player.team})</span>
                  </div>
                  <span className="font-medium">₦{player.salary.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

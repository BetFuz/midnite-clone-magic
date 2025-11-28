import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";

interface Lineup {
  id: string;
  name: string;
  players: any[];
  totalSalary: number;
  isLocked: boolean;
}

interface MultiEntryManagerProps {
  maxEntries: number;
  currentLineup: any[];
  totalSalary: number;
  salaryCap: number;
}

export function MultiEntryManager({ maxEntries, currentLineup, totalSalary, salaryCap }: MultiEntryManagerProps) {
  const [lineups, setLineups] = useState<Lineup[]>([]);

  const saveLineup = () => {
    if (currentLineup.length < 11) {
      toast.error("Complete your lineup before saving");
      return;
    }
    if (lineups.length >= maxEntries) {
      toast.error(`Maximum ${maxEntries} entries allowed`);
      return;
    }

    const newLineup: Lineup = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Entry ${lineups.length + 1}`,
      players: [...currentLineup],
      totalSalary,
      isLocked: false
    };

    setLineups([...lineups, newLineup]);
    toast.success("Lineup saved!");
  };

  const duplicateLineup = (lineupId: string) => {
    const lineup = lineups.find(l => l.id === lineupId);
    if (!lineup) return;

    const newLineup: Lineup = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${lineup.name} (Copy)`,
      players: [...lineup.players],
      totalSalary: lineup.totalSalary,
      isLocked: false
    };

    setLineups([...lineups, newLineup]);
    toast.success("Lineup duplicated!");
  };

  const deleteLineup = (lineupId: string) => {
    setLineups(lineups.filter(l => l.id !== lineupId));
    toast.success("Lineup deleted");
  };

  const toggleLock = (lineupId: string) => {
    setLineups(lineups.map(l => 
      l.id === lineupId ? { ...l, isLocked: !l.isLocked } : l
    ));
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Multi-Entry Manager</h3>
          <p className="text-sm text-muted-foreground">
            {lineups.length} / {maxEntries} entries
          </p>
        </div>
        <Button onClick={saveLineup} size="sm" disabled={lineups.length >= maxEntries}>
          Save Current Lineup
        </Button>
      </div>

      <div className="space-y-2">
        {lineups.map((lineup) => (
          <div
            key={lineup.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{lineup.name}</span>
                {lineup.isLocked && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                ₦{lineup.totalSalary.toLocaleString()} / ₦{salaryCap.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleLock(lineup.id)}
              >
                <Lock className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => duplicateLineup(lineup.id)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteLineup(lineup.id)}
                disabled={lineup.isLocked}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface LateSwapPanelProps {
  contestId: string;
  lateSwapDeadline: string;
  currentLineup: any[];
  onSwapPlayer: (oldPlayerId: string, newPlayerId: string) => void;
}

export function LateSwapPanel({ contestId, lateSwapDeadline, currentLineup, onSwapPlayer }: LateSwapPanelProps) {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [lockedPlayers, setLockedPlayers] = useState<string[]>([]);
  const [swapSuggestions, setSwapSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const updateTimer = () => {
      const deadline = new Date(lateSwapDeadline);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Contest Locked");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m`);

      // Lock players whose games have started
      const locked = currentLineup
        .filter(p => new Date(p.gameTime) <= now)
        .map(p => p.id);
      setLockedPlayers(locked);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [lateSwapDeadline, currentLineup]);

  const handleSwap = (oldPlayerId: string, newPlayerId: string) => {
    if (lockedPlayers.includes(oldPlayerId)) {
      toast.error("Cannot swap locked player");
      return;
    }
    onSwapPlayer(oldPlayerId, newPlayerId);
    toast.success("Player swapped!");
  };

  const unlocked = currentLineup.filter(p => !lockedPlayers.includes(p.id));

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold">Late Swap Window</h3>
            <p className="text-sm text-muted-foreground">{timeRemaining}</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-primary/10">
          {unlocked.length} / {currentLineup.length} Unlocked
        </Badge>
      </div>

      {lockedPlayers.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 mb-4">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Players Locked</p>
            <p className="text-xs text-muted-foreground">
              {lockedPlayers.length} player{lockedPlayers.length !== 1 ? 's' : ''} can no longer be swapped
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">Swap Opportunities</span>
        </div>
        
        {unlocked.slice(0, 3).map((player) => (
          <div
            key={player.id}
            className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{player.name}</p>
                <p className="text-xs text-muted-foreground">
                  Suggested: Similar players at lower cost
                </p>
              </div>
              <Button size="sm" variant="outline">
                Find Swap
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

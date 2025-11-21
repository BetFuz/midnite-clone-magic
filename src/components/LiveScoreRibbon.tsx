import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LiveScore {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  sport: string;
  status: "LIVE" | "HT" | "FT";
}

const LiveScoreRibbon = () => {
  // TODO: DEV – wire to backend when ready
  const liveScores: LiveScore[] = [
    { id: "1", homeTeam: "Man City", awayTeam: "Liverpool", homeScore: 2, awayScore: 1, minute: 67, sport: "Football", status: "LIVE" },
    { id: "2", homeTeam: "Lakers", awayTeam: "Warriors", homeScore: 98, awayScore: 102, minute: 3, sport: "Basketball", status: "LIVE" },
    { id: "3", homeTeam: "Arsenal", awayTeam: "Chelsea", homeScore: 1, awayScore: 1, minute: 45, sport: "Football", status: "HT" },
    { id: "4", homeTeam: "Heat", awayTeam: "Celtics", homeScore: 112, awayScore: 108, minute: 48, sport: "Basketball", status: "FT" },
  ];

  const getStatusColor = (status: string) => {
    if (status === "LIVE") return "destructive";
    if (status === "HT") return "secondary";
    return "outline";
  };

  return (
    <Card className="border-0 bg-gradient-to-r from-slate-900 to-slate-800 mb-6">
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-4">
          {liveScores.map((score) => (
            <div
              key={score.id}
              className="flex-shrink-0 flex items-center gap-3 bg-background/50 rounded-lg p-3 min-w-[280px] cursor-pointer hover:bg-background/70 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{score.homeTeam}</span>
                  <span className="text-xl font-bold">{score.homeScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{score.awayTeam}</span>
                  <span className="text-xl font-bold">{score.awayScore}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={getStatusColor(score.status)} className="gap-1">
                  {score.status === "LIVE" && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                  {score.status}
                </Badge>
                {score.status === "LIVE" && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {score.minute}'
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default LiveScoreRibbon;

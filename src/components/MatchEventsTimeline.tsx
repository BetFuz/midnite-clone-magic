import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Goal, AlertCircle, Users, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchEvent {
  id: string;
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "var";
  minute: string;
  team: "home" | "away";
  player: string;
  description: string;
}

interface MatchEventsTimelineProps {
  homeTeam: string;
  awayTeam: string;
  className?: string;
}

const MatchEventsTimeline = ({
  homeTeam,
  awayTeam,
  className,
}: MatchEventsTimelineProps) => {
  const events: MatchEvent[] = [
    {
      id: "evt-1",
      type: "goal",
      minute: "12'",
      team: "home",
      player: "E. Haaland",
      description: "Assisted by K. De Bruyne",
    },
    {
      id: "evt-2",
      type: "yellow_card",
      minute: "28'",
      team: "away",
      player: "G. Jesus",
      description: "Foul on B. Silva",
    },
    {
      id: "evt-3",
      type: "goal",
      minute: "34'",
      team: "away",
      player: "M. Ødegaard",
      description: "Long range strike",
    },
    {
      id: "evt-4",
      type: "substitution",
      minute: "45+2'",
      team: "home",
      player: "J. Grealish → P. Foden",
      description: "Tactical substitution",
    },
    {
      id: "evt-5",
      type: "goal",
      minute: "52'",
      team: "home",
      player: "E. Haaland",
      description: "Header from corner",
    },
    {
      id: "evt-6",
      type: "var",
      minute: "65'",
      team: "away",
      player: "VAR Check",
      description: "Possible penalty - No penalty given",
    },
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case "goal":
        return <Goal className="h-4 w-4" />;
      case "yellow_card":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "red_card":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "substitution":
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      case "var":
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "goal":
        return "bg-green-500";
      case "yellow_card":
        return "bg-yellow-500";
      case "red_card":
        return "bg-red-500";
      case "substitution":
        return "bg-blue-500";
      case "var":
        return "bg-purple-500";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">Match Events</h3>
        <Badge variant="outline" className="text-xs">
          Live Updates
        </Badge>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

        <div className="space-y-4">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={cn(
                "relative flex gap-4 animate-in fade-in slide-in-from-left-2",
                event.team === "away" && "flex-row-reverse"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Timeline dot */}
              <div
                className={cn(
                  "relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-background",
                  getEventColor(event.type)
                )}
              >
                {getEventIcon(event.type)}
              </div>

              {/* Event content */}
              <div
                className={cn(
                  "flex-1 rounded-lg border border-border bg-card p-3",
                  event.team === "away" && "text-right"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs font-bold">
                    {event.minute}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {event.team === "home" ? homeTeam : awayTeam}
                  </span>
                </div>
                <p className="font-semibold text-sm text-foreground mb-1">
                  {event.player}
                </p>
                <p className="text-xs text-muted-foreground">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default MatchEventsTimeline;

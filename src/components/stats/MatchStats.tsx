import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LastMatch {
  result: 'W' | 'L' | 'D';
  opponent: string;
  score: string;
  isHome: boolean;
}

interface MatchStatsProps {
  matchStats: {
    homeTeam: string;
    awayTeam: string;
    homeForm?: string;
    awayForm?: string;
    homeFormPercent?: number;
    awayFormPercent?: number;
    homePosition?: number;
    awayPosition?: number;
    homeGoalsScored?: number;
    awayGoalsScored?: number;
    homeGoalsConceded?: number;
    awayGoalsConceded?: number;
    h2hHomeWins?: number;
    h2hDraws?: number;
    h2hAwayWins?: number;
    lastMeetingResult?: string;
    homeLastMatches?: LastMatch[];
    awayLastMatches?: LastMatch[];
    league?: string;
    matchday?: number;
  };
}

const CircularProgress = ({ percent, label }: { percent: number; label: string }) => {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  const color = percent >= 60 ? 'text-success' : percent >= 40 ? 'text-warning' : 'text-destructive';
  
  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-bold ${color}`}>{percent}%</span>
        <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
      </div>
    </div>
  );
};

const PositionBar = ({ position, maxPosition = 20, color }: { position: number; maxPosition?: number; color: 'green' | 'red' }) => {
  const height = ((maxPosition - position + 1) / maxPosition) * 100;
  const bgColor = color === 'green' ? 'bg-success' : 'bg-destructive';
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-8 h-24 bg-muted/30 rounded-lg overflow-hidden">
        <div 
          className={`absolute bottom-0 left-0 right-0 ${bgColor} rounded-lg transition-all duration-500`}
          style={{ height: `${height}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg drop-shadow-md">{position}</span>
        </div>
      </div>
    </div>
  );
};

const ResultBadge = ({ result }: { result: 'W' | 'L' | 'D' }) => {
  const colors = {
    W: 'bg-success text-white',
    L: 'bg-destructive text-white',
    D: 'bg-muted text-foreground'
  };
  
  return (
    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${colors[result]}`}>
      {result}
    </span>
  );
};

const LastMatchRow = ({ match }: { match: LastMatch }) => (
  <div className="flex items-center gap-2 py-1.5">
    <ResultBadge result={match.result} />
    <span className="text-muted-foreground text-sm">@</span>
    <span className="text-foreground text-sm font-medium">{match.opponent}</span>
    <span className="text-muted-foreground text-sm ml-auto">{match.score}</span>
  </div>
);

export const MatchStats = ({ matchStats }: MatchStatsProps) => {
  // Generate sample data if not provided
  const homeLastMatches = matchStats.homeLastMatches || [
    { result: 'L' as const, opponent: 'BRI', score: '3:2', isHome: false },
    { result: 'L' as const, opponent: 'KMN', score: '3:2', isHome: false },
    { result: 'W' as const, opponent: 'KJK', score: '3:2', isHome: false },
    { result: 'W' as const, opponent: 'BRE', score: '3:2', isHome: false },
    { result: 'W' as const, opponent: 'KMK', score: '3:2', isHome: false },
  ];

  const awayLastMatches = matchStats.awayLastMatches || [
    { result: 'W' as const, opponent: 'JAR', score: '3:2', isHome: false },
    { result: 'W' as const, opponent: 'BBB', score: '3:2', isHome: false },
    { result: 'L' as const, opponent: 'MLM', score: '3:2', isHome: false },
    { result: 'L' as const, opponent: 'CHE', score: '3:2', isHome: false },
    { result: 'W' as const, opponent: 'KLL', score: '3:2', isHome: false },
  ];

  const homeFormPercent = matchStats.homeFormPercent || 80;
  const awayFormPercent = matchStats.awayFormPercent || 33;
  const homePosition = matchStats.homePosition || 15;
  const awayPosition = matchStats.awayPosition || 10;
  const h2hHomeWins = matchStats.h2hHomeWins || 30;
  const h2hDraws = matchStats.h2hDraws || 12;
  const h2hAwayWins = matchStats.h2hAwayWins || 21;

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* League Header */}
      <div className="bg-muted/50 px-4 py-2 text-center">
        <span className="text-primary font-medium text-sm">
          {matchStats.league || 'Premier League'} | Matchday {matchStats.matchday || 8}
        </span>
      </div>

      <Tabs defaultValue="h2h" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 overflow-x-auto">
          <TabsTrigger 
            value="h2h" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            H2H
          </TabsTrigger>
          <TabsTrigger 
            value="comparison" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Comparison
          </TabsTrigger>
          <TabsTrigger 
            value="lineups" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Lineups
          </TabsTrigger>
          <TabsTrigger 
            value="table" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Table
          </TabsTrigger>
          <TabsTrigger 
            value="standing" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
          >
            Standing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="h2h" className="mt-0">
          {/* Form & Position Section */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{matchStats.homeTeam.substring(0, 3).toUpperCase()}</span>
                </div>
                <CircularProgress percent={homeFormPercent} label="FORM" />
              </div>

              {/* League Position */}
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground mb-3">League Position - Live</p>
                <div className="flex items-end gap-6">
                  <PositionBar position={homePosition} color="green" />
                  <PositionBar position={awayPosition} color="red" />
                </div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-destructive">{matchStats.awayTeam.substring(0, 3).toUpperCase()}</span>
                </div>
                <CircularProgress percent={awayFormPercent} label="FORM" />
              </div>
            </div>
          </div>

          {/* Last 5 Matches */}
          <div className="bg-muted/30 px-4 py-2 text-center">
            <span className="text-destructive font-medium text-sm">Last 5 Matches</span>
          </div>
          
          <div className="p-4 grid grid-cols-2 gap-6">
            <div>
              {homeLastMatches.map((match, i) => (
                <LastMatchRow key={i} match={match} />
              ))}
            </div>
            <div>
              {awayLastMatches.map((match, i) => (
                <LastMatchRow key={i} match={match} />
              ))}
            </div>
          </div>

          {/* Previous Meetings */}
          <div className="bg-muted/30 px-4 py-2 text-center">
            <span className="text-primary font-medium text-sm">Previous meetings</span>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              {/* Home Wins */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xs font-bold text-primary">{matchStats.homeTeam.substring(0, 3).toUpperCase()}</span>
                </div>
                <span className="text-success font-bold">Wins {h2hHomeWins}</span>
              </div>

              {/* Draws Circle */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-success flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-foreground">{h2hDraws}</span>
                    <p className="text-xs text-muted-foreground">Draws</p>
                  </div>
                </div>
              </div>

              {/* Away Wins */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xs font-bold text-destructive">{matchStats.awayTeam.substring(0, 3).toUpperCase()}</span>
                </div>
                <span className="text-primary font-bold">Wins {h2hAwayWins}</span>
              </div>
            </div>

            {/* Highest Win Section */}
            <div className="text-center mt-6">
              <span className="text-success font-medium">Highest Win</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="p-4">
          <p className="text-center text-muted-foreground">Comparison stats coming soon...</p>
        </TabsContent>

        <TabsContent value="lineups" className="p-4">
          <p className="text-center text-muted-foreground">Lineups coming soon...</p>
        </TabsContent>

        <TabsContent value="table" className="p-4">
          <p className="text-center text-muted-foreground">League table coming soon...</p>
        </TabsContent>

        <TabsContent value="standing" className="p-4">
          <p className="text-center text-muted-foreground">Standings coming soon...</p>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

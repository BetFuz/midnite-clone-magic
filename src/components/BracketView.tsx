import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface Match {
  id: string;
  player1: string;
  player2: string;
  score1?: string;
  score2?: string;
  winner?: 1 | 2;
}

interface BracketViewProps {
  tournamentName: string;
}

const BracketView = ({ tournamentName }: BracketViewProps) => {
  // TODO: DEV – wire to backend when ready
  const rounds = [
    {
      name: "Quarter Finals",
      matches: [
        { id: "qf1", player1: "Djokovic", player2: "Alcaraz", score1: "7-6", score2: "6-4", winner: 1 },
        { id: "qf2", player1: "Medvedev", player2: "Rublev", score1: "6-4", score2: "6-7", winner: 1 },
        { id: "qf3", player1: "Sinner", player2: "Tsitsipas", score1: "6-3", score2: "7-5", winner: 1 },
        { id: "qf4", player1: "Zverev", player2: "Ruud", score1: "7-6", score2: "6-4", winner: 1 },
      ],
    },
    {
      name: "Semi Finals",
      matches: [
        { id: "sf1", player1: "Djokovic", player2: "Medvedev", score1: "6-4", score2: "6-2" },
        { id: "sf2", player1: "Sinner", player2: "Zverev", score1: "7-5", score2: "6-3" },
      ],
    },
    {
      name: "Final",
      matches: [
        { id: "f1", player1: "TBD", player2: "TBD" },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {tournamentName} Bracket
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-8 overflow-x-auto pb-4">
          {rounds.map((round, roundIdx) => (
            <div key={roundIdx} className="flex flex-col gap-4 min-w-[240px]">
              <Badge variant="outline" className="text-center">
                {round.name}
              </Badge>
              {round.matches.map((match) => (
                <Card key={match.id} className="border-2">
                  <CardContent className="p-3 space-y-1">
                    <div className={`flex items-center justify-between p-2 rounded ${match.winner === 1 ? "bg-green-500/10 font-bold" : ""}`}>
                      <span className="text-sm">{match.player1}</span>
                      {match.score1 && (
                        <span className="text-sm font-mono">{match.score1}</span>
                      )}
                    </div>
                    <div className={`flex items-center justify-between p-2 rounded ${match.winner === 2 ? "bg-green-500/10 font-bold" : ""}`}>
                      <span className="text-sm">{match.player2}</span>
                      {match.score2 && (
                        <span className="text-sm font-mono">{match.score2}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BracketView;

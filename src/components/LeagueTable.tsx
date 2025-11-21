import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TeamStanding {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

interface LeagueTableProps {
  leagueName: string;
}

const LeagueTable = ({ leagueName }: LeagueTableProps) => {
  // TODO: DEV – wire to backend when ready
  const standings: TeamStanding[] = [
    { position: 1, team: "Man City", played: 28, won: 21, drawn: 4, lost: 3, goalsFor: 68, goalsAgainst: 25, goalDifference: 43, points: 67, form: ["W", "W", "W", "D", "W"] },
    { position: 2, team: "Arsenal", played: 28, won: 20, drawn: 5, lost: 3, goalsFor: 65, goalsAgainst: 24, goalDifference: 41, points: 65, form: ["W", "W", "D", "W", "W"] },
    { position: 3, team: "Liverpool", played: 28, won: 19, drawn: 6, lost: 3, goalsFor: 62, goalsAgainst: 28, goalDifference: 34, points: 63, form: ["W", "D", "W", "W", "L"] },
    { position: 4, team: "Aston Villa", played: 28, won: 17, drawn: 5, lost: 6, goalsFor: 56, goalsAgainst: 38, goalDifference: 18, points: 56, form: ["W", "L", "W", "D", "W"] },
    { position: 5, team: "Tottenham", played: 28, won: 16, drawn: 4, lost: 8, goalsFor: 55, goalsAgainst: 42, goalDifference: 13, points: 52, form: ["L", "W", "W", "L", "W"] },
  ];

  const getFormIcon = (result: "W" | "D" | "L") => {
    if (result === "W") return { icon: TrendingUp, color: "text-green-500" };
    if (result === "D") return { icon: Minus, color: "text-yellow-500" };
    return { icon: TrendingDown, color: "text-red-500" };
  };

  const getPositionBadge = (position: number) => {
    if (position <= 4) return "bg-blue-500/20 text-blue-500 border-blue-500/30";
    if (position === 5) return "bg-orange-500/20 text-orange-500 border-orange-500/30";
    if (position >= 18) return "bg-red-500/20 text-red-500 border-red-500/30";
    return "bg-slate-500/20 text-slate-500 border-slate-500/30";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {leagueName} Table
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center hidden md:table-cell">W</TableHead>
              <TableHead className="text-center hidden md:table-cell">D</TableHead>
              <TableHead className="text-center hidden md:table-cell">L</TableHead>
              <TableHead className="text-center hidden lg:table-cell">GD</TableHead>
              <TableHead className="text-center font-bold">PTS</TableHead>
              <TableHead className="hidden xl:table-cell">Form</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((team) => (
              <TableRow key={team.position} className="hover:bg-muted/50">
                <TableCell>
                  <Badge variant="outline" className={getPositionBadge(team.position)}>
                    {team.position}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold">{team.team}</TableCell>
                <TableCell className="text-center">{team.played}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{team.won}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{team.drawn}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{team.lost}</TableCell>
                <TableCell className="text-center hidden lg:table-cell">
                  <span className={team.goalDifference > 0 ? "text-green-500" : team.goalDifference < 0 ? "text-red-500" : ""}>
                    {team.goalDifference > 0 ? "+" : ""}{team.goalDifference}
                  </span>
                </TableCell>
                <TableCell className="text-center font-bold text-lg">{team.points}</TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex gap-1">
                    {team.form.map((result, idx) => {
                      const { icon: Icon, color } = getFormIcon(result);
                      return (
                        <div key={idx} className={`w-6 h-6 rounded flex items-center justify-center ${result === "W" ? "bg-green-500/20" : result === "D" ? "bg-yellow-500/20" : "bg-red-500/20"}`}>
                          <Icon className={`h-3 w-3 ${color}`} />
                        </div>
                      );
                    })}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LeagueTable;

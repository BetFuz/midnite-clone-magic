import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  form: string[];
}

interface LeagueTableProps {
  leagueName: string;
}

const getPositionBadgeClass = (pos: number, total: number) => {
  if (pos <= 4) return "bg-blue-500/20 text-blue-500 border-blue-500/30";
  if (pos === 5) return "bg-orange-500/20 text-orange-500 border-orange-500/30";
  if (pos >= total - 2) return "bg-red-500/20 text-red-500 border-red-500/30";
  return "bg-slate-500/20 text-slate-500 border-slate-500/30";
};

const FormBadge = ({ result }: { result: string }) => {
  const r = result.trim().toUpperCase();
  if (r === 'W') return (
    <div className="w-6 h-6 rounded flex items-center justify-center bg-green-500/20">
      <TrendingUp className="h-3 w-3 text-green-500" />
    </div>
  );
  if (r === 'D') return (
    <div className="w-6 h-6 rounded flex items-center justify-center bg-yellow-500/20">
      <Minus className="h-3 w-3 text-yellow-500" />
    </div>
  );
  return (
    <div className="w-6 h-6 rounded flex items-center justify-center bg-red-500/20">
      <TrendingDown className="h-3 w-3 text-red-500" />
    </div>
  );
};

const LeagueTable = ({ leagueName }: LeagueTableProps) => {
  const { data: standings = [], isLoading } = useQuery<TeamStanding[]>({
    queryKey: ["standings", leagueName],
    queryFn: async () => {
      const { data } = await api.get("/sports/standings", { params: { league: leagueName } });
      return data.data ?? [];
    },
    staleTime: 30 * 60 * 1000,
    gcTime:    60 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-2">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (!standings.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Standings not available for {leagueName}
        </CardContent>
      </Card>
    );
  }

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
                  <Badge variant="outline" className={getPositionBadgeClass(team.position, standings.length)}>
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
                    {team.form.slice(-5).map((r, i) => <FormBadge key={i} result={r} />)}
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

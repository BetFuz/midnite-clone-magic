import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeagueMatchSchedule } from "./LeagueMatchSchedule";

interface SportGroup {
  sport_key: string;
  sport_title: string;
  league_name: string;
  confederation?: string;
}

const SPORTS: SportGroup[] = [
  { sport_key: "soccer_epl",                 sport_title: "Football", league_name: "Premier League",           confederation: "England" },
  { sport_key: "soccer_uefa_champs_league",  sport_title: "Football", league_name: "Champions League",         confederation: "UEFA" },
  { sport_key: "soccer_spain_la_liga",       sport_title: "Football", league_name: "La Liga",                  confederation: "Spain" },
  { sport_key: "soccer_germany_bundesliga",  sport_title: "Football", league_name: "Bundesliga",               confederation: "Germany" },
  { sport_key: "soccer_italy_serie_a",       sport_title: "Football", league_name: "Serie A",                  confederation: "Italy" },
  { sport_key: "soccer_france_ligue_one",    sport_title: "Football", league_name: "Ligue 1",                  confederation: "France" },
  { sport_key: "soccer_uefa_europa_league",  sport_title: "Football", league_name: "Europa League",            confederation: "UEFA" },
  { sport_key: "soccer_england_championship",sport_title: "Football", league_name: "Championship",             confederation: "England" },
  { sport_key: "afcon",                      sport_title: "Football", league_name: "AFCON",                    confederation: "Africa" },
  { sport_key: "caf_cl",                     sport_title: "Football", league_name: "CAF Champions League",     confederation: "Africa" },
  { sport_key: "basketball_nba",             sport_title: "Basketball", league_name: "NBA",                    confederation: "USA" },
  { sport_key: "basketball_euroleague",      sport_title: "Basketball", league_name: "EuroLeague",             confederation: "Europe" },
  { sport_key: "americanfootball_nfl",       sport_title: "NFL",       league_name: "NFL",                    confederation: "USA" },
  { sport_key: "tennis_atp",                 sport_title: "Tennis",    league_name: "ATP Masters 1000",        confederation: "ATP" },
  { sport_key: "icehockey_nhl",              sport_title: "Ice Hockey",league_name: "NHL",                    confederation: "USA" },
  { sport_key: "mma_mixed_martial_arts",     sport_title: "MMA",       league_name: "MMA",                    confederation: "Global" },
];

export const AllLeaguesSchedule = () => {
  return (
    <Tabs defaultValue={SPORTS[0].sport_key} className="w-full">
      <TabsList className="w-full flex-wrap h-auto gap-1 p-2">
        {SPORTS.map((s) => (
          <TabsTrigger key={s.sport_key} value={s.sport_key} className="text-xs">
            {s.confederation ? `${s.confederation} • ` : ""}{s.league_name}
          </TabsTrigger>
        ))}
      </TabsList>

      {SPORTS.map((s) => (
        <TabsContent key={s.sport_key} value={s.sport_key}>
          <LeagueMatchSchedule leagueName={s.league_name} daysAhead={14} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

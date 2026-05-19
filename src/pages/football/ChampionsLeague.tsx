import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const ChampionsLeague = () => (
  <LeaguePageLayout
    title="UEFA Champions League"
    leagueName="Champions League"
    emoji="⭐"
    logoUrl="https://media.api-sports.io/football/leagues/2.png"
    gradientFrom="from-blue-800"
    gradientTo="to-slate-900"
    daysAhead={14}
    hasTable={true}
  />
);

export default ChampionsLeague;

import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const EgyptianPremierLeague = () => (
  <LeaguePageLayout
    title="Egyptian Premier League"
    leagueName="Egyptian Premier League"
    emoji="🇪🇬"
    logoUrl="https://media.api-sports.io/football/leagues/233.png"
    gradientFrom="from-red-700"
    gradientTo="to-amber-800"
    daysAhead={14}
    hasTable={true}
  />
);

export default EgyptianPremierLeague;

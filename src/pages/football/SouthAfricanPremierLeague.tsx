import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const SouthAfricanPremierLeague = () => (
  <LeaguePageLayout
    title="South African Premier League"
    leagueName="South African Premier League"
    emoji="🇿🇦"
    logoUrl="https://media.api-sports.io/football/leagues/288.png"
    gradientFrom="from-green-700"
    gradientTo="to-amber-800"
    daysAhead={14}
    hasTable={true}
  />
);

export default SouthAfricanPremierLeague;

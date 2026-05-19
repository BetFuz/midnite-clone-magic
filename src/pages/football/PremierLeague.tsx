import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const PremierLeague = () => (
  <LeaguePageLayout
    title="Premier League"
    leagueName="Premier League"
    emoji="🏴󠁧󠁢󠁥󠁮󠁧󠁿"
    logoUrl="https://media.api-sports.io/football/leagues/39.png"
    gradientFrom="from-purple-700"
    gradientTo="to-indigo-900"
    daysAhead={14}
    hasTable={true}
  />
);

export default PremierLeague;

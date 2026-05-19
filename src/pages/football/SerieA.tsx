import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const SerieA = () => (
  <LeaguePageLayout
    title="Serie A"
    leagueName="Serie A"
    emoji="🇮🇹"
    logoUrl="https://media.api-sports.io/football/leagues/135.png"
    gradientFrom="from-blue-700"
    gradientTo="to-green-800"
    daysAhead={14}
    hasTable={true}
  />
);

export default SerieA;

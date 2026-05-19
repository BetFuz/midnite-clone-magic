import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const Ligue1 = () => (
  <LeaguePageLayout
    title="Ligue 1"
    leagueName="Ligue 1"
    emoji="🇫🇷"
    logoUrl="https://media.api-sports.io/football/leagues/61.png"
    gradientFrom="from-blue-700"
    gradientTo="to-red-800"
    daysAhead={14}
    hasTable={true}
  />
);

export default Ligue1;

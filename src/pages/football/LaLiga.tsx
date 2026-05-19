import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const LaLiga = () => (
  <LeaguePageLayout
    title="La Liga"
    leagueName="La Liga"
    emoji="🇪🇸"
    logoUrl="https://media.api-sports.io/football/leagues/140.png"
    gradientFrom="from-red-700"
    gradientTo="to-yellow-700"
    daysAhead={14}
    hasTable={true}
  />
);

export default LaLiga;

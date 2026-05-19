import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const WNBA = () => (
  <LeaguePageLayout
    title="WNBA"
    leagueName="WNBA"
    emoji="🏀"
    logoUrl="https://media.api-sports.io/basketball/leagues/13.png"
    gradientFrom="from-orange-600"
    gradientTo="to-red-800"
    daysAhead={14}
    hasTable={false}
  />
);

export default WNBA;

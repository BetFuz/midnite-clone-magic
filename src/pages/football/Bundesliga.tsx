import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const Bundesliga = () => (
  <LeaguePageLayout
    title="Bundesliga"
    leagueName="Bundesliga"
    emoji="🇩🇪"
    logoUrl="https://media.api-sports.io/football/leagues/78.png"
    gradientFrom="from-gray-800"
    gradientTo="to-red-900"
    daysAhead={14}
    hasTable={true}
  />
);

export default Bundesliga;

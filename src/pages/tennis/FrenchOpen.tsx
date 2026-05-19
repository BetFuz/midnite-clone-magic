import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const FrenchOpen = () => (
  <LeaguePageLayout
    title="French Open (Roland Garros)"
    leagueName="Tennis ATP"
    emoji="🎾"
    gradientFrom="from-orange-700"
    gradientTo="to-red-800"
    daysAhead={14}
    hasTable={false}
  />
);

export default FrenchOpen;

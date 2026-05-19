import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const NCAABasketball = () => (
  <LeaguePageLayout
    title="NCAA Basketball"
    leagueName="NCAA Basketball"
    emoji="🏀"
    gradientFrom="from-orange-700"
    gradientTo="to-blue-900"
    daysAhead={14}
    hasTable={false}
  />
);

export default NCAABasketball;

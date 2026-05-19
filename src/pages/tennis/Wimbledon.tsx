import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const Wimbledon = () => (
  <LeaguePageLayout
    title="Wimbledon"
    leagueName="Tennis ATP"
    emoji="🎾"
    gradientFrom="from-green-700"
    gradientTo="to-green-900"
    daysAhead={14}
    hasTable={false}
  />
);

export default Wimbledon;

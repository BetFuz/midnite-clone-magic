import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const AustralianOpen = () => (
  <LeaguePageLayout
    title="Australian Open"
    leagueName="Tennis ATP"
    emoji="🎾"
    gradientFrom="from-blue-600"
    gradientTo="to-cyan-800"
    daysAhead={14}
    hasTable={false}
  />
);

export default AustralianOpen;

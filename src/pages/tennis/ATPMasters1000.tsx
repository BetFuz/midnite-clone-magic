import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const ATPMasters1000 = () => (
  <LeaguePageLayout
    title="ATP Masters 1000"
    leagueName="Tennis ATP"
    emoji="🎾"
    gradientFrom="from-slate-700"
    gradientTo="to-purple-900"
    daysAhead={14}
    hasTable={false}
  />
);

export default ATPMasters1000;

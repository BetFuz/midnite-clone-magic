import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const USOpen = () => (
  <LeaguePageLayout
    title="US Open Tennis"
    leagueName="Tennis ATP"
    emoji="🎾"
    gradientFrom="from-blue-800"
    gradientTo="to-indigo-900"
    daysAhead={14}
    hasTable={false}
  />
);

export default USOpen;

import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const WTAFinals = () => (
  <LeaguePageLayout
    title="WTA Finals"
    leagueName="Tennis WTA"
    emoji="🎾"
    gradientFrom="from-pink-700"
    gradientTo="to-purple-900"
    daysAhead={14}
    hasTable={false}
  />
);

export default WTAFinals;

import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const SpanishACB = () => (
  <LeaguePageLayout
    title="Spanish ACB League"
    leagueName="Spanish ACB"
    emoji="🇪🇸"
    logoUrl="https://media.api-sports.io/basketball/leagues/119.png"
    gradientFrom="from-red-700"
    gradientTo="to-yellow-700"
    daysAhead={14}
    hasTable={false}
  />
);

export default SpanishACB;

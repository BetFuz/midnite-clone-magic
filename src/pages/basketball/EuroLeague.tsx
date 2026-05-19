import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const EuroLeague = () => (
  <LeaguePageLayout
    title="EuroLeague Basketball"
    leagueName="EuroLeague"
    emoji="🏀"
    logoUrl="https://media.api-sports.io/basketball/leagues/120.png"
    gradientFrom="from-slate-700"
    gradientTo="to-blue-900"
    daysAhead={14}
    hasTable={false}
  />
);

export default EuroLeague;

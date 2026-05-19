import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const Championship = () => (
  <LeaguePageLayout
    title="EFL Championship"
    leagueName="Championship"
    emoji="🏴󠁧󠁢󠁥󠁮󠁧󠁿"
    logoUrl="https://media.api-sports.io/football/leagues/40.png"
    gradientFrom="from-sky-700"
    gradientTo="to-blue-900"
    daysAhead={14}
    hasTable={true}
  />
);

export default Championship;

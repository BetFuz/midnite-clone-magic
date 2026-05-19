import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const U20WorldCup = () => (
  <LeaguePageLayout
    title="FIFA U20 World Cup"
    leagueName="U20 World Cup"
    emoji="🌍"
    logoUrl="https://media.api-sports.io/football/leagues/18.png"
    gradientFrom="from-sky-700"
    gradientTo="to-blue-900"
    daysAhead={14}
    hasTable={false}
  />
);

export default U20WorldCup;

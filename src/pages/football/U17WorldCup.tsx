import LeaguePageLayout from "@/components/layouts/LeaguePageLayout";

const U17WorldCup = () => (
  <LeaguePageLayout
    title="FIFA U17 World Cup"
    leagueName="U17 World Cup"
    emoji="🌍"
    logoUrl="https://media.api-sports.io/football/leagues/19.png"
    gradientFrom="from-teal-700"
    gradientTo="to-cyan-900"
    daysAhead={14}
    hasTable={false}
  />
);

export default U17WorldCup;

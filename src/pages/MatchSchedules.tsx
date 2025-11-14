import { AllLeaguesSchedule } from "@/components/AllLeaguesSchedule";

const MatchSchedules = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Match Schedules</h1>
          <p className="text-muted-foreground">
            View upcoming matches across all leagues and place your bets
          </p>
        </div>

        <AllLeaguesSchedule />
      </div>
    </div>
  );
};

export default MatchSchedules;

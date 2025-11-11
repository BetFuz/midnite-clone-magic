import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWeeklyChallenges } from "@/hooks/useWeeklyChallenges";
import { Target, CheckCircle2, Clock } from "lucide-react";

export const WeeklyChallenges = () => {
  const { challenges, isLoading } = useWeeklyChallenges();

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Weekly Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Weekly Challenges
          <Badge variant="secondary" className="ml-auto">
            {challenges.filter((c) => c.isCompleted).length}/{challenges.length} Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {challenges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No active challenges this week.</p>
            <p className="text-sm mt-1">Check back soon for new challenges!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => {
              const progress = challenge.userProgress || 0;
              const target = challenge.targetValue;
              const progressPercent = Math.min((progress / target) * 100, 100);

              return (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-lg border transition-all ${
                    challenge.isCompleted
                      ? "bg-success/10 border-success/50"
                      : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {challenge.challengeName}
                        </h4>
                        {challenge.isCompleted && (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        )}
                      </div>
                      {challenge.challengeDescription && (
                        <p className="text-sm text-muted-foreground">
                          {challenge.challengeDescription}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={challenge.isCompleted ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      +{challenge.rewardPoints} pts
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Progress value={progressPercent} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {progress} / {target} {challenge.challengeType}
                      </span>
                      <span
                        className={
                          challenge.isCompleted
                            ? "text-success font-semibold"
                            : "text-primary"
                        }
                      >
                        {progressPercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

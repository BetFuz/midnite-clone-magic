import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAchievements } from "@/hooks/useAchievements";
import { Award, Star, Zap, Target, Trophy } from "lucide-react";
import { format } from "date-fns";

export const AchievementBadges = () => {
  const { achievements, isLoading } = useAchievements();

  const getAchievementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "streak":
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case "milestone":
        return <Target className="h-5 w-5 text-blue-500" />;
      case "tournament":
        return <Trophy className="h-5 w-5 text-purple-500" />;
      default:
        return <Star className="h-5 w-5 text-green-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <Award className="h-5 w-5 text-primary" />
          Achievements
          <Badge variant="secondary" className="ml-auto">
            {achievements.length} Unlocked
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No achievements unlocked yet.</p>
            <p className="text-sm mt-1">Start betting to earn achievements!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="relative p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getAchievementIcon(achievement.achievementType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">
                      {achievement.achievementName}
                    </h4>
                    {achievement.achievementDescription && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {achievement.achievementDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        +{achievement.pointsEarned} pts
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(achievement.unlockedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

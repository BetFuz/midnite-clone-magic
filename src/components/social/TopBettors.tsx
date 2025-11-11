import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TopBettor {
  user_id: string;
  full_name: string;
  email: string;
  total_wins: number;
  win_rate: number;
  profit_loss: number;
  total_bets: number;
}

const TopBettors = () => {
  const [topBettors, setTopBettors] = useState<TopBettor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTopBettors();
  }, []);

  const loadTopBettors = async () => {
    try {
      const { data, error } = await supabase
        .from('user_statistics')
        .select(`
          user_id,
          total_wins,
          win_rate,
          profit_loss,
          total_bets,
          profiles:user_id (full_name, email)
        `)
        .gte('total_bets', 5)
        .order('win_rate', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formatted = data?.map(d => ({
        user_id: d.user_id,
        full_name: (d.profiles as any)?.full_name || '',
        email: (d.profiles as any)?.email || '',
        total_wins: d.total_wins,
        win_rate: d.win_rate,
        profit_loss: d.profit_loss,
        total_bets: d.total_bets,
      })) || [];

      setTopBettors(formatted);
    } catch (error) {
      console.error('Error loading top bettors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-2 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Top Bettors</h3>
      </div>

      <div className="space-y-4">
        {topBettors.map((bettor, index) => {
          const userName = bettor.full_name || bettor.email?.split('@')[0] || 'Anonymous';
          const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

          return (
            <div key={bettor.user_id} className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-[40px]">
                {index < 3 ? (
                  <Badge variant="default" className="h-6 w-6 flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground ml-2">
                    {index + 1}
                  </span>
                )}
              </div>

              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h4 className="font-medium text-foreground text-sm">{userName}</h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {bettor.win_rate.toFixed(1)}% Win
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {bettor.total_bets} Bets
                  </span>
                </div>
              </div>

              <Button size="sm" variant="ghost">
                Follow
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TopBettors;
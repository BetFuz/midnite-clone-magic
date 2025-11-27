import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { 
  Activity, 
  UserPlus, 
  TrendingUp, 
  AlertCircle, 
  DollarSign,
  CheckCircle,
  XCircle,
  Shield,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityEvent {
  id: string;
  type: 'bet_placed' | 'user_registered' | 'bet_won' | 'bet_lost' | 'withdrawal' | 'admin_action' | 'error';
  message: string;
  timestamp: string;
  metadata?: any;
  icon: any;
  iconColor: string;
  badgeVariant: 'default' | 'destructive' | 'outline' | 'secondary';
}

export const RealtimeActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    // Load initial recent activities
    loadRecentActivities();

    // Set up realtime subscriptions
    const betChannel = supabase
      .channel('bet-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bet_slips'
        },
        (payload) => {
          const newBet = payload.new;
          addActivity({
            id: `bet-${newBet.id}`,
            type: 'bet_placed',
            message: `New bet placed: ${formatCurrency(newBet.total_stake)} stake`,
            timestamp: newBet.created_at,
            metadata: newBet,
            icon: Activity,
            iconColor: 'text-blue-500',
            badgeVariant: 'default'
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bet_slips'
        },
        (payload) => {
          const updatedBet = payload.new;
          if (updatedBet.status === 'won') {
            addActivity({
              id: `bet-won-${updatedBet.id}`,
              type: 'bet_won',
              message: `Bet won: ${formatCurrency(updatedBet.potential_win)} payout`,
              timestamp: updatedBet.settled_at || new Date().toISOString(),
              metadata: updatedBet,
              icon: CheckCircle,
              iconColor: 'text-green-500',
              badgeVariant: 'secondary'
            });
          } else if (updatedBet.status === 'lost') {
            addActivity({
              id: `bet-lost-${updatedBet.id}`,
              type: 'bet_lost',
              message: `Bet lost: ${formatCurrency(updatedBet.total_stake)} stake`,
              timestamp: updatedBet.settled_at || new Date().toISOString(),
              metadata: updatedBet,
              icon: XCircle,
              iconColor: 'text-red-500',
              badgeVariant: 'destructive'
            });
          }
        }
      )
      .subscribe();

    const userChannel = supabase
      .channel('user-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          const newUser = payload.new;
          addActivity({
            id: `user-${newUser.id}`,
            type: 'user_registered',
            message: `New user registered: ${newUser.email}`,
            timestamp: newUser.created_at,
            metadata: newUser,
            icon: UserPlus,
            iconColor: 'text-purple-500',
            badgeVariant: 'secondary'
          });
        }
      )
      .subscribe();

    const auditChannel = supabase
      .channel('audit-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_audit_log'
        },
        (payload) => {
          const auditLog = payload.new;
          addActivity({
            id: `audit-${auditLog.id}`,
            type: auditLog.status === 'error' ? 'error' : 'admin_action',
            message: `Admin action: ${auditLog.action} on ${auditLog.resource_type}`,
            timestamp: auditLog.created_at,
            metadata: auditLog,
            icon: auditLog.status === 'error' ? AlertCircle : Shield,
            iconColor: auditLog.status === 'error' ? 'text-red-500' : 'text-orange-500',
            badgeVariant: auditLog.status === 'error' ? 'destructive' : 'outline'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(betChannel);
      supabase.removeChannel(userChannel);
      supabase.removeChannel(auditChannel);
    };
  }, []);

  const loadRecentActivities = async () => {
    try {
      // Load recent bets
      const { data: recentBets } = await supabase
        .from('bet_slips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Load recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Load recent admin actions
      const { data: recentAudits } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const initialActivities: ActivityEvent[] = [];

      // Add bets
      if (recentBets) {
        recentBets.forEach(bet => {
          if (bet.status === 'pending') {
            initialActivities.push({
              id: `bet-${bet.id}`,
              type: 'bet_placed',
              message: `Bet placed: ${formatCurrency(bet.total_stake)} stake`,
              timestamp: bet.created_at,
              metadata: bet,
              icon: Activity,
              iconColor: 'text-blue-500',
              badgeVariant: 'default'
            });
          } else if (bet.status === 'won') {
            initialActivities.push({
              id: `bet-won-${bet.id}`,
              type: 'bet_won',
              message: `Bet won: ${formatCurrency(bet.potential_win)} payout`,
              timestamp: bet.settled_at || bet.created_at,
              metadata: bet,
              icon: CheckCircle,
              iconColor: 'text-green-500',
              badgeVariant: 'secondary'
            });
          } else if (bet.status === 'lost') {
            initialActivities.push({
              id: `bet-lost-${bet.id}`,
              type: 'bet_lost',
              message: `Bet lost: ${formatCurrency(bet.total_stake)} stake`,
              timestamp: bet.settled_at || bet.created_at,
              metadata: bet,
              icon: XCircle,
              iconColor: 'text-red-500',
              badgeVariant: 'destructive'
            });
          }
        });
      }

      // Add users
      if (recentUsers) {
        recentUsers.forEach(user => {
          initialActivities.push({
            id: `user-${user.id}`,
            type: 'user_registered',
            message: `User registered: ${user.email}`,
            timestamp: user.created_at,
            metadata: user,
            icon: UserPlus,
            iconColor: 'text-purple-500',
            badgeVariant: 'secondary'
          });
        });
      }

      // Add admin actions
      if (recentAudits) {
        recentAudits.forEach(audit => {
          initialActivities.push({
            id: `audit-${audit.id}`,
            type: audit.status === 'error' ? 'error' : 'admin_action',
            message: `${audit.action} on ${audit.resource_type}`,
            timestamp: audit.created_at,
            metadata: audit,
            icon: audit.status === 'error' ? AlertCircle : Shield,
            iconColor: audit.status === 'error' ? 'text-red-500' : 'text-orange-500',
            badgeVariant: audit.status === 'error' ? 'destructive' : 'outline'
          });
        });
      }

      // Sort by timestamp (most recent first)
      initialActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(initialActivities.slice(0, 20));
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const addActivity = (activity: ActivityEvent) => {
    setActivities(prev => [activity, ...prev].slice(0, 50));
  };

  const getActivityBadgeLabel = (type: string) => {
    switch (type) {
      case 'bet_placed': return 'Bet Placed';
      case 'bet_won': return 'Bet Won';
      case 'bet_lost': return 'Bet Lost';
      case 'user_registered': return 'New User';
      case 'withdrawal': return 'Withdrawal';
      case 'admin_action': return 'Admin Action';
      case 'error': return 'Error';
      default: return 'Activity';
    }
  };

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Live Activity Feed</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-6">
          <div className="space-y-4 pb-4">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Waiting for activity...
                </p>
              </div>
            ) : (
              activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className={`p-2 rounded-full bg-background ${activity.iconColor}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium leading-tight">
                        {activity.message}
                      </p>
                      <Badge variant={activity.badgeVariant} className="text-xs shrink-0">
                        {getActivityBadgeLabel(activity.type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

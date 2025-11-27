import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityEvent {
  id: string;
  type: 'bet_placed' | 'user_registered' | 'bet_won' | 'bet_lost' | 'deposit' | 'withdrawal' | 'balance_update' | 'admin_action' | 'error' | 'system';
  message: string;
  timestamp: string;
  amount?: number;
  metadata?: any;
  icon: any;
  iconColor: string;
  badgeVariant: 'default' | 'destructive' | 'outline' | 'secondary';
}

interface ActivityStats {
  totalBets: number;
  totalUsers: number;
  totalDeposits: number;
  totalErrors: number;
}

export const RealtimeActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalBets: 0,
    totalUsers: 0,
    totalDeposits: 0,
    totalErrors: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    loadRecentActivities();

    // Set up realtime subscriptions for bets
    const betChannel = supabase
      .channel('bet-activity-feed')
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
            message: `New bet placed by user`,
            timestamp: newBet.created_at,
            amount: newBet.total_stake,
            metadata: { 
              betId: newBet.id,
              stake: newBet.total_stake,
              odds: newBet.total_odds,
              potentialWin: newBet.potential_win
            },
            icon: Activity,
            iconColor: 'text-blue-500',
            badgeVariant: 'default'
          });
          updateStats('totalBets', 1);
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
          const oldBet = payload.old;
          
          // Only track status changes
          if (updatedBet.status !== oldBet.status) {
            if (updatedBet.status === 'won') {
              addActivity({
                id: `bet-won-${updatedBet.id}-${Date.now()}`,
                type: 'bet_won',
                message: `Bet won - payout issued`,
                timestamp: updatedBet.settled_at || new Date().toISOString(),
                amount: updatedBet.potential_win,
                metadata: { 
                  betId: updatedBet.id,
                  payout: updatedBet.potential_win,
                  stake: updatedBet.total_stake
                },
                icon: CheckCircle,
                iconColor: 'text-green-500',
                badgeVariant: 'secondary'
              });
            } else if (updatedBet.status === 'lost') {
              addActivity({
                id: `bet-lost-${updatedBet.id}-${Date.now()}`,
                type: 'bet_lost',
                message: `Bet lost`,
                timestamp: updatedBet.settled_at || new Date().toISOString(),
                amount: updatedBet.total_stake,
                metadata: { 
                  betId: updatedBet.id,
                  stake: updatedBet.total_stake
                },
                icon: XCircle,
                iconColor: 'text-red-500',
                badgeVariant: 'destructive'
              });
            }
          }
        }
      )
      .subscribe();

    // User activity subscription
    const userChannel = supabase
      .channel('user-activity-feed')
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
            message: `New user: ${newUser.email}`,
            timestamp: newUser.created_at,
            metadata: { 
              userId: newUser.id,
              email: newUser.email
            },
            icon: UserPlus,
            iconColor: 'text-purple-500',
            badgeVariant: 'secondary'
          });
          updateStats('totalUsers', 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          const newProfile = payload.new;
          const oldProfile = payload.old;
          
          // Track balance changes
          if (newProfile.balance !== oldProfile.balance) {
            const diff = Number(newProfile.balance) - Number(oldProfile.balance);
            const isDeposit = diff > 0;
            
            addActivity({
              id: `balance-${newProfile.id}-${Date.now()}`,
              type: isDeposit ? 'deposit' : 'withdrawal',
              message: isDeposit 
                ? `Deposit: ${formatCurrency(Math.abs(diff))}`
                : `Withdrawal: ${formatCurrency(Math.abs(diff))}`,
              timestamp: newProfile.updated_at || new Date().toISOString(),
              amount: Math.abs(diff),
              metadata: { 
                userId: newProfile.id,
                oldBalance: oldProfile.balance,
                newBalance: newProfile.balance,
                difference: diff
              },
              icon: isDeposit ? ArrowUpCircle : ArrowDownCircle,
              iconColor: isDeposit ? 'text-emerald-500' : 'text-amber-500',
              badgeVariant: 'outline'
            });
            
            if (isDeposit) {
              updateStats('totalDeposits', 1);
            }
          }
        }
      )
      .subscribe();

    // Admin audit log subscription
    const auditChannel = supabase
      .channel('audit-activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_audit_log'
        },
        (payload) => {
          const auditLog = payload.new;
          const isError = auditLog.status === 'error';
          
          addActivity({
            id: `audit-${auditLog.id}`,
            type: isError ? 'error' : 'admin_action',
            message: isError 
              ? `Error: ${auditLog.action} - ${auditLog.error_message || 'Unknown error'}`
              : `Admin: ${auditLog.action} on ${auditLog.resource_type}`,
            timestamp: auditLog.created_at,
            metadata: { 
              adminId: auditLog.admin_id,
              action: auditLog.action,
              resourceType: auditLog.resource_type,
              resourceId: auditLog.resource_id,
              status: auditLog.status,
              error: auditLog.error_message
            },
            icon: isError ? AlertCircle : Shield,
            iconColor: isError ? 'text-red-500' : 'text-orange-500',
            badgeVariant: isError ? 'destructive' : 'outline'
          });
          
          if (isError) {
            updateStats('totalErrors', 1);
          }
        }
      )
      .subscribe();

    // Match updates subscription
    const matchChannel = supabase
      .channel('match-updates-feed')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          const newMatch = payload.new;
          const oldMatch = payload.old;
          
          // Track status changes
          if (newMatch.status !== oldMatch.status) {
            addActivity({
              id: `match-${newMatch.id}-${Date.now()}`,
              type: 'system',
              message: `Match status: ${oldMatch.status} → ${newMatch.status} (${newMatch.home_team} vs ${newMatch.away_team})`,
              timestamp: newMatch.updated_at || new Date().toISOString(),
              metadata: { 
                matchId: newMatch.id,
                homeTeam: newMatch.home_team,
                awayTeam: newMatch.away_team,
                oldStatus: oldMatch.status,
                newStatus: newMatch.status
              },
              icon: TrendingUp,
              iconColor: 'text-cyan-500',
              badgeVariant: 'outline'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(betChannel);
      supabase.removeChannel(userChannel);
      supabase.removeChannel(auditChannel);
      supabase.removeChannel(matchChannel);
    };
  }, []);

  // Filter activities based on search and type
  useEffect(() => {
    let filtered = activities;
    
    if (searchQuery) {
      filtered = filtered.filter(activity => 
        activity.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }
    
    setFilteredActivities(filtered);
  }, [activities, searchQuery, typeFilter]);

  const loadRecentActivities = async () => {
    try {
      const initialActivities: ActivityEvent[] = [];

      // Load recent bets (last 20)
      const { data: recentBets } = await supabase
        .from('bet_slips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (recentBets) {
        let betCount = 0;
        recentBets.forEach(bet => {
          if (bet.status === 'pending') {
            initialActivities.push({
              id: `bet-${bet.id}`,
              type: 'bet_placed',
              message: `Bet placed by user`,
              timestamp: bet.created_at,
              amount: bet.total_stake,
              metadata: { 
                betId: bet.id,
                stake: bet.total_stake,
                odds: bet.total_odds,
                potentialWin: bet.potential_win
              },
              icon: Activity,
              iconColor: 'text-blue-500',
              badgeVariant: 'default'
            });
            betCount++;
          } else if (bet.status === 'won') {
            initialActivities.push({
              id: `bet-won-${bet.id}`,
              type: 'bet_won',
              message: `Bet won - payout issued`,
              timestamp: bet.settled_at || bet.created_at,
              amount: bet.potential_win,
              metadata: { 
                betId: bet.id,
                payout: bet.potential_win,
                stake: bet.total_stake
              },
              icon: CheckCircle,
              iconColor: 'text-green-500',
              badgeVariant: 'secondary'
            });
          } else if (bet.status === 'lost') {
            initialActivities.push({
              id: `bet-lost-${bet.id}`,
              type: 'bet_lost',
              message: `Bet lost`,
              timestamp: bet.settled_at || bet.created_at,
              amount: bet.total_stake,
              metadata: { 
                betId: bet.id,
                stake: bet.total_stake
              },
              icon: XCircle,
              iconColor: 'text-red-500',
              badgeVariant: 'destructive'
            });
          }
        });
        setStats(prev => ({ ...prev, totalBets: betCount }));
      }

      // Load recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentUsers) {
        recentUsers.forEach(user => {
          initialActivities.push({
            id: `user-${user.id}`,
            type: 'user_registered',
            message: `New user: ${user.email}`,
            timestamp: user.created_at,
            metadata: { 
              userId: user.id,
              email: user.email
            },
            icon: UserPlus,
            iconColor: 'text-purple-500',
            badgeVariant: 'secondary'
          });
        });
        setStats(prev => ({ ...prev, totalUsers: recentUsers.length }));
      }

      // Load recent admin actions
      const { data: recentAudits } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      if (recentAudits) {
        let errorCount = 0;
        recentAudits.forEach(audit => {
          const isError = audit.status === 'error';
          if (isError) errorCount++;
          
          initialActivities.push({
            id: `audit-${audit.id}`,
            type: isError ? 'error' : 'admin_action',
            message: isError 
              ? `Error: ${audit.action} - ${audit.error_message || 'Unknown error'}`
              : `Admin: ${audit.action} on ${audit.resource_type}`,
            timestamp: audit.created_at,
            metadata: { 
              adminId: audit.admin_id,
              action: audit.action,
              resourceType: audit.resource_type,
              resourceId: audit.resource_id,
              status: audit.status,
              error: audit.error_message
            },
            icon: isError ? AlertCircle : Shield,
            iconColor: isError ? 'text-red-500' : 'text-orange-500',
            badgeVariant: isError ? 'destructive' : 'outline'
          });
        });
        setStats(prev => ({ ...prev, totalErrors: errorCount }));
      }

      // Sort by timestamp (most recent first)
      initialActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(initialActivities.slice(0, 100));
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const addActivity = (activity: ActivityEvent) => {
    setActivities(prev => [activity, ...prev].slice(0, 100));
  };

  const updateStats = (key: keyof ActivityStats, increment: number) => {
    setStats(prev => ({ ...prev, [key]: prev[key] + increment }));
  };

  const getActivityBadgeLabel = (type: string) => {
    switch (type) {
      case 'bet_placed': return 'Bet';
      case 'bet_won': return 'Won';
      case 'bet_lost': return 'Lost';
      case 'user_registered': return 'User';
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'admin_action': return 'Admin';
      case 'error': return 'Error';
      case 'system': return 'System';
      default: return 'Activity';
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live Bets</p>
                <p className="text-2xl font-bold">{stats.totalBets}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <UserPlus className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deposits</p>
                <p className="text-2xl font-bold">{stats.totalDeposits}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold">{stats.totalErrors}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="h-[600px]">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Live Activity Stream</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </Badge>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bet_placed">Bets Placed</SelectItem>
                <SelectItem value="bet_won">Bets Won</SelectItem>
                <SelectItem value="bet_lost">Bets Lost</SelectItem>
                <SelectItem value="user_registered">New Users</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="admin_action">Admin Actions</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="system">System Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[440px] px-6">
            <div className="space-y-3 pb-4">
              {filteredActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || typeFilter !== 'all' 
                      ? 'No activities match your filters'
                      : 'Monitoring for activity...'}
                  </p>
                </div>
              ) : (
                filteredActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-background ${activity.iconColor}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight mb-1">
                            {activity.message}
                          </p>
                          {activity.amount && (
                            <p className="text-xs text-muted-foreground font-mono">
                              {formatCurrency(activity.amount)}
                            </p>
                          )}
                        </div>
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
    </div>
  );
};

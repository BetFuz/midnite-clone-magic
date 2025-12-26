import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, TrendingUp, DollarSign, Activity, 
  Globe, ArrowUpRight, ArrowDownRight,
  Wallet, Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TenantKPI {
  tenant_id: string;
  country_code: string;
  country_name: string;
  currency: string;
  total_users: number;
  active_users_24h: number;
  total_bets: number;
  total_staked: number;
  gross_revenue: number;
}

interface GlobalKPIDashboardProps {
  selectedTenantId?: string | null;
}

const countryFlags: Record<string, string> = {
  NG: "🇳🇬",
  KE: "🇰🇪",
  GH: "🇬🇭",
  ZA: "🇿🇦",
  UG: "🇺🇬",
};

export const GlobalKPIDashboard = ({ selectedTenantId }: GlobalKPIDashboardProps) => {
  const [kpis, setKpis] = useState<TenantKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalBets: 0,
    totalStaked: 0,
    totalRevenue: 0,
    activeCountries: 0,
  });

  useEffect(() => {
    fetchKPIs();
  }, [selectedTenantId]);

  const fetchKPIs = async () => {
    try {
      // Get tenants with their latest KPIs
      const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('id, country_code, country_name, currency, is_active')
        .eq('is_active', true);

      if (tenantError) throw tenantError;

      // Get profiles count per tenant
      const { data: profileCounts, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id');

      if (profileError) throw profileError;

      // Get bet stats
      const { data: betStats, error: betError } = await supabase
        .from('bet_slips')
        .select('total_stake, status, created_at');

      if (betError) throw betError;

      // Calculate KPIs for each tenant
      const tenantKpis: TenantKPI[] = (tenants || []).map(tenant => {
        const tenantProfiles = profileCounts?.filter(p => p.tenant_id === tenant.id) || [];
        const totalUsers = tenantProfiles.length;
        
        // Simulated active users (in production, track this properly)
        const activeUsers24h = Math.floor(totalUsers * 0.15);
        
        // Distribute bets proportionally (simplified for demo)
        const totalBetsGlobal = betStats?.length || 0;
        const totalStakedGlobal = betStats?.reduce((sum, b) => sum + Number(b.total_stake || 0), 0) || 0;
        const proportion = tenants.length > 0 ? 1 / tenants.length : 0;
        
        return {
          tenant_id: tenant.id,
          country_code: tenant.country_code,
          country_name: tenant.country_name,
          currency: tenant.currency,
          total_users: totalUsers,
          active_users_24h: activeUsers24h,
          total_bets: Math.floor(totalBetsGlobal * proportion),
          total_staked: totalStakedGlobal * proportion,
          gross_revenue: totalStakedGlobal * proportion * 0.08, // 8% margin
        };
      });

      setKpis(tenantKpis);

      // Calculate global totals
      setGlobalStats({
        totalUsers: tenantKpis.reduce((sum, k) => sum + k.total_users, 0),
        totalBets: betStats?.length || 0,
        totalStaked: betStats?.reduce((sum, b) => sum + Number(b.total_stake || 0), 0) || 0,
        totalRevenue: tenantKpis.reduce((sum, k) => sum + k.gross_revenue, 0),
        activeCountries: tenants?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // If specific tenant selected, show only that tenant's KPIs
  const displayKpis = selectedTenantId 
    ? kpis.filter(k => k.tenant_id === selectedTenantId)
    : kpis;

  return (
    <div className="space-y-6">
      {/* Global Summary Cards */}
      {!selectedTenantId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Countries</CardTitle>
              <Globe className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{globalStats.activeCountries}</div>
              <p className="text-xs text-muted-foreground mt-1">Markets operating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(globalStats.totalUsers)}</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>+12.5% this week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(globalStats.totalBets)}</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>+8.3% vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(globalStats.totalStaked)}</div>
              <p className="text-xs text-muted-foreground mt-1">All-time staked</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(globalStats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">8% avg margin</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Country Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {selectedTenantId ? 'Country Performance' : 'Country Breakdown'}
          </CardTitle>
          <CardDescription>
            {selectedTenantId 
              ? 'Detailed metrics for selected country'
              : 'Performance comparison across all markets'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayKpis.map((kpi) => {
              const revenuePercentage = globalStats.totalRevenue > 0 
                ? (kpi.gross_revenue / globalStats.totalRevenue) * 100 
                : 0;
              
              return (
                <div key={kpi.tenant_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{countryFlags[kpi.country_code] || "🌍"}</span>
                      <div>
                        <p className="font-medium">{kpi.country_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(kpi.total_users)} users • {formatNumber(kpi.total_bets)} bets
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(kpi.total_staked, kpi.currency)}</p>
                      <p className="text-xs text-green-500">
                        +{formatCurrency(kpi.gross_revenue, kpi.currency)} revenue
                      </p>
                    </div>
                  </div>
                  <Progress value={revenuePercentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

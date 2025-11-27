import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, TrendingUp, Users, Activity } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportData {
  totalRevenue: number;
  totalBets: number;
  totalUsers: number;
  pendingBets: number;
  wonBets: number;
  lostBets: number;
  avgBetAmount: number;
}

export default function Reports() {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalBets: 0,
    totalUsers: 0,
    pendingBets: 0,
    wonBets: 0,
    lostBets: 0,
    avgBetAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const startDateTime = new Date(startDate).toISOString();
      const endDateTime = new Date(endDate + 'T23:59:59').toISOString();

      // Fetch bet statistics
      const { data: bets, error: betsError } = await supabase
        .from('bet_slips')
        .select('total_stake, status')
        .gte('created_at', startDateTime)
        .lte('created_at', endDateTime);

      if (betsError) throw betsError;

      // Fetch user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDateTime)
        .lte('created_at', endDateTime);

      if (userError) throw userError;

      // Calculate statistics
      const totalBets = bets?.length || 0;
      const totalRevenue = bets?.reduce((sum, bet) => sum + Number(bet.total_stake), 0) || 0;
      const pendingBets = bets?.filter(bet => bet.status === 'pending').length || 0;
      const wonBets = bets?.filter(bet => bet.status === 'won').length || 0;
      const lostBets = bets?.filter(bet => bet.status === 'lost').length || 0;
      const avgBetAmount = totalBets > 0 ? totalRevenue / totalBets : 0;

      setReportData({
        totalRevenue,
        totalBets,
        totalUsers: userCount || 0,
        pendingBets,
        wonBets,
        lostBets,
        avgBetAmount,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportType: string) => {
    try {
      toast.loading(`Generating ${reportType} report...`);
      
      // In production, this would call an edge function to generate PDF
      // For now, download data as CSV
      const csvData = `Report Type,${reportType}\nDate Range,${startDate} to ${endDate}\nTotal Revenue,₦${reportData.totalRevenue.toLocaleString()}\nTotal Bets,${reportData.totalBets}\nTotal Users,${reportData.totalUsers}\nPending Bets,${reportData.pendingBets}\nWon Bets,${reportData.wonBets}\nLost Bets,${reportData.lostBets}\nAvg Bet Amount,₦${reportData.avgBetAmount.toFixed(2)}`;
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType.toLowerCase().replace(' ', '-')}-report-${startDate}-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${reportType} report downloaded`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate comprehensive platform reports</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : `₦${reportData.totalRevenue.toLocaleString()}`}
                </div>
                <p className="text-xs text-muted-foreground">From {reportData.totalBets} bets</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  Bet Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {loading ? '...' : reportData.wonBets}
                </div>
                <p className="text-xs text-muted-foreground">
                  Won / {reportData.lostBets} Lost / {reportData.pendingBets} Pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  New Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {loading ? '...' : reportData.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">In selected period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  Avg Bet Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {loading ? '...' : `₦${reportData.avgBetAmount.toFixed(0)}`}
                </div>
                <p className="text-xs text-muted-foreground">Per bet placed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Revenue Report</h3>
                    <p className="text-sm text-muted-foreground">GGR, NGR, deposits</p>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => handleGenerateReport("Revenue")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">User Activity</h3>
                    <p className="text-sm text-muted-foreground">DAU, MAU, retention</p>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => handleGenerateReport("User Activity")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Bet Analysis</h3>
                    <p className="text-sm text-muted-foreground">Win rate, liability</p>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => handleGenerateReport("Bet Analysis")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

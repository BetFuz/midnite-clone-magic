import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, AlertTriangle, FileText, Download, Calendar, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AMLAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: string;
  description: string;
  status: string;
  created_at: string;
}

interface NLRCReport {
  id: string;
  quarter: string;
  year: number;
  quarter_number: number;
  gross_gaming_revenue: number;
  tax_payable: number;
  total_players: number;
  active_players: number;
  unpaid_tickets: number;
  unpaid_tickets_value: number;
  submitted_to_nlrc: boolean;
  exported_at: string;
}

const Compliance = () => {
  const [amlAlerts, setAmlAlerts] = useState<AMLAlert[]>([]);
  const [nlrcReports, setNlrcReports] = useState<NLRCReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));

  useEffect(() => {
    loadAMLAlerts();
    loadNLRCReports();
  }, []);

  const loadAMLAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('aml_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAmlAlerts(data || []);
    } catch (error) {
      console.error('Failed to load AML alerts:', error);
      toast.error('Failed to load AML alerts');
    }
  };

  const loadNLRCReports = async () => {
    try {
      const { data, error } = await supabase
        .from('nlrc_reports')
        .select('*')
        .order('year', { ascending: false })
        .order('quarter_number', { ascending: false });

      if (error) throw error;
      setNlrcReports(data || []);
    } catch (error) {
      console.error('Failed to load NLRC reports:', error);
      toast.error('Failed to load NLRC reports');
    }
  };

  const generateQuarterlyReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nlrc-quarterly-report', {
        body: {
          year: selectedYear,
          quarter: selectedQuarter,
        },
      });

      if (error) throw error;

      toast.success(`NLRC quarterly report generated for Q${selectedQuarter} ${selectedYear}`);
      loadNLRCReports();
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate quarterly report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (report: NLRCReport) => {
    const reportData = {
      quarter: report.quarter,
      year: report.year,
      gross_gaming_revenue: report.gross_gaming_revenue,
      tax_payable: report.tax_payable,
      total_players: report.total_players,
      active_players: report.active_players,
      unpaid_tickets: report.unpaid_tickets,
      unpaid_tickets_value: report.unpaid_tickets_value,
      generated_at: report.exported_at,
    };

    const csv = [
      ['Metric', 'Value'],
      ['Quarter', reportData.quarter],
      ['Year', reportData.year],
      ['Gross Gaming Revenue (NGN)', reportData.gross_gaming_revenue.toFixed(2)],
      ['Tax Payable (NGN)', reportData.tax_payable.toFixed(2)],
      ['Total Players', reportData.total_players],
      ['Active Players', reportData.active_players],
      ['Unpaid Tickets Count', reportData.unpaid_tickets],
      ['Unpaid Tickets Value (NGN)', reportData.unpaid_tickets_value.toFixed(2)],
      ['Generated At', reportData.generated_at],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NLRC_Report_${report.quarter}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Report downloaded');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'reviewing': return 'default';
      case 'resolved': return 'secondary';
      case 'escalated': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Regulatory Compliance
        </h1>
        <p className="text-muted-foreground mt-2">
          AML monitoring, document retention, and NLRC quarterly reporting
        </p>
      </div>

      {/* AML Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Anti-Money Laundering Alerts
          </CardTitle>
          <CardDescription>
            Flagged transactions and suspicious activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {amlAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No AML alerts. All transactions appear normal.
            </div>
          ) : (
            <div className="space-y-3">
              {amlAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge variant={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {alert.alert_type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm">{alert.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* NLRC Quarterly Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            NLRC Quarterly Reports
          </CardTitle>
          <CardDescription>
            Generate and download quarterly compliance reports for NLRC submission
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Year</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Quarter</label>
              <Select
                value={selectedQuarter.toString()}
                onValueChange={(value) => setSelectedQuarter(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(q => (
                    <SelectItem key={q} value={q.toString()}>
                      Q{q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateQuarterlyReport} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            {nlrcReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{report.quarter}</div>
                  <div className="text-sm text-muted-foreground">
                    GGR: ₦{report.gross_gaming_revenue.toFixed(2)} | 
                    Tax: ₦{report.tax_payable.toFixed(2)} | 
                    Players: {report.total_players}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {report.submitted_to_nlrc && (
                    <Badge variant="secondary">Submitted</Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReport(report)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Compliance;

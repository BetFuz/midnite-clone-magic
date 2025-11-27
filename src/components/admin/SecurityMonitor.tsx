import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFraudDetection } from '@/hooks/useFraudDetection';
import { Shield, AlertTriangle, CheckCircle, XCircle, FileText, RefreshCw, Eye } from 'lucide-react';
import { format } from 'date-fns';

export const SecurityMonitor = () => {
  const {
    alerts,
    isAnalyzing,
    securityReport,
    generateSecurityReport,
    updateAlertStatus,
    refreshAlerts
  } = useFraudDetection();

  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'investigating': return 'default';
      case 'resolved': return 'secondary';
      case 'dismissed': return 'outline';
      default: return 'secondary';
    }
  };

  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const investigatingAlerts = alerts.filter(a => a.status === 'investigating');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved' || a.status === 'dismissed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Security Monitor</h2>
            <p className="text-sm text-muted-foreground">AI-powered fraud detection and security analysis</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={refreshAlerts} variant="outline" disabled={isAnalyzing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={generateSecurityReport} disabled={isAnalyzing}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
              <p className="text-3xl font-bold">{alerts.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-destructive">{pendingAlerts.length}</p>
            </div>
            <Shield className="w-8 h-8 text-destructive" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Investigating</p>
              <p className="text-3xl font-bold">{investigatingAlerts.length}</p>
            </div>
            <Eye className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-3xl font-bold text-green-500">{resolvedAlerts.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Security Report */}
      {securityReport && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Security Report
          </h3>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">{securityReport}</pre>
          </div>
        </Card>
      )}

      {/* Alerts Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="investigating">
            Investigating ({investigatingAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Alerts ({alerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAlerts.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No pending alerts
            </Card>
          ) : (
            pendingAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onStatusChange={updateAlertStatus}
                onSelect={setSelectedAlert}
                getSeverityColor={getSeverityColor}
                getStatusColor={getStatusColor}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="investigating" className="space-y-4">
          {investigatingAlerts.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No alerts under investigation
            </Card>
          ) : (
            investigatingAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onStatusChange={updateAlertStatus}
                onSelect={setSelectedAlert}
                getSeverityColor={getSeverityColor}
                getStatusColor={getStatusColor}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedAlerts.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No resolved alerts
            </Card>
          ) : (
            resolvedAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onStatusChange={updateAlertStatus}
                onSelect={setSelectedAlert}
                getSeverityColor={getSeverityColor}
                getStatusColor={getStatusColor}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {alerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onStatusChange={updateAlertStatus}
              onSelect={setSelectedAlert}
              getSeverityColor={getSeverityColor}
              getStatusColor={getStatusColor}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <Card className="p-6 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-background shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold">Alert Details</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedAlert(null)}>
              <XCircle className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Severity</p>
              <Badge variant={getSeverityColor(selectedAlert.severity)}>
                {selectedAlert.severity.toUpperCase()}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{selectedAlert.alert_type}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p>{selectedAlert.description}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Details</p>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(selectedAlert.details, null, 2)}
              </pre>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p>{format(new Date(selectedAlert.created_at), 'PPpp')}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const AlertCard = ({ alert, onStatusChange, onSelect, getSeverityColor, getStatusColor }: any) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={getSeverityColor(alert.severity)}>
            {alert.severity.toUpperCase()}
          </Badge>
          <Badge variant={getStatusColor(alert.status)}>
            {alert.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(new Date(alert.created_at), 'PPp')}
          </span>
        </div>
        
        <p className="font-medium mb-1">{alert.alert_type.replace(/_/g, ' ').toUpperCase()}</p>
        <p className="text-sm text-muted-foreground">{alert.description}</p>
        
        {alert.details?.indicators && (
          <div className="mt-2">
            <p className="text-xs font-medium mb-1">Indicators:</p>
            <div className="flex flex-wrap gap-1">
              {alert.details.indicators.map((indicator: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {indicator}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 ml-4">
        <Button size="sm" variant="outline" onClick={() => onSelect(alert)}>
          <Eye className="w-4 h-4" />
        </Button>
        
        {alert.status === 'pending' && (
          <Button size="sm" variant="default" onClick={() => onStatusChange(alert.id, 'investigating')}>
            Investigate
          </Button>
        )}
        
        {alert.status === 'investigating' && (
          <>
            <Button size="sm" variant="default" onClick={() => onStatusChange(alert.id, 'resolved')}>
              <CheckCircle className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onStatusChange(alert.id, 'dismissed')}>
              <XCircle className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  </Card>
);

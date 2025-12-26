import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TenantSelector } from "@/components/admin/TenantSelector";
import { GlobalKPIDashboard } from "@/components/admin/GlobalKPIDashboard";
import { TenantManagement } from "@/components/admin/TenantManagement";
import { 
  Shield, Globe, Building2, Users, TrendingUp, 
  Settings, FileText, AlertTriangle
} from "lucide-react";

interface Tenant {
  id: string;
  country_code: string;
  country_name: string;
  currency: string;
  is_active: boolean;
}

const SuperAdminDashboard = () => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  return (
    <AdminGuard requireSuperAdmin={true}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header with Tenant Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Super Admin Console</h1>
                <p className="text-muted-foreground">
                  Multi-country platform management
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <TenantSelector 
                selectedTenant={selectedTenant}
                onTenantChange={setSelectedTenant}
                showGlobalOption={true}
              />
              <Badge variant="outline" className="gap-1 px-3 py-1">
                <Shield className="h-3 w-3" />
                Super Admin
              </Badge>
            </div>
          </div>

          {/* Current View Indicator */}
          {selectedTenant && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Viewing data for <strong>{selectedTenant.country_name}</strong>
                    </span>
                    <Badge variant="outline">{selectedTenant.currency}</Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedTenant(null)}
                  >
                    Switch to Global View
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tenants" className="gap-2">
                <Building2 className="h-4 w-4" />
                Tenants
              </TabsTrigger>
              <TabsTrigger value="compliance" className="gap-2">
                <FileText className="h-4 w-4" />
                Compliance
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <GlobalKPIDashboard selectedTenantId={selectedTenant?.id} />
              
              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      User Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => window.location.href = '/admin/users'}
                    >
                      View All Users
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => window.location.href = '/admin/reports'}
                    >
                      Generate Reports
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Audit Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => window.location.href = '/admin/audit'}
                    >
                      View Audit Trail
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tenants Tab */}
            <TabsContent value="tenants">
              <TenantManagement />
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Regulatory Compliance
                  </CardTitle>
                  <CardDescription>
                    License status and compliance requirements by country
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <Shield className="h-4 w-4" />
                        <span className="font-medium">All Licenses Valid</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        All operating countries have valid regulatory licenses.
                      </p>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <Button variant="outline" className="justify-start gap-2">
                        <FileText className="h-4 w-4" />
                        Download Compliance Report
                      </Button>
                      <Button variant="outline" className="justify-start gap-2">
                        <Settings className="h-4 w-4" />
                        Configure Alerts
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default SuperAdminDashboard;

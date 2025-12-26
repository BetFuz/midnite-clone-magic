import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, Plus, Settings, Users, Shield, 
  Calendar, Check, X, Edit, UserPlus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tenant {
  id: string;
  country_code: string;
  country_name: string;
  currency: string;
  timezone: string;
  is_active: boolean;
  regulatory_license: string | null;
  license_expiry: string | null;
  created_at: string;
}

interface AdminAssignment {
  id: string;
  user_id: string;
  tenant_id: string;
  admin_role: string;
  granted_at: string;
  user_email?: string;
}

const countryFlags: Record<string, string> = {
  NG: "🇳🇬",
  KE: "🇰🇪",
  GH: "🇬🇭",
  ZA: "🇿🇦",
  UG: "🇺🇬",
};

const adminRoles = [
  { value: 'country_admin', label: 'Country Admin' },
  { value: 'compliance_officer', label: 'Compliance Officer' },
  { value: 'finance_admin', label: 'Finance Admin' },
  { value: 'support_agent', label: 'Support Agent' },
];

export const TenantManagement = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [assignments, setAssignments] = useState<AdminAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', role: 'country_admin' });

  useEffect(() => {
    fetchTenants();
    fetchAssignments();
  }, []);

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('country_name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_tenant_assignments')
        .select('*')
        .is('revoked_at', null);

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const toggleTenantStatus = async (tenant: Tenant) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ is_active: !tenant.is_active })
        .eq('id', tenant.id);

      if (error) throw error;
      
      toast.success(`${tenant.country_name} ${tenant.is_active ? 'deactivated' : 'activated'}`);
      fetchTenants();
    } catch (error) {
      console.error('Error updating tenant:', error);
      toast.error('Failed to update tenant status');
    }
  };

  const getAdminsForTenant = (tenantId: string) => {
    return assignments.filter(a => a.tenant_id === tenantId);
  };

  const handleAssignAdmin = async () => {
    if (!selectedTenant || !newAdmin.email) return;

    try {
      // First find the user by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newAdmin.email)
        .single();

      if (profileError || !profiles) {
        toast.error('User not found with that email');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('admin_tenant_assignments')
        .insert([{
          user_id: profiles.id,
          tenant_id: selectedTenant.id,
          admin_role: newAdmin.role as "country_admin" | "compliance_officer" | "finance_admin" | "super_admin" | "support_agent",
          granted_by: user?.id,
        }]);

      if (error) throw error;

      toast.success(`Admin assigned to ${selectedTenant.country_name}`);
      setShowAddAdmin(false);
      setNewAdmin({ email: '', role: 'country_admin' });
      fetchAssignments();
    } catch (error: any) {
      console.error('Error assigning admin:', error);
      toast.error(error.message || 'Failed to assign admin');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Tenants Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Tenant Management
              </CardTitle>
              <CardDescription>
                Manage country tenants and their configurations
              </CardDescription>
            </div>
            <Button disabled className="gap-2">
              <Plus className="h-4 w-4" />
              Add Country
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Admins</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => {
                const admins = getAdminsForTenant(tenant.id);
                return (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{countryFlags[tenant.country_code] || "🌍"}</span>
                        <div>
                          <p className="font-medium">{tenant.country_name}</p>
                          <p className="text-xs text-muted-foreground">{tenant.timezone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tenant.currency}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {tenant.regulatory_license || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell>{formatDate(tenant.license_expiry)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {admins.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tenant.is_active ? 'default' : 'destructive'}>
                        {tenant.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setSelectedTenant(tenant)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <span className="text-xl">{countryFlags[tenant.country_code]}</span>
                                Manage {tenant.country_name} Admins
                              </DialogTitle>
                              <DialogDescription>
                                Assign administrators for this country
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {/* Current Admins */}
                              <div>
                                <h4 className="text-sm font-medium mb-2">Current Admins</h4>
                                {admins.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No admins assigned</p>
                                ) : (
                                  <div className="space-y-2">
                                    {admins.map((admin) => (
                                      <div key={admin.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                        <div>
                                          <p className="text-sm font-medium">{admin.user_email || admin.user_id.slice(0, 8)}</p>
                                          <Badge variant="outline" className="text-xs">
                                            {admin.admin_role.replace('_', ' ')}
                                          </Badge>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Add New Admin */}
                              <div className="border-t pt-4">
                                <h4 className="text-sm font-medium mb-2">Add New Admin</h4>
                                <div className="space-y-3">
                                  <div>
                                    <Label htmlFor="email">User Email</Label>
                                    <Input
                                      id="email"
                                      type="email"
                                      placeholder="admin@example.com"
                                      value={newAdmin.email}
                                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                      value={newAdmin.role}
                                      onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {adminRoles.map((role) => (
                                          <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <DialogFooter>
                              <Button onClick={() => {
                                setSelectedTenant(tenant);
                                handleAssignAdmin();
                              }}>
                                Assign Admin
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleTenantStatus(tenant)}
                        >
                          {tenant.is_active ? (
                            <X className="h-4 w-4 text-destructive" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admin Assignments Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Role Summary
          </CardTitle>
          <CardDescription>
            Overview of all admin assignments across countries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {adminRoles.map((role) => {
              const count = assignments.filter(a => a.admin_role === role.value).length;
              return (
                <div key={role.value} className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{role.label}s</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

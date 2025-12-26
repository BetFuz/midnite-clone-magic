import { useState, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Tenant {
  id: string;
  country_code: string;
  country_name: string;
  currency: string;
  is_active: boolean;
}

interface TenantSelectorProps {
  selectedTenant: Tenant | null;
  onTenantChange: (tenant: Tenant | null) => void;
  showGlobalOption?: boolean;
}

const countryFlags: Record<string, string> = {
  NG: "🇳🇬",
  KE: "🇰🇪",
  GH: "🇬🇭",
  ZA: "🇿🇦",
  UG: "🇺🇬",
};

export const TenantSelector = ({ 
  selectedTenant, 
  onTenantChange,
  showGlobalOption = true 
}: TenantSelectorProps) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, country_code, country_name, currency, is_active')
        .eq('is_active', true)
        .order('country_name');

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayLabel = () => {
    if (!selectedTenant) {
      return (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>Global View</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{countryFlags[selectedTenant.country_code] || "🌍"}</span>
        <span>{selectedTenant.country_name}</span>
      </div>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[180px] justify-between" disabled={loading}>
          {getDisplayLabel()}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        <DropdownMenuLabel>Select Region</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {showGlobalOption && (
          <>
            <DropdownMenuItem 
              onClick={() => onTenantChange(null)}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="flex-1">Global View</span>
              {!selectedTenant && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {tenants.map((tenant) => (
          <DropdownMenuItem 
            key={tenant.id}
            onClick={() => onTenantChange(tenant)}
            className="gap-2"
          >
            <span className="text-lg">{countryFlags[tenant.country_code] || "🌍"}</span>
            <span className="flex-1">{tenant.country_name}</span>
            <Badge variant="outline" className="text-xs">
              {tenant.currency}
            </Badge>
            {selectedTenant?.id === tenant.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

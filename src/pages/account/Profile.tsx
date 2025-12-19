import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, 
  Wallet, 
  History, 
  Bell, 
  HelpCircle, 
  Info, 
  Phone, 
  MessageCircle,
  FileText, 
  Shield, 
  LogOut,
  ChevronRight,
  Settings,
  Gamepad2
} from "lucide-react";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  hasArrow?: boolean;
  rightElement?: React.ReactNode;
}

const MenuItem = ({ icon, label, onClick, hasArrow = false, rightElement }: MenuItemProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between py-4 px-2 hover:bg-muted/50 transition-colors rounded-lg group"
  >
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground group-hover:text-primary transition-colors">
        {icon}
      </span>
      <span className="text-foreground font-medium">{label}</span>
    </div>
    {rightElement || (hasArrow && (
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    ))}
  </button>
);

const Profile = () => {
  const { user, profile, loading } = useUserProfile();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    toast({
      title: enabled ? "Notifications Enabled" : "Notifications Disabled",
      description: enabled 
        ? "You will receive betting updates and promotions." 
        : "You won't receive notifications anymore.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : profile?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          {/* Gaming Banner */}
          <Card className="relative overflow-hidden mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 border-0">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gamepad2 className="h-8 w-8 text-white" />
                <div>
                  <p className="text-white/80 text-xs uppercase tracking-wider">Gaming Channel</p>
                  <p className="text-white font-bold text-lg">LIVE GAMING</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-sm">Live Now</span>
              </div>
            </div>
          </Card>

          {/* User Info Card */}
          <Card className="p-4 bg-card border-border mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-1">
                    <Settings className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {profile?.full_name || 'User Name'}
                  </h2>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
                <Badge className="bg-primary text-primary-foreground px-4 py-2 text-lg font-bold">
                  {formatCurrency(profile?.balance || 0)}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Menu Items */}
          <Card className="bg-card border-border">
            <div className="p-2">
              {/* Primary Actions */}
              <MenuItem
                icon={<Wallet className="h-5 w-5" />}
                label="Wallet"
                hasArrow
                onClick={() => navigate("/account/deposits")}
              />
              <MenuItem
                icon={<History className="h-5 w-5" />}
                label="Transaction History"
                hasArrow
                onClick={() => navigate("/account/transactions")}
              />
              <MenuItem
                icon={<Bell className="h-5 w-5" />}
                label="My Notifications"
                hasArrow
                onClick={() => navigate("/account/settings")}
              />
              <MenuItem
                icon={<HelpCircle className="h-5 w-5" />}
                label="How to Play"
                hasArrow
                onClick={() => navigate("/info/how-to-play")}
              />

              <Separator className="my-2" />

              {/* Info Section */}
              <MenuItem
                icon={<Info className="h-5 w-5" />}
                label="About Us"
                onClick={() => navigate("/info/about")}
              />
              <MenuItem
                icon={<Phone className="h-5 w-5" />}
                label="Contact Us"
                onClick={() => navigate("/info/contact")}
              />
              <MenuItem
                icon={<MessageCircle className="h-5 w-5" />}
                label="FAQ"
                onClick={() => navigate("/info/faq")}
              />
              <MenuItem
                icon={<HelpCircle className="h-5 w-5" />}
                label="Help"
                onClick={() => navigate("/info/help")}
              />

              <Separator className="my-2" />

              {/* Legal */}
              <MenuItem
                icon={<Shield className="h-5 w-5" />}
                label="Privacy Policy"
                onClick={() => navigate("/info/privacy")}
              />
              <MenuItem
                icon={<FileText className="h-5 w-5" />}
                label="Terms of Service"
                onClick={() => navigate("/info/terms")}
              />

              <Separator className="my-2" />

              {/* Notification Toggle */}
              <MenuItem
                icon={<Bell className="h-5 w-5" />}
                label="Notifications"
                rightElement={
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={handleNotificationToggle}
                  />
                }
              />

              <Separator className="my-2" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 py-4 px-2 hover:bg-destructive/10 transition-colors rounded-lg group"
              >
                <LogOut className="h-5 w-5 text-destructive" />
                <span className="text-destructive font-medium">Logout</span>
              </button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Profile;

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { AccountNav } from '@/components/account/AccountNav';
import EnhancedProfile from '@/components/account/EnhancedProfile';
import AdvancedTransactions from '@/components/account/AdvancedTransactions';
import VIPTierProgression from '@/components/account/VIPTierProgression';
import BettingInsightsDashboard from '@/components/account/BettingInsightsDashboard';
import NotificationPreferences from '@/components/account/NotificationPreferences';

const EnhancedAccountHub = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden md:flex" />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">My Account</h1>
              <p className="text-muted-foreground">
                Manage your profile, view insights, and control your account settings
              </p>
            </div>

            <AccountNav />

            <Tabs defaultValue="profile" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="vip">VIP Status</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <EnhancedProfile />
              </TabsContent>

              <TabsContent value="transactions">
                <AdvancedTransactions />
              </TabsContent>

              <TabsContent value="vip">
                <VIPTierProgression />
              </TabsContent>

              <TabsContent value="insights">
                <BettingInsightsDashboard />
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationPreferences />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedAccountHub;

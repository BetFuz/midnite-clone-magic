import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AIBettingChat from "@/components/AIBettingChat";
import VoiceBetting from "@/components/VoiceBetting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Mic, TrendingUp, Users, ShoppingCart } from "lucide-react";

const AIFeatures = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">AI-Powered Features</h1>
              <p className="text-muted-foreground">
                Next-generation betting experience with artificial intelligence
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                <TabsTrigger value="chat" className="gap-2">
                  <Bot className="h-4 w-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="voice" className="gap-2">
                  <Mic className="h-4 w-4" />
                  Voice Betting
                </TabsTrigger>
                <TabsTrigger value="predictions" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  AI Predictions
                </TabsTrigger>
                <TabsTrigger value="social" className="gap-2">
                  <Users className="h-4 w-4" />
                  Social Betting
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Bet Trading
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat">
                <AIBettingChat />
              </TabsContent>

              <TabsContent value="voice">
                <VoiceBetting />
              </TabsContent>

              <TabsContent value="predictions">
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">AI Match Predictions</h3>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="social">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Social Betting Community</h3>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="marketplace">
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Bet Trading Marketplace</h3>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIFeatures;
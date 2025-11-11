import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Glasses, Maximize, Volume2, Users, Eye, Settings } from "lucide-react";
import { useVRExperiences } from "@/hooks/useVRExperiences";
import { Skeleton } from "@/components/ui/skeleton";

const VirtualStadium = () => {
  const [vrMode, setVrMode] = useState(false);
  const { experiences, isLoading, startSession } = useVRExperiences();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileNav />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 md:ml-64 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto p-4 md:p-6">
              <Skeleton className="h-12 w-64 mb-6" />
              <Skeleton className="h-96 mb-6" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const totalViewers = experiences.reduce((sum, exp) => sum + exp.viewer_count, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileNav />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 md:ml-64 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Glasses className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Virtual Stadium</h1>
                  <p className="text-muted-foreground">Immersive AR/VR betting experience</p>
                </div>
              </div>
              <Button onClick={() => setVrMode(!vrMode)} className="gap-2">
                <Glasses className="w-4 h-4" />
                {vrMode ? "Exit VR Mode" : "Enter VR Mode"}
              </Button>
            </div>

            <Card className="p-0 overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Glasses className="w-24 h-24 text-white opacity-60 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Virtual Stadium Experience</h3>
                    <p className="text-white/80 mb-6">Click "Enter VR Mode" to start</p>
                    <div className="flex gap-4 justify-center">
                      <Badge className="bg-white/20 text-white border-white/40 px-4 py-2">
                        <Users className="w-4 h-4 mr-2" />
                        {totalViewers.toLocaleString()} viewers
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/40 px-4 py-2">
                        <Eye className="w-4 h-4 mr-2" />
                        {experiences.filter(e => e.status === "live").length} Live
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button size="icon" variant="secondary">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="secondary">
                        <Maximize className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="secondary">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button className="gap-2">
                      <Glasses className="w-4 h-4" />
                      Enter VR Stadium
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                  <Glasses className="w-6 h-6 text-cyan-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">360° Stadium View</h3>
                <p className="text-sm text-muted-foreground">
                  Experience matches from any seat with full 360-degree views
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Live Stats Overlay</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time statistics and betting odds in your view
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Social Viewing</h3>
                <p className="text-sm text-muted-foreground">
                  Watch with friends in virtual lounges
                </p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Available Virtual Experiences</h3>
              {experiences.length === 0 ? (
                <div className="text-center py-8">
                  <Glasses className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No VR experiences available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {experiences.map(exp => (
                    <div key={exp.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-semibold">{exp.stadium_name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">{exp.status}</Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {exp.viewer_count.toLocaleString()} viewers
                          </span>
                        </div>
                      </div>
                      <Button onClick={() => startSession(exp.id)}>
                        <Glasses className="w-4 h-4 mr-2" />
                        Enter
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VirtualStadium;

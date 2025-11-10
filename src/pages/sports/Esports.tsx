import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Esports = () => {
  const csgoMatches = [
    { team1: "FaZe Clan", team2: "Natus Vincere", tournament: "IEM Katowice", time: "Today 18:00", live: false },
    { team1: "Team Vitality", team2: "G2 Esports", tournament: "BLAST Premier", time: "Live", live: true },
  ];

  const dota2Matches = [
    { team1: "Team Spirit", team2: "PSG.LGD", tournament: "The International", time: "Today 16:00", live: false },
    { team1: "OG", team2: "Team Liquid", tournament: "DreamLeague", time: "Tomorrow 14:00", live: false },
  ];

  const lolMatches = [
    { team1: "T1", team2: "Gen.G", tournament: "LCK Spring", time: "Today 12:00", live: false },
    { team1: "G2 Esports", team2: "Fnatic", tournament: "LEC Spring", time: "Live", live: true },
  ];

  const valorantMatches = [
    { team1: "Sentinels", team2: "OpTic Gaming", tournament: "VCT Masters", time: "Today 20:00", live: false },
    { team1: "Loud", team2: "DRX", tournament: "VCT Champions", time: "Tomorrow 19:00", live: false },
  ];

  const fifaMatches = [
    { player1: "MSDossary", player2: "Tekkz", tournament: "FIFAe World Cup", time: "Today 15:00", live: false },
    { player1: "Nicolas99fc", player2: "Anders Vejrgang", tournament: "ePremier League", time: "Live", live: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">eSports Betting</h1>
          
          <Tabs defaultValue="csgo" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="csgo">CS:GO</TabsTrigger>
              <TabsTrigger value="dota2">Dota 2</TabsTrigger>
              <TabsTrigger value="lol">LoL</TabsTrigger>
              <TabsTrigger value="valorant">Valorant</TabsTrigger>
              <TabsTrigger value="fifa">FIFA/EA FC</TabsTrigger>
            </TabsList>
            
            <TabsContent value="csgo">
              <div className="grid gap-4">
                {csgoMatches.map((match, i) => (
                  <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{match.team1} vs {match.team2}</h3>
                        <p className="text-sm text-muted-foreground">{match.tournament}</p>
                      </div>
                      <div className="text-right">
                        {match.live ? (
                          <Badge className="bg-destructive">LIVE</Badge>
                        ) : (
                          <p className="text-sm text-primary">{match.time}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="dota2">
              <div className="grid gap-4">
                {dota2Matches.map((match, i) => (
                  <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{match.team1} vs {match.team2}</h3>
                        <p className="text-sm text-muted-foreground">{match.tournament}</p>
                      </div>
                      <div className="text-right">
                        {match.live ? (
                          <Badge className="bg-destructive">LIVE</Badge>
                        ) : (
                          <p className="text-sm text-primary">{match.time}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="lol">
              <div className="grid gap-4">
                {lolMatches.map((match, i) => (
                  <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{match.team1} vs {match.team2}</h3>
                        <p className="text-sm text-muted-foreground">{match.tournament}</p>
                      </div>
                      <div className="text-right">
                        {match.live ? (
                          <Badge className="bg-destructive">LIVE</Badge>
                        ) : (
                          <p className="text-sm text-primary">{match.time}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="valorant">
              <div className="grid gap-4">
                {valorantMatches.map((match, i) => (
                  <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{match.team1} vs {match.team2}</h3>
                        <p className="text-sm text-muted-foreground">{match.tournament}</p>
                      </div>
                      <div className="text-right">
                        {match.live ? (
                          <Badge className="bg-destructive">LIVE</Badge>
                        ) : (
                          <p className="text-sm text-primary">{match.time}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="fifa">
              <div className="grid gap-4">
                {fifaMatches.map((match, i) => (
                  <Card key={i} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{match.player1} vs {match.player2}</h3>
                        <p className="text-sm text-muted-foreground">{match.tournament}</p>
                      </div>
                      <div className="text-right">
                        {match.live ? (
                          <Badge className="bg-destructive">LIVE</Badge>
                        ) : (
                          <p className="text-sm text-primary">{match.time}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default Esports;

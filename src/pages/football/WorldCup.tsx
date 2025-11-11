import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, MapPin, Users, Calendar, Newspaper, Scale, TrendingUp, History, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const WorldCup = () => {
  const upcomingMatches = [
    { time: "Mon 14:00", homeTeam: "Brazil", awayTeam: "Argentina", homeOdds: "2.20", drawOdds: "3.10", awayOdds: "3.40", stage: "Group A" },
    { time: "Mon 18:00", homeTeam: "France", awayTeam: "Germany", homeOdds: "2.40", drawOdds: "3.00", awayOdds: "3.20", stage: "Group B" },
    { time: "Tue 14:00", homeTeam: "Spain", awayTeam: "Portugal", homeOdds: "2.10", drawOdds: "3.20", awayOdds: "3.60", stage: "Group C" },
    { time: "Tue 18:00", homeTeam: "England", awayTeam: "Italy", homeOdds: "2.30", drawOdds: "3.10", awayOdds: "3.30", stage: "Group D" },
    { time: "Wed 14:00", homeTeam: "Netherlands", awayTeam: "Belgium", homeOdds: "2.50", drawOdds: "3.00", awayOdds: "3.00", stage: "Group E" },
    { time: "Wed 18:00", homeTeam: "Nigeria", awayTeam: "Morocco", homeOdds: "2.80", drawOdds: "2.90", awayOdds: "2.60", stage: "Group F" },
  ];

  const topPlayers = [
    { name: "Kylian Mbappé", country: "France", position: "Forward", odds: "4.50", stat: "7 goals" },
    { name: "Lionel Messi", country: "Argentina", position: "Forward", odds: "5.00", stat: "6 goals, 4 assists" },
    { name: "Cristiano Ronaldo", country: "Portugal", position: "Forward", odds: "6.50", stat: "5 goals" },
    { name: "Victor Osimhen", country: "Nigeria", position: "Forward", odds: "8.00", stat: "4 goals" },
    { name: "Mohamed Salah", country: "Egypt", position: "Forward", odds: "7.50", stat: "4 goals, 3 assists" },
    { name: "Erling Haaland", country: "Norway", position: "Forward", odds: "5.50", stat: "6 goals" },
  ];

  const hostCities = [
    { name: "New York", country: "USA", stadium: "MetLife Stadium", capacity: "82,500", matches: "8 matches" },
    { name: "Los Angeles", country: "USA", stadium: "SoFi Stadium", capacity: "70,000", matches: "8 matches" },
    { name: "Mexico City", country: "Mexico", stadium: "Estadio Azteca", capacity: "87,000", matches: "8 matches" },
    { name: "Toronto", country: "Canada", stadium: "BMO Field", capacity: "45,000", matches: "6 matches" },
    { name: "Miami", country: "USA", stadium: "Hard Rock Stadium", capacity: "65,000", matches: "7 matches (Final)" },
  ];

  const newsItems = [
    { 
      title: "African Teams Set for Historic World Cup Performance", 
      excerpt: "Nigeria, Morocco, Senegal, and Egypt prepare for what could be Africa's best World Cup showing yet.",
      time: "2 hours ago"
    },
    { 
      title: "Messi Confirms This Will Be His Final World Cup", 
      excerpt: "Argentina captain announces 2026 will be his last World Cup appearance, looking to defend the title.",
      time: "5 hours ago"
    },
    { 
      title: "Record-Breaking Ticket Sales Expected", 
      excerpt: "FIFA announces unprecedented demand for World Cup 2026 tickets across all host cities.",
      time: "1 day ago"
    },
    { 
      title: "Technology Revolution: VAR 2.0 and AI Offside Detection", 
      excerpt: "World Cup 2026 to feature most advanced technology in football history.",
      time: "2 days ago"
    },
  ];

  const politicalTopics = [
    { 
      title: "Tri-Nation Hosting Controversy", 
      description: "First World Cup hosted by three nations (USA, Mexico, Canada) raises logistical and political questions.",
      impact: "High"
    },
    { 
      title: "African Representation Fight", 
      description: "CAF pushes for increased African team slots - currently 9 teams qualified, but should there be more?",
      impact: "High"
    },
    { 
      title: "Player Migration & Eligibility", 
      description: "Debate over dual-nationality players choosing between European and African national teams.",
      impact: "Medium"
    },
    { 
      title: "Broadcasting Rights Battle", 
      description: "African nations negotiate for better broadcasting revenue share and free-to-air coverage.",
      impact: "Medium"
    },
    { 
      title: "Human Rights & Worker Conditions", 
      description: "Scrutiny on stadium construction conditions and labor practices in host nations.",
      impact: "High"
    },
  ];

  const handlePlaceBet = (type: string) => {
    toast({
      title: "Bet Placed",
      description: `Your ${type} bet has been added to the slip`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24">
          {/* Hero Section */}
          <div className="mb-6 bg-gradient-to-r from-primary/20 via-primary/10 to-background rounded-lg p-6 border border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-8 w-8 text-primary" />
                  <h1 className="text-4xl font-bold text-foreground">FIFA World Cup 2026</h1>
                </div>
                <p className="text-muted-foreground mb-3">USA 🇺🇸 • Mexico 🇲🇽 • Canada 🇨🇦</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">48 Teams</Badge>
                  <Badge variant="secondary">104 Matches</Badge>
                  <Badge variant="secondary">16 Cities</Badge>
                  <Badge className="bg-green-600 hover:bg-green-700">9 African Teams</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary mb-1">52 Days</div>
                <div className="text-sm text-muted-foreground">Until Kickoff</div>
                <Button className="mt-3" onClick={() => handlePlaceBet("tournament winner")}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Bet on Winner
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Newspaper className="h-4 w-4" />
                <span className="hidden sm:inline">News</span>
              </TabsTrigger>
              <TabsTrigger value="politics" className="flex items-center gap-1">
                <Scale className="h-4 w-4" />
                <span className="hidden sm:inline">Politics</span>
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Teams</span>
              </TabsTrigger>
              <TabsTrigger value="players" className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Players</span>
              </TabsTrigger>
              <TabsTrigger value="venues" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Venues</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="betting" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Betting</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview & News Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5" />
                    Latest World Cup News
                  </CardTitle>
                  <CardDescription>Breaking news and updates from the tournament</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {newsItems.map((news, i) => (
                    <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{news.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{news.excerpt}</p>
                          <span className="text-xs text-muted-foreground">{news.time}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tournament Format</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">Group Stage</div>
                      <p className="text-sm text-muted-foreground">12 groups of 4 teams each</p>
                      <p className="text-xs text-muted-foreground mt-2">Top 2 from each group advance</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">Knockout</div>
                      <p className="text-sm text-muted-foreground">Round of 32 → Final</p>
                      <p className="text-xs text-muted-foreground mt-2">Single elimination format</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">Final</div>
                      <p className="text-sm text-muted-foreground">July 19, 2026</p>
                      <p className="text-xs text-muted-foreground mt-2">Hard Rock Stadium, Miami</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Politics & Controversies Tab */}
            <TabsContent value="politics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Political Issues & Controversies
                  </CardTitle>
                  <CardDescription>Key political debates surrounding World Cup 2026</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {politicalTopics.map((topic, i) => (
                    <div key={i} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{topic.title}</h3>
                        <Badge variant={topic.impact === "High" ? "destructive" : "secondary"}>
                          {topic.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{topic.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bet on Political Outcomes</CardTitle>
                  <CardDescription>Predict non-sporting World Cup outcomes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handlePlaceBet("political")}>
                    <span className="text-sm font-medium">Will African teams get more slots for 2030?</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Yes 1.85</Button>
                      <Button size="sm" variant="outline">No 1.95</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handlePlaceBet("political")}>
                    <span className="text-sm font-medium">Most controversial VAR decision during tournament?</span>
                    <Button size="sm">Place Bet</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Qualified Teams (48 Total)
                  </CardTitle>
                  <CardDescription>All teams competing in World Cup 2026</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        🌍 Africa (9 Teams)
                        <Badge className="bg-green-600">9 Teams</Badge>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {["Nigeria 🇳🇬", "Morocco 🇲🇦", "Senegal 🇸🇳", "Egypt 🇪🇬", "Cameroon 🇨🇲", "Algeria 🇩🇿", "Tunisia 🇹🇳", "Ghana 🇬🇭", "Ivory Coast 🇨🇮"].map((team, i) => (
                          <div key={i} className="p-3 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                            <span className="text-sm font-medium">{team}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        🌎 South America (6 Teams)
                        <Badge variant="secondary">6 Teams</Badge>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {["Brazil 🇧🇷", "Argentina 🇦🇷", "Uruguay 🇺🇾", "Colombia 🇨🇴", "Chile 🇨🇱", "Ecuador 🇪🇨"].map((team, i) => (
                          <div key={i} className="p-3 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                            <span className="text-sm font-medium">{team}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        🌍 Europe (16 Teams)
                        <Badge variant="secondary">16 Teams</Badge>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {["France 🇫🇷", "Germany 🇩🇪", "Spain 🇪🇸", "England 🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Portugal 🇵🇹", "Belgium 🇧🇪", "Netherlands 🇳🇱", "Italy 🇮🇹", "Croatia 🇭🇷", "Denmark 🇩🇰", "Switzerland 🇨🇭", "Poland 🇵🇱", "Serbia 🇷🇸", "Sweden 🇸🇪", "Austria 🇦🇹", "Czech Republic 🇨🇿"].map((team, i) => (
                          <div key={i} className="p-3 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                            <span className="text-sm font-medium">{team}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Players Tab */}
            <TabsContent value="players" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Top Players to Watch
                  </CardTitle>
                  <CardDescription>Golden Boot favorites and star players</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topPlayers.map((player, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-semibold text-foreground">{player.name}</div>
                            <div className="text-sm text-muted-foreground">{player.country} • {player.position}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{player.stat}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handlePlaceBet(`${player.name} golden boot`)}>
                        Golden Boot {player.odds}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Venues Tab */}
            <TabsContent value="venues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Host Cities & Stadiums
                  </CardTitle>
                  <CardDescription>16 cities across USA, Mexico, and Canada</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hostCities.map((city, i) => (
                    <div key={i} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{city.name}, {city.country}</h3>
                          <p className="text-sm text-muted-foreground mb-1">{city.stadium}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">Capacity: {city.capacity}</Badge>
                            <Badge variant="outline">{city.matches}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Matches
                  </CardTitle>
                  <CardDescription>Next fixtures and betting odds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingMatches.map((match, i) => (
                    <MatchCard key={i} {...match} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Betting Markets Tab */}
            <TabsContent value="betting" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tournament Winner Odds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { team: "Brazil", odds: "4.50" },
                    { team: "France", odds: "5.00" },
                    { team: "Argentina", odds: "5.50" },
                    { team: "England", odds: "6.50" },
                    { team: "Spain", odds: "7.00" },
                    { team: "Germany", odds: "7.50" },
                    { team: "Nigeria", odds: "35.00", african: true },
                    { team: "Morocco", odds: "40.00", african: true },
                    { team: "Senegal", odds: "45.00", african: true },
                  ].map((team, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handlePlaceBet(`${team.team} winner`)}>
                      <span className="font-medium flex items-center gap-2">
                        {team.team}
                        {team.african && <Badge className="bg-green-600 text-xs">🌍</Badge>}
                      </span>
                      <Button size="sm" variant="outline">{team.odds}</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    World Cup History
                  </CardTitle>
                  <CardDescription>Past winners and memorable moments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { year: "2022", winner: "Argentina 🇦🇷", runnerUp: "France", location: "Qatar" },
                      { year: "2018", winner: "France 🇫🇷", runnerUp: "Croatia", location: "Russia" },
                      { year: "2014", winner: "Germany 🇩🇪", runnerUp: "Argentina", location: "Brazil" },
                      { year: "2010", winner: "Spain 🇪🇸", runnerUp: "Netherlands", location: "South Africa" },
                      { year: "2006", winner: "Italy 🇮🇹", runnerUp: "France", location: "Germany" },
                    ].map((wc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <div className="font-semibold">{wc.year} - {wc.location}</div>
                          <div className="text-sm text-muted-foreground">Winner: {wc.winner} • Runner-up: {wc.runnerUp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <BetSlip className="hidden md:flex" />
      </div>
    </div>
  );
};

export default WorldCup;

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, MapPin, Users, Calendar, Newspaper, Scale, TrendingUp, History, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import afconHero from "@/assets/promos/afcon-hero.jpg";
import afconBetting from "@/assets/promos/afcon-betting.jpg";
import afconGoldenBoot from "@/assets/promos/afcon-golden-boot.jpg";
import afconNigeriaHost from "@/assets/promos/afcon-nigeria-host.jpg";
import afconGroups from "@/assets/promos/afcon-groups.jpg";
import afconVenues from "@/assets/promos/afcon-venues.jpg";
import afconFinal from "@/assets/promos/afcon-final.jpg";
import afconFavorites from "@/assets/promos/afcon-favorites.jpg";
import { Link } from "react-router-dom";

const AFCON = () => {
  const upcomingMatches = [
    { time: "Mon 17:00", homeTeam: "Nigeria", awayTeam: "Egypt", homeOdds: "2.40", drawOdds: "3.00", awayOdds: "3.20", stage: "Group A" },
    { time: "Mon 20:00", homeTeam: "Senegal", awayTeam: "Algeria", homeOdds: "2.30", drawOdds: "3.10", awayOdds: "3.30", stage: "Group B" },
    { time: "Tue 17:00", homeTeam: "Morocco", awayTeam: "Cameroon", homeOdds: "2.20", drawOdds: "3.10", awayOdds: "3.50", stage: "Group C" },
    { time: "Tue 20:00", homeTeam: "Ghana", awayTeam: "Ivory Coast", homeOdds: "2.50", drawOdds: "3.00", awayOdds: "3.00", stage: "Group D" },
    { time: "Wed 17:00", homeTeam: "Tunisia", awayTeam: "Mali", homeOdds: "2.60", drawOdds: "2.90", awayOdds: "2.80", stage: "Group E" },
    { time: "Wed 20:00", homeTeam: "South Africa", awayTeam: "Congo DR", homeOdds: "2.70", drawOdds: "2.90", awayOdds: "2.70", stage: "Group F" },
  ];

  const topPlayers = [
    { name: "Victor Osimhen", country: "Nigeria", position: "Forward", odds: "3.50", stat: "12 goals for Nigeria" },
    { name: "Mohamed Salah", country: "Egypt", position: "Forward", odds: "4.00", stat: "National team captain" },
    { name: "Sadio Mané", country: "Senegal", position: "Forward", odds: "4.50", stat: "AFCON 2021 winner" },
    { name: "Achraf Hakimi", country: "Morocco", position: "Defender", odds: "8.00", stat: "World Cup semi-finalist" },
    { name: "Riyad Mahrez", country: "Algeria", position: "Midfielder", odds: "5.50", stat: "Former AFCON champion" },
    { name: "Yoane Wissa", country: "Congo DR", position: "Forward", odds: "6.50", stat: "Rising star" },
  ];

  const hostCities = [
    { name: "Lagos", country: "Nigeria", stadium: "National Stadium Lagos", capacity: "55,000", matches: "Opening Ceremony + 8 matches" },
    { name: "Abuja", country: "Nigeria", stadium: "Moshood Abiola Stadium", capacity: "60,491", matches: "6 matches including Semi-Final" },
    { name: "Port Harcourt", country: "Nigeria", stadium: "Adokiye Amiesimaka Stadium", capacity: "38,000", matches: "5 matches" },
    { name: "Kano", country: "Nigeria", stadium: "Sani Abacha Stadium", capacity: "25,000", matches: "4 matches" },
    { name: "Ibadan", country: "Nigeria", stadium: "Lekan Salami Stadium", capacity: "18,000", matches: "Final + 5 matches" },
  ];

  const newsItems = [
    { 
      title: "Nigeria Hosting AFCON 2027: Infrastructure Rush Begins", 
      excerpt: "Major stadium renovations underway across Lagos, Abuja, and Port Harcourt as Nigeria prepares to host Africa's biggest football event.",
      time: "1 hour ago"
    },
    { 
      title: "Super Eagles Training Camp Opens in Abuja", 
      excerpt: "Nigeria's national team begins preparations with 30-man provisional squad ahead of AFCON qualifiers.",
      time: "3 hours ago"
    },
    { 
      title: "Morocco Aims for Fourth AFCON Title", 
      excerpt: "Atlas Lions enter tournament as favorites after impressive World Cup 2022 performance.",
      time: "6 hours ago"
    },
    { 
      title: "CAF Announces Record Prize Money for AFCON 2025", 
      excerpt: "Winners to receive $7 million, highest in tournament history, as CAF invests in African football.",
      time: "1 day ago"
    },
  ];

  const politicalTopics = [
    { 
      title: "Nigeria vs Morocco Hosting Rivalry", 
      description: "Ongoing diplomatic tensions as both nations compete to be Africa's premier football host nation.",
      impact: "Medium"
    },
    { 
      title: "Player Eligibility & Dual Nationality Debates", 
      description: "African FAs fight for players choosing between African nations and European countries with dual citizenship.",
      impact: "High"
    },
    { 
      title: "CAF Revenue Distribution Controversy", 
      description: "Smaller nations demand better revenue sharing from tournament profits and broadcasting rights.",
      impact: "High"
    },
    { 
      title: "Security Concerns & Terrorism Threats", 
      description: "Host nation security preparations scrutinized amid regional instability concerns.",
      impact: "High"
    },
    { 
      title: "Referee Bias & VAR Implementation", 
      description: "Calls for improved officiating standards and consistent VAR usage across all matches.",
      impact: "Medium"
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
          {/* Promotional Carousel */}
          <Carousel className="mb-6">
            <CarouselContent>
              <CarouselItem>
                <div className="relative overflow-hidden rounded-2xl h-64">
                  <img src={afconHero} alt="AFCON 2027" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Africa Cup of Nations 2027</h2>
                      <p className="text-white/90 mb-4">Nigeria hosts the continent's biggest football celebration</p>
                      <Button className="bg-white text-primary hover:bg-gray-100" asChild>
                        <Link to="/football/african-cup-of-nations">Explore Tournament</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="relative overflow-hidden rounded-2xl h-64">
                  <img src={afconBetting} alt="Bet on AFCON" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Bet on AFCON 2027</h2>
                      <p className="text-white/90 mb-4">Enhanced odds on all tournament matches</p>
                      <Button className="bg-white text-primary hover:bg-gray-100" onClick={() => handlePlaceBet("tournament winner")}>
                        View Markets
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="relative overflow-hidden rounded-2xl h-64">
                  <img src={afconGoldenBoot} alt="Golden Boot Race" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Golden Boot Race</h2>
                      <p className="text-white/90 mb-4">Bet on Africa's top goal scorer</p>
                      <Button className="bg-white text-primary hover:bg-gray-100" onClick={() => handlePlaceBet("golden boot")}>
                        Place Bet
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="relative overflow-hidden rounded-2xl h-64">
                  <img src={afconNigeriaHost} alt="Nigeria Host Nation" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Nigeria 2027 Host Nation</h2>
                      <p className="text-white/90 mb-4">Discover the pride of African football hosting</p>
                      <Button className="bg-white text-primary hover:bg-gray-100" onClick={() => handlePlaceBet("host nation")}>
                        Explore Venues
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="relative overflow-hidden rounded-2xl h-64">
                  <img src={afconGroups} alt="Group Stage Draw" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Group Stage Draw</h2>
                      <p className="text-white/90 mb-4">24 teams, 6 groups - the battle begins</p>
                      <Button className="bg-white text-primary hover:bg-gray-100" onClick={() => handlePlaceBet("group stage")}>
                        View Groups
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="relative overflow-hidden rounded-2xl h-64">
                  <img src={afconVenues} alt="World-Class Venues" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">World-Class Venues</h2>
                      <p className="text-white/90 mb-4">5 stunning stadiums across Nigeria</p>
                      <Button className="bg-white text-primary hover:bg-gray-100" onClick={() => handlePlaceBet("venues")}>
                        Explore Stadiums
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="relative overflow-hidden rounded-2xl h-64">
                  <img src={afconFinal} alt="Road to the Final" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Road to the Final</h2>
                      <p className="text-white/90 mb-4">Who will lift the trophy in Lagos?</p>
                      <Button className="bg-white text-primary hover:bg-gray-100" onClick={() => handlePlaceBet("final")}>
                        Bet on Final
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="relative overflow-hidden rounded-2xl h-64">
                  <img src={afconFavorites} alt="Favorites to Win" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Favorites to Win</h2>
                      <p className="text-white/90 mb-4">Nigeria, Senegal, Morocco - who wins it all?</p>
                      <Button className="bg-white text-primary hover:bg-gray-100" onClick={() => handlePlaceBet("favorites")}>
                        Place Bet
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          {/* Hero Section */}
          <div className="mb-6 bg-gradient-to-r from-green-600/20 via-green-600/10 to-background rounded-lg p-6 border border-green-600/20">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-8 w-8 text-green-600" />
                  <h1 className="text-4xl font-bold text-foreground">Africa Cup of Nations 2027</h1>
                </div>
                <p className="text-muted-foreground mb-3">🇳🇬 Hosted by Nigeria • The Biggest Football Tournament in Africa</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">24 Teams</Badge>
                  <Badge variant="secondary">52 Matches</Badge>
                  <Badge variant="secondary">5 Cities</Badge>
                  <Badge className="bg-green-600 hover:bg-green-700">All African Teams</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600 mb-1">645 Days</div>
                <div className="text-sm text-muted-foreground">Until Kickoff</div>
                <Button className="mt-3 bg-green-600 hover:bg-green-700" onClick={() => handlePlaceBet("AFCON winner")}>
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
                <Star className="h-4 w-4" />
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
                    Latest AFCON News
                  </CardTitle>
                  <CardDescription>Breaking news from African football</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {newsItems.map((news, i) => (
                    <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <h3 className="font-semibold text-foreground mb-1">{news.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{news.excerpt}</p>
                      <span className="text-xs text-muted-foreground">{news.time}</span>
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
                    <div className="bg-green-600/10 p-4 rounded-lg border border-green-600/20">
                      <div className="text-2xl font-bold text-green-600 mb-1">Group Stage</div>
                      <p className="text-sm text-muted-foreground">6 groups of 4 teams</p>
                      <p className="text-xs text-muted-foreground mt-2">Top 2 + 4 best 3rd place advance</p>
                    </div>
                    <div className="bg-green-600/10 p-4 rounded-lg border border-green-600/20">
                      <div className="text-2xl font-bold text-green-600 mb-1">Knockout</div>
                      <p className="text-sm text-muted-foreground">Round of 16 → Final</p>
                      <p className="text-xs text-muted-foreground mt-2">Single elimination format</p>
                    </div>
                    <div className="bg-green-600/10 p-4 rounded-lg border border-green-600/20">
                      <div className="text-2xl font-bold text-green-600 mb-1">Final</div>
                      <p className="text-sm text-muted-foreground">February 14, 2027</p>
                      <p className="text-xs text-muted-foreground mt-2">Lagos National Stadium</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Why Nigeria as Host?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Nigeria won the hosting rights for AFCON 2027, marking the country's return to hosting Africa's premier football tournament. With massive infrastructure investments, renovated stadiums across 5 major cities, and a passionate football culture, Nigeria is set to deliver one of the most memorable AFCONs in history.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-primary">200M+</div>
                      <div className="text-xs text-muted-foreground">Population</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-primary">3-Time</div>
                      <div className="text-xs text-muted-foreground">AFCON Winners</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-primary">₦500B+</div>
                      <div className="text-xs text-muted-foreground">Infrastructure Investment</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-primary">5 Cities</div>
                      <div className="text-xs text-muted-foreground">Host Venues</div>
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
                    Political Issues in African Football
                  </CardTitle>
                  <CardDescription>Key debates surrounding AFCON 2027</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {politicalTopics.map((topic, i) => (
                    <div key={i} className="border border-border rounded-lg p-4 hover:border-green-600/50 transition-colors">
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
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Qualified Teams (24 Total)
                  </CardTitle>
                  <CardDescription>All nations competing in AFCON 2027</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      "Nigeria 🇳🇬 (Host)",
                      "Senegal 🇸🇳 (Defending)",
                      "Egypt 🇪🇬",
                      "Morocco 🇲🇦",
                      "Algeria 🇩🇿",
                      "Tunisia 🇹🇳",
                      "Cameroon 🇨🇲",
                      "Ghana 🇬🇭",
                      "Ivory Coast 🇨🇮",
                      "Mali 🇲🇱",
                      "Burkina Faso 🇧🇫",
                      "South Africa 🇿🇦",
                      "Congo DR 🇨🇩",
                      "Guinea 🇬🇳",
                      "Cape Verde 🇨🇻",
                      "Gabon 🇬🇦",
                      "Equatorial Guinea 🇬🇶",
                      "Mauritania 🇲🇷",
                      "Comoros 🇰🇲",
                      "Gambia 🇬🇲",
                      "Zimbabwe 🇿🇼",
                      "Uganda 🇺🇬",
                      "Kenya 🇰🇪",
                      "Tanzania 🇹🇿",
                    ].map((team, i) => (
                      <div key={i} className="p-3 border border-border rounded-lg hover:border-green-600/50 transition-colors cursor-pointer">
                        <span className="text-sm font-medium">{team}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Players Tab */}
            <TabsContent value="players" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Players to Watch
                  </CardTitle>
                  <CardDescription>Golden Boot favorites and African superstars</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topPlayers.map((player, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-green-600/50 transition-colors">
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.country} • {player.position}</div>
                        <div className="text-xs text-muted-foreground mt-1">{player.stat}</div>
                      </div>
                      <Button size="sm" variant="outline" className="border-green-600/50" onClick={() => handlePlaceBet(`${player.name} golden boot`)}>
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
                    Nigerian Host Cities
                  </CardTitle>
                  <CardDescription>5 world-class venues across Nigeria</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hostCities.map((city, i) => (
                    <div key={i} className="p-4 border border-border rounded-lg hover:border-green-600/50 transition-colors">
                      <h3 className="font-semibold text-foreground mb-1">{city.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{city.stadium}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Capacity: {city.capacity}</Badge>
                        <Badge variant="outline">{city.matches}</Badge>
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
                  <CardDescription>Group stage fixtures</CardDescription>
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
                    AFCON Winner Odds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { team: "Senegal (Defending)", odds: "4.00" },
                    { team: "Nigeria (Host)", odds: "4.50" },
                    { team: "Morocco", odds: "5.00" },
                    { team: "Egypt", odds: "5.50" },
                    { team: "Algeria", odds: "6.50" },
                    { team: "Cameroon", odds: "7.00" },
                    { team: "Ghana", odds: "8.50" },
                    { team: "Ivory Coast", odds: "9.00" },
                    { team: "Tunisia", odds: "10.00" },
                    { team: "South Africa", odds: "12.00" },
                  ].map((team, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-green-600/50 transition-colors cursor-pointer" onClick={() => handlePlaceBet(`${team.team} winner`)}>
                      <span className="font-medium">{team.team}</span>
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
                    AFCON History
                  </CardTitle>
                  <CardDescription>Past winners and memorable tournaments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { year: "2023", winner: "Ivory Coast 🇨🇮", runnerUp: "Nigeria", location: "Ivory Coast" },
                      { year: "2021", winner: "Senegal 🇸🇳", runnerUp: "Egypt", location: "Cameroon" },
                      { year: "2019", winner: "Algeria 🇩🇿", runnerUp: "Senegal", location: "Egypt" },
                      { year: "2017", winner: "Cameroon 🇨🇲", runnerUp: "Egypt", location: "Gabon" },
                      { year: "2015", winner: "Ivory Coast 🇨🇮", runnerUp: "Ghana", location: "Equatorial Guinea" },
                      { year: "2013", winner: "Nigeria 🇳🇬", runnerUp: "Burkina Faso", location: "South Africa" },
                    ].map((afcon, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <div className="font-semibold">{afcon.year} - {afcon.location}</div>
                          <div className="text-sm text-muted-foreground">Winner: {afcon.winner} • Runner-up: {afcon.runnerUp}</div>
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

export default AFCON;

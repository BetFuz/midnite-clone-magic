import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BetSlip from "@/components/BetSlip";
import { useAIImageGeneration } from "@/hooks/useAIImageGeneration";
import { useRacingBetting, RaceParticipant } from "@/hooks/useRacingBetting";
import { Loader2, Trophy, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

const HorseRacing = () => {
  const { generateImage, isGenerating } = useAIImageGeneration();
  const [stakes, setStakes] = useState<Record<string, number>>({});
  const [heroUrl, setHeroUrl] = useState<string | null>(null);

  const participants: RaceParticipant[] = [
    { id: '1', name: 'Thunder Strike', odds: 3.2, stats: { wins: 12, races: 45, winRate: '26.7%' } },
    { id: '2', name: 'Golden Arrow', odds: 4.5, stats: { wins: 8, races: 38, winRate: '21.1%' } },
    { id: '3', name: 'Desert Wind', odds: 5.8, stats: { wins: 6, races: 32, winRate: '18.8%' } },
    { id: '4', name: 'Midnight Runner', odds: 7.2, stats: { wins: 5, races: 28, winRate: '17.9%' } },
    { id: '5', name: 'Silver Bullet', odds: 9.0, stats: { wins: 4, races: 24, winRate: '16.7%' } }
  ];

  const { raceState, winner, balance, placeBet, startRace, isPlacingBet } = useRacingBetting({
    raceType: 'Horse Racing',
    raceId: 'horse-race-001',
    participants
  });

  useEffect(() => {
    const cached = localStorage.getItem('horse-racing-hero');
    if (cached) {
      setHeroUrl(cached);
    } else {
      generateImage({
        prompt: 'Epic horse racing scene at Royal Ascot with jockeys in colorful silks racing toward finish line, dramatic lighting, professional photography',
        type: 'hero',
        style: 'photorealistic'
      }).then(url => {
        if (url) {
          setHeroUrl(url);
          localStorage.setItem('horse-racing-hero', url);
        }
      });
    }
  }, []);

  const handleBetClick = (participant: RaceParticipant, betType: 'win' | 'place' | 'show') => {
    const stake = stakes[participant.id] || 1000;
    
    if (raceState === 'pre-race') {
      placeBet({
        participantId: participant.id,
        participantName: participant.name,
        betType,
        odds: participant.odds,
        stake
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <h1 className="text-4xl font-bold mb-2">🏇 Horse Racing</h1>
          <p className="text-muted-foreground mb-6">The Sport of Kings - Premium Thoroughbred Racing</p>

          <div className="mb-6">
            {isGenerating ? (
              <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : heroUrl ? (
              <img 
                src={heroUrl} 
                alt="Horse Racing" 
                className="w-full h-[400px] object-cover rounded-lg"
              />
            ) : null}
          </div>

          <div className="flex items-center justify-between mb-6">
            <Badge variant={raceState === 'pre-race' ? 'default' : raceState === 'racing' ? 'destructive' : 'secondary'}>
              {raceState === 'pre-race' ? 'Pre-Race Betting Open' : raceState === 'racing' ? 'Race In Progress' : 'Race Finished'}
            </Badge>
            <div className="text-lg font-semibold">Balance: ₦{balance.toLocaleString()}</div>
            {raceState === 'pre-race' && (
              <Button onClick={startRace} className="gap-2">
                <Play className="h-4 w-4" />
                Start Race
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {participants.map((participant) => (
              <Card key={participant.id} className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{participant.name}</h3>
                      {winner === participant.id && (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {participant.stats.wins} wins in {participant.stats.races} races ({participant.stats.winRate})
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Win Odds</div>
                      <div className="text-2xl font-bold text-primary">{participant.odds.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                
                {raceState === 'pre-race' && (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Stake"
                      value={stakes[participant.id] || 1000}
                      onChange={(e) => setStakes({ ...stakes, [participant.id]: Number(e.target.value) })}
                      className="w-32"
                      min={100}
                      step={100}
                    />
                    <Button
                      onClick={() => handleBetClick(participant, 'win')}
                      disabled={isPlacingBet}
                      className="flex-1"
                    >
                      Bet to Win
                    </Button>
                    <Button
                      onClick={() => handleBetClick(participant, 'place')}
                      disabled={isPlacingBet}
                      variant="outline"
                      className="flex-1"
                    >
                      Bet to Place
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default HorseRacing;

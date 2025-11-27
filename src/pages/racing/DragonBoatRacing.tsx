import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Waves, Users, Play } from 'lucide-react';
import { useAIImageGeneration } from '@/hooks/useAIImageGeneration';

const DragonBoatRacing = () => {
  const { generateImage, generateVideo } = useAIImageGeneration();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [raceVideo, setRaceVideo] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      const cachedImage = localStorage.getItem('racing-dragonboat-hero');
      if (cachedImage) setHeroImage(cachedImage);
      else {
        const img = await generateImage({
          prompt: 'Dragon boat racing festival, ornate dragon-headed boats with synchronized paddlers, colorful decorations, Asian waterfront setting, photorealistic, 8K quality',
          type: 'hero',
          style: 'photorealistic'
        });
        if (img) {
          setHeroImage(img);
          localStorage.setItem('racing-dragonboat-hero', img);
        }
      }

      const cachedVideo = localStorage.getItem('racing-dragonboat-video');
      if (cachedVideo) setRaceVideo(cachedVideo);
      else {
        const vid = await generateVideo('Dragon boats racing in synchronized formation, intense paddling action, cultural festival atmosphere', 'cinematic');
        if (vid) {
          setRaceVideo(vid);
          localStorage.setItem('racing-dragonboat-video', vid);
        }
      }
    };
    loadAssets();
  }, []);

  const races = [
    { event: 'Hong Kong Festival', teams: ['Team Red Dragon', 'Golden Phoenix', 'Jade Warriors'], odds: [2.2, 2.8, 3.5] },
    { event: 'Singapore Cup', teams: ['Thunder Squad', 'Ocean Masters', 'River Kings'], odds: [2.5, 3.0, 3.8] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="relative h-80 rounded-xl overflow-hidden mb-6">
            {heroImage ? (
              <img src={heroImage} alt="Dragon Boat Racing" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-red-500/20 to-yellow-500/20 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-5xl font-bold text-foreground mb-2">🐉 Dragon Boat Racing</h1>
              <p className="text-xl text-muted-foreground">Ancient tradition meets modern competition</p>
            </div>
          </div>

          {raceVideo && (
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Festival Highlights</h2>
              </div>
              <video src={raceVideo} controls className="w-full rounded-lg" />
            </Card>
          )}

          <h2 className="text-2xl font-bold text-foreground mb-4">Championship Events</h2>
          <div className="grid gap-4">
            {races.map((race, idx) => (
              <Card key={idx} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Waves className="h-5 w-5 text-red-500" />
                      <h3 className="text-lg font-bold text-foreground">{race.event}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>20 paddlers per team</span>
                    </div>
                  </div>
                  <Button size="sm">Team Roster</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {race.teams.map((team, i) => (
                    <Button key={i} variant="secondary" size="sm" className="text-xs">
                      {team} - {race.odds[i].toFixed(2)}
                    </Button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </main>
        <BetSlip />
      </div>
    </div>
  );
};

export default DragonBoatRacing;

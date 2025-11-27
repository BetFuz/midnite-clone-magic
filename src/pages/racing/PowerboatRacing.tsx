import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Waves, MapPin, Play } from 'lucide-react';
import { useAIImageGeneration } from '@/hooks/useAIImageGeneration';

const PowerboatRacing = () => {
  const { generateImage, generateVideo } = useAIImageGeneration();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [raceVideo, setRaceVideo] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      const cachedImage = localStorage.getItem('racing-powerboat-hero');
      if (cachedImage) setHeroImage(cachedImage);
      else {
        const img = await generateImage({
          prompt: 'Powerboat racing on ocean, high-speed boats jumping waves, massive spray, Miami waterfront backdrop, photorealistic, 8K quality',
          type: 'hero',
          style: 'photorealistic'
        });
        if (img) {
          setHeroImage(img);
          localStorage.setItem('racing-powerboat-hero', img);
        }
      }

      const cachedVideo = localStorage.getItem('racing-powerboat-video');
      if (cachedVideo) setRaceVideo(cachedVideo);
      else {
        const vid = await generateVideo('Powerboats racing through choppy waters, dramatic aerial view, boats jumping waves', 'cinematic');
        if (vid) {
          setRaceVideo(vid);
          localStorage.setItem('racing-powerboat-video', vid);
        }
      }
    };
    loadAssets();
  }, []);

  const races = [
    { event: 'Miami Grand Prix', location: 'Biscayne Bay', boats: ['Spirit of Qatar', 'Team Abu Dhabi', 'Victory Team'], odds: [2.6, 3.2, 3.8] },
    { event: 'Dubai Grand Prix', location: 'Dubai Marina', boats: ['Team Abu Dhabi', 'EMIC Racing', 'Swecat Racing'], odds: [2.4, 3.5, 4.0] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="relative h-80 rounded-xl overflow-hidden mb-6">
            {heroImage ? (
              <img src={heroImage} alt="Powerboat Racing" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-5xl font-bold text-foreground mb-2">🚤 Powerboat Racing</h1>
              <p className="text-xl text-muted-foreground">F1 on water - extreme speed meets ocean waves</p>
            </div>
          </div>

          {raceVideo && (
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Race Footage</h2>
              </div>
              <video src={raceVideo} controls className="w-full rounded-lg" />
            </Card>
          )}

          <h2 className="text-2xl font-bold text-foreground mb-4">Upcoming Races</h2>
          <div className="grid gap-4">
            {races.map((race, idx) => (
              <Card key={idx} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Waves className="h-5 w-5 text-cyan-500" />
                      <h3 className="text-lg font-bold text-foreground">{race.event}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{race.location}</span>
                    </div>
                  </div>
                  <Button size="sm">Boat Specs</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {race.boats.map((boat, i) => (
                    <Button key={i} variant="secondary" size="sm" className="text-xs">
                      {boat} - {race.odds[i].toFixed(2)}
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

export default PowerboatRacing;

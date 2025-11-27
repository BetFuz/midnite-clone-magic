import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Star, Play } from 'lucide-react';
import { useAIImageGeneration } from '@/hooks/useAIImageGeneration';

const SpaceRacing = () => {
  const { generateImage, generateVideo } = useAIImageGeneration();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [raceVideo, setRaceVideo] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      const cachedImage = localStorage.getItem('racing-space-hero');
      if (cachedImage) setHeroImage(cachedImage);
      else {
        const img = await generateImage({
          prompt: 'Space racing through asteroid field, futuristic spacecraft at hyperspeed, nebula backdrop, photorealistic sci-fi, 8K quality',
          type: 'hero',
          style: 'photorealistic'
        });
        if (img) {
          setHeroImage(img);
          localStorage.setItem('racing-space-hero', img);
        }
      }

      const cachedVideo = localStorage.getItem('racing-space-video');
      if (cachedVideo) setRaceVideo(cachedVideo);
      else {
        const vid = await generateVideo('Spacecraft racing through asteroid belt, dodging debris, epic space chase', 'cinematic');
        if (vid) {
          setRaceVideo(vid);
          localStorage.setItem('racing-space-video', vid);
        }
      }
    };
    loadAssets();
  }, []);

  const races = [
    { circuit: 'Saturn Ring Circuit', ships: ['Starfire-1', 'Nebula Runner', 'Cosmic Dart'], odds: [2.1, 3.2, 4.0] },
    { circuit: 'Mars Canyon Run', ships: ['Red Phoenix', 'Velocity Prime', 'Solar Wind'], odds: [2.4, 2.9, 3.8] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="relative h-80 rounded-xl overflow-hidden mb-6">
            {heroImage ? (
              <img src={heroImage} alt="Space Racing" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-5xl font-bold text-foreground mb-2">🚀 Space Racing</h1>
              <p className="text-xl text-muted-foreground">Beyond the atmosphere - the final frontier</p>
            </div>
          </div>

          {raceVideo && (
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Orbital Race Footage</h2>
              </div>
              <video src={raceVideo} controls className="w-full rounded-lg" />
            </Card>
          )}

          <h2 className="text-2xl font-bold text-foreground mb-4">Galactic Championships</h2>
          <div className="grid gap-4">
            {races.map((race, idx) => (
              <Card key={idx} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Rocket className="h-5 w-5 text-indigo-500" />
                      <h3 className="text-lg font-bold text-foreground">{race.circuit}</h3>
                    </div>
                  </div>
                  <Button size="sm">Ship Details</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {race.ships.map((ship, i) => (
                    <Button key={i} variant="secondary" size="sm">
                      {ship} - {race.odds[i].toFixed(2)}
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

export default SpaceRacing;

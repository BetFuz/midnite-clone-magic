import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Clock, Play } from 'lucide-react';
import { useAIImageGeneration } from '@/hooks/useAIImageGeneration';
import { toast } from 'sonner';

const StreetRacing = () => {
  const { generateImage, generateVideo } = useAIImageGeneration();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [raceVideo, setRaceVideo] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      const cachedImage = localStorage.getItem('racing-street-hero');
      if (cachedImage) setHeroImage(cachedImage);
      else {
        const img = await generateImage({
          prompt: 'Illegal street racing at night, neon-lit urban cityscape, modified sports cars with underglow, Tokyo drift style, cinematic action shot, photorealistic, 8K quality',
          type: 'hero',
          style: 'photorealistic'
        });
        if (img) {
          setHeroImage(img);
          localStorage.setItem('racing-street-hero', img);
        }
      }

      const cachedVideo = localStorage.getItem('racing-street-video');
      if (cachedVideo) setRaceVideo(cachedVideo);
      else {
        const vid = await generateVideo('Street racing cars drifting through neon city corners, high-octane chase sequence', 'cinematic');
        if (vid) {
          setRaceVideo(vid);
          localStorage.setItem('racing-street-video', vid);
        }
      }
    };
    loadAssets();
  }, []);

  const races = [
    { city: 'Tokyo Drift', car: 'Nissan GTR vs Supra', time: '22:00', odds: [1.8, 2.2] },
    { city: 'LA Underground', car: 'Mustang vs Camaro', time: '23:30', odds: [2.0, 2.0] },
    { city: 'Miami Nights', car: 'Lamborghini vs Ferrari', time: '00:15', odds: [1.6, 2.5] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="relative h-80 rounded-xl overflow-hidden mb-6">
            {heroImage ? (
              <img src={heroImage} alt="Street Racing" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-5xl font-bold text-foreground mb-2">🚗 Street Racing</h1>
              <p className="text-xl text-muted-foreground">Underground racing action - high stakes, high speed</p>
            </div>
          </div>

          {raceVideo && (
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Latest Street Race</h2>
              </div>
              <video src={raceVideo} controls className="w-full rounded-lg" />
            </Card>
          )}

          <h2 className="text-2xl font-bold text-foreground mb-4">Tonight's Races</h2>
          <div className="grid gap-4">
            {races.map((race, idx) => (
              <Card key={idx} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <h3 className="text-lg font-bold text-foreground">{race.city}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{race.time}</span>
                      <span>{race.car}</span>
                    </div>
                  </div>
                  <Button size="sm">Race Details</Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {race.odds.map((odd, i) => (
                    <Button key={i} variant="secondary" size="sm">
                      Car {i + 1} - {odd.toFixed(2)}
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

export default StreetRacing;

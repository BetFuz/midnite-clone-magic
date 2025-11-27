import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, MapPin, Play } from 'lucide-react';
import { useAIImageGeneration } from '@/hooks/useAIImageGeneration';

const MotoGPRacing = () => {
  const { generateImage, generateVideo } = useAIImageGeneration();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [raceVideo, setRaceVideo] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      const cachedImage = localStorage.getItem('racing-motogp-hero');
      if (cachedImage) setHeroImage(cachedImage);
      else {
        const img = await generateImage({
          prompt: 'MotoGP motorcycle racing, riders leaning into corner at extreme angles, pack of racing bikes, dramatic circuit backdrop, photorealistic, 8K quality',
          type: 'hero',
          style: 'photorealistic'
        });
        if (img) {
          setHeroImage(img);
          localStorage.setItem('racing-motogp-hero', img);
        }
      }

      const cachedVideo = localStorage.getItem('racing-motogp-video');
      if (cachedVideo) setRaceVideo(cachedVideo);
      else {
        const vid = await generateVideo('MotoGP bikes battling through chicane, incredible lean angles, wheel-to-wheel racing', 'cinematic');
        if (vid) {
          setRaceVideo(vid);
          localStorage.setItem('racing-motogp-video', vid);
        }
      }
    };
    loadAssets();
  }, []);

  const races = [
    { gp: 'Italian GP', circuit: 'Mugello', riders: ['Bagnaia', 'Marquez', 'Quartararo'], odds: [2.4, 3.0, 3.8] },
    { gp: 'Spanish GP', circuit: 'Jerez', riders: ['Marquez', 'Bagnaia', 'Martin'], odds: [2.2, 2.8, 4.2] },
    { gp: 'Dutch TT', circuit: 'Assen', riders: ['Bagnaia', 'Quartararo', 'Binder'], odds: [2.5, 3.2, 5.0] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="relative h-80 rounded-xl overflow-hidden mb-6">
            {heroImage ? (
              <img src={heroImage} alt="MotoGP" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-red-500/20 to-blue-500/20 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-5xl font-bold text-foreground mb-2">🏍️ MotoGP</h1>
              <p className="text-xl text-muted-foreground">Two-wheeled gladiators at 350km/h</p>
            </div>
          </div>

          {raceVideo && (
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Race Action</h2>
              </div>
              <video src={raceVideo} controls className="w-full rounded-lg" />
            </Card>
          )}

          <h2 className="text-2xl font-bold text-foreground mb-4">Championship Races</h2>
          <div className="grid gap-4">
            {races.map((race, idx) => (
              <Card key={idx} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="h-5 w-5 text-red-500" />
                      <h3 className="text-lg font-bold text-foreground">{race.gp}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{race.circuit}</span>
                    </div>
                  </div>
                  <Button size="sm">Grid Positions</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {race.riders.map((rider, i) => (
                    <Button key={i} variant="secondary" size="sm">
                      {rider} - {race.odds[i].toFixed(2)}
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

export default MotoGPRacing;

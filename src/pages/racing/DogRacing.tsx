import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Zap, Play } from 'lucide-react';
import { useAIImageGeneration } from '@/hooks/useAIImageGeneration';
import { toast } from 'sonner';

const DogRacing = () => {
  const { generateImage, generateVideo } = useAIImageGeneration();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [raceVideo, setRaceVideo] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      const cachedImage = localStorage.getItem('racing-dog-hero');
      if (cachedImage) setHeroImage(cachedImage);
      else {
        const img = await generateImage({
          prompt: 'High-speed greyhound racing, sleek dogs bursting from starting traps, motion blur, dramatic stadium lighting, photorealistic, 8K quality',
          type: 'hero',
          style: 'photorealistic'
        });
        if (img) {
          setHeroImage(img);
          localStorage.setItem('racing-dog-hero', img);
        }
      }

      const cachedVideo = localStorage.getItem('racing-dog-video');
      if (cachedVideo) setRaceVideo(cachedVideo);
      else {
        const vid = await generateVideo('Greyhounds racing around track bend, incredible speed, photo finish', 'cinematic');
        if (vid) {
          setRaceVideo(vid);
          localStorage.setItem('racing-dog-video', vid);
        }
      }
    };
    loadAssets();
  }, []);

  const races = [
    { track: 'Romford Stadium', time: '19:15', distance: '480m', trap: 6, odds: [2.5, 3.2, 4.5, 5.5, 6.0, 8.5] },
    { track: 'Sheffield', time: '19:45', distance: '500m', trap: 6, odds: [3.0, 3.5, 4.0, 6.5, 7.5, 9.0] },
    { track: 'Towcester', time: '20:20', distance: '462m', trap: 6, odds: [2.8, 4.2, 5.0, 5.8, 7.0, 10.0] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="relative h-80 rounded-xl overflow-hidden mb-6">
            {heroImage ? (
              <img src={heroImage} alt="Dog Racing" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-5xl font-bold text-foreground mb-2">🐕 Greyhound Racing</h1>
              <p className="text-xl text-muted-foreground">Lightning-fast action every 15 minutes</p>
            </div>
          </div>

          {raceVideo && (
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Featured Race</h2>
              </div>
              <video src={raceVideo} controls className="w-full rounded-lg" />
            </Card>
          )}

          <h2 className="text-2xl font-bold text-foreground mb-4">Live Races</h2>
          <div className="grid gap-4">
            {races.map((race, idx) => (
              <Card key={idx} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="h-5 w-5 text-emerald-500" />
                      <h3 className="text-lg font-bold text-foreground">{race.track}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{race.time}</span>
                      <span>{race.distance}</span>
                      <span>{race.trap} dogs</span>
                    </div>
                  </div>
                  <Button size="sm">View Traps</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {race.odds.map((odd, i) => (
                    <Button key={i} variant="secondary" size="sm">
                      Trap {i + 1} - {odd.toFixed(2)}
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

export default DogRacing;

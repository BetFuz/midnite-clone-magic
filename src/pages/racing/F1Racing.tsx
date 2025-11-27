import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, MapPin, Play } from 'lucide-react';
import { useAIImageGeneration } from '@/hooks/useAIImageGeneration';
import { toast } from 'sonner';

const F1Racing = () => {
  const { generateImage, generateVideo } = useAIImageGeneration();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [raceVideo, setRaceVideo] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      const cachedImage = localStorage.getItem('racing-f1-hero');
      if (cachedImage) setHeroImage(cachedImage);
      else {
        const img = await generateImage({
          prompt: 'Formula 1 cars at Monaco Grand Prix, high-speed racing through tight corners, spray from rain, dramatic lighting, photorealistic, 8K quality',
          type: 'hero',
          style: 'photorealistic'
        });
        if (img) {
          setHeroImage(img);
          localStorage.setItem('racing-f1-hero', img);
        }
      }

      const cachedVideo = localStorage.getItem('racing-f1-video');
      if (cachedVideo) setRaceVideo(cachedVideo);
      else {
        const vid = await generateVideo('F1 cars battling for position through chicane, overtaking maneuver, cinematic slow motion', 'cinematic');
        if (vid) {
          setRaceVideo(vid);
          localStorage.setItem('racing-f1-video', vid);
        }
      }
    };
    loadAssets();
  }, []);

  const races = [
    { name: 'Monaco GP', circuit: 'Monte Carlo', laps: 78, drivers: ['Verstappen', 'Hamilton', 'Leclerc'], odds: [2.1, 3.5, 4.5] },
    { name: 'British GP', circuit: 'Silverstone', laps: 52, drivers: ['Verstappen', 'Norris', 'Sainz'], odds: [1.9, 4.0, 5.5] },
    { name: 'Italian GP', circuit: 'Monza', laps: 53, drivers: ['Verstappen', 'Perez', 'Russell'], odds: [2.3, 3.8, 5.0] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="relative h-80 rounded-xl overflow-hidden mb-6">
            {heroImage ? (
              <img src={heroImage} alt="F1 Racing" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-red-500/20 to-orange-500/20 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-5xl font-bold text-foreground mb-2">🏎️ Formula 1</h1>
              <p className="text-xl text-muted-foreground">The pinnacle of motorsport - bet on the fastest cars on Earth</p>
            </div>
          </div>

          {raceVideo && (
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Race Highlights</h2>
              </div>
              <video src={raceVideo} controls className="w-full rounded-lg" />
            </Card>
          )}

          <h2 className="text-2xl font-bold text-foreground mb-4">Upcoming Grand Prix</h2>
          <div className="grid gap-4">
            {races.map((race, idx) => (
              <Card key={idx} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="h-5 w-5 text-red-500" />
                      <h3 className="text-lg font-bold text-foreground">{race.name}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{race.circuit}</span>
                      <span>{race.laps} laps</span>
                    </div>
                  </div>
                  <Button size="sm">Race Preview</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {race.drivers.map((driver, i) => (
                    <Button key={i} variant="secondary" size="sm">
                      {driver} - {race.odds[i].toFixed(2)}
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

export default F1Racing;

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mountain, MapPin, Play } from 'lucide-react';
import { useAIImageGeneration } from '@/hooks/useAIImageGeneration';

const CyclingRacing = () => {
  const { generateImage, generateVideo } = useAIImageGeneration();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [raceVideo, setRaceVideo] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      const cachedImage = localStorage.getItem('racing-cycling-hero');
      if (cachedImage) setHeroImage(cachedImage);
      else {
        const img = await generateImage({
          prompt: 'Tour de France peloton racing through mountain stage, cyclists climbing alpine pass, dramatic mountain scenery, photorealistic, 8K quality',
          type: 'hero',
          style: 'photorealistic'
        });
        if (img) {
          setHeroImage(img);
          localStorage.setItem('racing-cycling-hero', img);
        }
      }

      const cachedVideo = localStorage.getItem('racing-cycling-video');
      if (cachedVideo) setRaceVideo(cachedVideo);
      else {
        const vid = await generateVideo('Cycling peloton sprinting to finish line, dramatic final kilometers', 'cinematic');
        if (vid) {
          setRaceVideo(vid);
          localStorage.setItem('racing-cycling-video', vid);
        }
      }
    };
    loadAssets();
  }, []);

  const races = [
    { stage: 'Tour de France Stage 15', type: 'Mountain', riders: ['Pogacar', 'Vingegaard', 'Roglic'], odds: [2.2, 2.8, 4.5] },
    { stage: 'Giro d\'Italia Stage 20', type: 'Time Trial', riders: ['Evenepoel', 'Thomas', 'Roglic'], odds: [2.5, 3.0, 3.8] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="relative h-80 rounded-xl overflow-hidden mb-6">
            {heroImage ? (
              <img src={heroImage} alt="Cycling" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-green-500/20 to-yellow-500/20 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-5xl font-bold text-foreground mb-2">🚴 Cycling</h1>
              <p className="text-xl text-muted-foreground">Grand Tours and classic races</p>
            </div>
          </div>

          {raceVideo && (
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Stage Highlights</h2>
              </div>
              <video src={raceVideo} controls className="w-full rounded-lg" />
            </Card>
          )}

          <h2 className="text-2xl font-bold text-foreground mb-4">Today's Stages</h2>
          <div className="grid gap-4">
            {races.map((race, idx) => (
              <Card key={idx} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Mountain className="h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-bold text-foreground">{race.stage}</h3>
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded">{race.type}</span>
                    </div>
                  </div>
                  <Button size="sm">Stage Profile</Button>
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

export default CyclingRacing;

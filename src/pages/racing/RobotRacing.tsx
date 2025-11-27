import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cpu, Zap, Play } from 'lucide-react';
import { useAIImageGeneration } from '@/hooks/useAIImageGeneration';

const RobotRacing = () => {
  const { generateImage, generateVideo } = useAIImageGeneration();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [raceVideo, setRaceVideo] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      const cachedImage = localStorage.getItem('racing-robot-hero');
      if (cachedImage) setHeroImage(cachedImage);
      else {
        const img = await generateImage({
          prompt: 'Futuristic robot racing, humanoid robots sprinting on neon track, cyberpunk stadium, holographic displays, photorealistic, 8K quality',
          type: 'hero',
          style: 'photorealistic'
        });
        if (img) {
          setHeroImage(img);
          localStorage.setItem('racing-robot-hero', img);
        }
      }

      const cachedVideo = localStorage.getItem('racing-robot-video');
      if (cachedVideo) setRaceVideo(cachedVideo);
      else {
        const vid = await generateVideo('Robot racers competing in futuristic arena, high-speed mechanical action', 'cinematic');
        if (vid) {
          setRaceVideo(vid);
          localStorage.setItem('racing-robot-video', vid);
        }
      }
    };
    loadAssets();
  }, []);

  const races = [
    { event: 'Neo Tokyo Circuit', robots: ['Titan-X', 'Quantum-7', 'Nova-Prime'], odds: [2.3, 3.0, 3.5] },
    { event: 'Cyber Dome Arena', robots: ['Apex-9', 'Thunder-Bot', 'Velocity-X'], odds: [2.5, 2.8, 4.0] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="relative h-80 rounded-xl overflow-hidden mb-6">
            {heroImage ? (
              <img src={heroImage} alt="Robot Racing" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-5xl font-bold text-foreground mb-2">🤖 Robot Racing</h1>
              <p className="text-xl text-muted-foreground">The future of racing - AI vs AI</p>
            </div>
          </div>

          {raceVideo && (
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Race Replay</h2>
              </div>
              <video src={raceVideo} controls className="w-full rounded-lg" />
            </Card>
          )}

          <h2 className="text-2xl font-bold text-foreground mb-4">Next Generation Racing</h2>
          <div className="grid gap-4">
            {races.map((race, idx) => (
              <Card key={idx} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Cpu className="h-5 w-5 text-cyan-500" />
                      <h3 className="text-lg font-bold text-foreground">{race.event}</h3>
                    </div>
                  </div>
                  <Button size="sm">Robot Specs</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {race.robots.map((robot, i) => (
                    <Button key={i} variant="secondary" size="sm">
                      {robot} - {race.odds[i].toFixed(2)}
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

export default RobotRacing;

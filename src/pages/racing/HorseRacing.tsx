import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BetSlip from '@/components/BetSlip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Trophy, MapPin, Play } from 'lucide-react';
import { useAIImageGeneration } from '@/hooks/useAIImageGeneration';
import { toast } from 'sonner';

const HorseRacing = () => {
  const navigate = useNavigate();
  const { generateImage, generateVideo, isGenerating } = useAIImageGeneration();
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [raceVideo, setRaceVideo] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      const cachedImage = localStorage.getItem('racing-horse-hero');
      const cachedVideo = localStorage.getItem('racing-horse-video');
      
      if (cachedImage) setHeroImage(cachedImage);
      else {
        const img = await generateImage({
          prompt: 'Epic horse racing scene at Royal Ascot, thoroughbred horses in full gallop, jockeys in colorful silks, dramatic photo finish, photorealistic, 8K quality, golden hour lighting',
          type: 'hero',
          style: 'photorealistic'
        });
        if (img) {
          setHeroImage(img);
          localStorage.setItem('racing-horse-hero', img);
        }
      }

      if (cachedVideo) setRaceVideo(cachedVideo);
      else {
        const vid = await generateVideo('Cinematic horse race final stretch, multiple horses neck-and-neck approaching finish line, crowd roaring, dramatic slow motion', 'cinematic');
        if (vid) {
          setRaceVideo(vid);
          localStorage.setItem('racing-horse-video', vid);
        }
      }
    };
    loadAssets();
  }, []);

  const races = [
    { venue: 'Royal Ascot', time: '14:30', distance: '1m 4f', class: 'Group 1', runners: 12, odds: [3.5, 4.2, 5.5] },
    { venue: 'Cheltenham', time: '15:10', distance: '2m 3f', class: 'Grade 1', runners: 16, odds: [2.8, 5.0, 6.5] },
    { venue: 'Kempton Park', time: '16:45', distance: '1m 2f', class: 'Listed', runners: 10, odds: [4.0, 4.5, 7.0] },
    { venue: 'Newmarket', time: '17:20', distance: '6f', class: 'Group 2', runners: 8, odds: [3.0, 5.5, 8.0] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)] pb-24 md:pb-6">
          {/* Hero Section */}
          <div className="relative h-80 rounded-xl overflow-hidden mb-6">
            {heroImage ? (
              <img src={heroImage} alt="Horse Racing" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-5xl font-bold text-foreground mb-2">🏇 Horse Racing</h1>
              <p className="text-xl text-muted-foreground">The Sport of Kings - Premium thoroughbred racing</p>
            </div>
          </div>

          {/* Race Video Highlight */}
          {raceVideo && (
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Today's Feature Race</h2>
              </div>
              <video src={raceVideo} controls className="w-full rounded-lg" />
            </Card>
          )}

          {/* Upcoming Races */}
          <h2 className="text-2xl font-bold text-foreground mb-4">Today's Races</h2>
          <div className="grid gap-4 mb-6">
            {races.map((race, idx) => (
              <Card key={idx} className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold text-foreground">{race.venue}</h3>
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded">{race.class}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{race.time}</span>
                      </div>
                      <span>{race.distance}</span>
                      <span>{race.runners} runners</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast.success(`Viewing ${race.venue} race card`)}>Race Card</Button>
                    <Button size="sm" onClick={() => toast.success(`Odds: ${race.odds.join(' - ')}`)}>Bet Now</Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {race.odds.map((odd, i) => (
                    <Button key={i} variant="secondary" size="sm" className="flex-1">
                      Horse {i + 1} - {odd.toFixed(2)}
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

export default HorseRacing;

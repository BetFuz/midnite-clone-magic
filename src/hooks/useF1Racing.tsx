import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface F1Driver {
  id: string;
  name: string;
  team: string;
  odds: number;
  stats: {
    wins: number;
    podiums: number;
    championships: number;
  };
}

export interface F1RaceScenario {
  weather: string;
  tireStrategies: string[];
  driverForm: Record<string, string>;
  keyMoments: string[];
  pitWindows: number[];
  raceNarrative: string;
}

export const useF1Racing = (circuit: string) => {
  const [scenario, setScenario] = useState<F1RaceScenario | null>(null);
  const [commentary, setCommentary] = useState<string>('');
  const [raceVideo, setRaceVideo] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [raceState, setRaceState] = useState<'pre-race' | 'racing' | 'finished'>('pre-race');
  const [currentLap, setCurrentLap] = useState(0);
  const totalLaps = 50;

  const drivers: F1Driver[] = [
    { id: '1', name: 'Max Verstappen', team: 'Red Bull Racing', odds: 1.8, stats: { wins: 54, podiums: 98, championships: 3 } },
    { id: '2', name: 'Lewis Hamilton', team: 'Mercedes', odds: 3.5, stats: { wins: 103, podiums: 197, championships: 7 } },
    { id: '3', name: 'Charles Leclerc', team: 'Ferrari', odds: 4.2, stats: { wins: 6, podiums: 33, championships: 0 } },
    { id: '4', name: 'Lando Norris', team: 'McLaren', odds: 5.5, stats: { wins: 1, podiums: 12, championships: 0 } },
    { id: '5', name: 'Carlos Sainz', team: 'Ferrari', odds: 6.0, stats: { wins: 3, podiums: 24, championships: 0 } }
  ];

  useEffect(() => {
    loadAssets();
  }, [circuit]);

  const loadAssets = async () => {
    setIsLoading(true);

    try {
      // Check cache first
      const cachedImage = localStorage.getItem(`f1-${circuit}-hero`);
      const cachedVideo = localStorage.getItem(`f1-${circuit}-video`);

      if (cachedImage) {
        setHeroImage(cachedImage);
      } else {
        const { data: imageData } = await supabase.functions.invoke('f1-racing-ai', {
          body: {
            action: 'generateDriverImage',
            prompt: `Professional F1 racing scene at ${circuit} Grand Prix, modern Formula 1 cars battling on track, dramatic action, photorealistic 8K`,
            circuit
          }
        });

        if (imageData?.imageUrl) {
          setHeroImage(imageData.imageUrl);
          localStorage.setItem(`f1-${circuit}-hero`, imageData.imageUrl);
        }
      }

      if (cachedVideo) {
        setRaceVideo(cachedVideo);
      } else {
        const { data: videoData } = await supabase.functions.invoke('f1-racing-ai', {
          body: {
            action: 'generateRaceVideo',
            prompt: `Formula 1 race start at ${circuit}, lights out, cars launching, first corner battle, overtaking, cinematic 8K`,
            circuit
          }
        });

        if (videoData?.videoUrl) {
          setRaceVideo(videoData.videoUrl);
          localStorage.setItem(`f1-${circuit}-video`, videoData.videoUrl);
        }
      }
    } catch (error) {
      console.error('Asset loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRaceScenario = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('f1-racing-ai', {
        body: {
          action: 'generateRaceScenario',
          circuit,
          drivers: drivers.map(d => d.name)
        }
      });

      if (error) throw error;

      const parsedScenario = typeof data.scenario === 'string' 
        ? JSON.parse(data.scenario) 
        : data.scenario;

      setScenario(parsedScenario);

      toast({
        title: "Race Scenario Generated",
        description: `${circuit} Grand Prix conditions set`,
      });
    } catch (error) {
      console.error('Scenario generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate race scenario",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateLiveCommentary = async (moment: string) => {
    try {
      const { data } = await supabase.functions.invoke('f1-racing-ai', {
        body: {
          action: 'generateLiveCommentary',
          prompt: `Lap ${currentLap}/${totalLaps} at ${circuit}: ${moment}`
        }
      });

      if (data?.commentary) {
        setCommentary(data.commentary);
      }
    } catch (error) {
      console.error('Commentary error:', error);
    }
  };

  const startRace = async () => {
    setRaceState('racing');
    await generateRaceScenario();
    await generateLiveCommentary('Lights out and away we go!');

    // Simulate race progression
    const raceInterval = setInterval(async () => {
      setCurrentLap(prev => {
        const next = prev + 1;
        
        if (next >= totalLaps) {
          clearInterval(raceInterval);
          setRaceState('finished');
          generateLiveCommentary('Checkered flag! Race complete!');
          return totalLaps;
        }

        // Generate commentary at key moments
        if (next % 10 === 0) {
          generateLiveCommentary(`Intense battle for position`);
        }

        return next;
      });
    }, 3000); // 3 seconds per lap
  };

  return {
    drivers,
    scenario,
    commentary,
    raceVideo,
    heroImage,
    isLoading,
    raceState,
    currentLap,
    totalLaps,
    generateRaceScenario,
    startRace
  };
};

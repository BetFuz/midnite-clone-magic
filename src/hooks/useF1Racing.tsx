import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { RacingEngine, RacerState, RaceEvent } from '@/lib/racingEngine';

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

export interface RaceState {
  racers: RacerState[];
  events: RaceEvent[];
  currentLap: number;
  isRunning: boolean;
}

export const useF1Racing = (circuit: string) => {
  const [scenario, setScenario] = useState<F1RaceScenario | null>(null);
  const [commentary, setCommentary] = useState<string>('');
  const [raceVideo, setRaceVideo] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [raceState, setRaceState] = useState<'pre-race' | 'racing' | 'finished'>('pre-race');
  const [currentLap, setCurrentLap] = useState(0);
  const [liveRaceState, setLiveRaceState] = useState<RaceState>({
    racers: [],
    events: [],
    currentLap: 0,
    isRunning: false,
  });
  const totalLaps = 50;
  const raceEngineRef = useRef<RacingEngine | null>(null);

  const drivers: F1Driver[] = [
    { id: '1', name: 'Max Verstappen', team: 'Red Bull Racing', odds: 1.8, stats: { wins: 54, podiums: 98, championships: 3 } },
    { id: '2', name: 'Lewis Hamilton', team: 'Mercedes', odds: 3.5, stats: { wins: 103, podiums: 197, championships: 7 } },
    { id: '3', name: 'Charles Leclerc', team: 'Ferrari', odds: 4.2, stats: { wins: 6, podiums: 33, championships: 0 } },
    { id: '4', name: 'Lando Norris', team: 'McLaren', odds: 5.5, stats: { wins: 1, podiums: 12, championships: 0 } },
    { id: '5', name: 'Carlos Sainz', team: 'Ferrari', odds: 6.0, stats: { wins: 3, podiums: 24, championships: 0 } }
  ];

  // Remove auto-loading of assets to prevent blocking
 
   const loadAssets = async () => {
     // Load from cache only - don't generate on mount
     const cachedImage = localStorage.getItem(`f1-${circuit}-hero`);
     const cachedVideo = localStorage.getItem(`f1-${circuit}-video`);
 
     if (cachedImage) {
       setHeroImage(cachedImage);
     }
 
     if (cachedVideo) {
       setRaceVideo(cachedVideo);
     }
   };
 
   useEffect(() => {
     // Only load from cache on mount so UI is instant
     loadAssets();
   }, [circuit]);

  const generateRaceScenario = async () => {
    setIsLoading(true);

    try {
      // Create a default scenario immediately
      const defaultScenario: F1RaceScenario = {
        weather: 'Partly cloudy, 22°C track temperature',
        tireStrategies: ['Soft-Medium-Soft', 'Medium-Hard', 'Soft-Soft-Medium'],
        driverForm: {
          'Max Verstappen': 'Excellent',
          'Lewis Hamilton': 'Strong',
          'Charles Leclerc': 'Good',
          'Lando Norris': 'Improving',
          'Carlos Sainz': 'Solid'
        },
        keyMoments: ['Safety car likely lap 15-20', 'DRS activation lap 3'],
        pitWindows: [15, 35],
        raceNarrative: `The ${circuit} Grand Prix presents a thrilling challenge with varying weather conditions and strategic tire choices.`
      };

      setScenario(defaultScenario);

      toast({
        title: "Race Scenario Ready",
        description: `${circuit} Grand Prix conditions set`,
      });
    } catch (error) {
      console.error('Scenario generation error:', error);
      toast({
        title: "Scenario Set",
        description: "Default race conditions loaded",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateLiveCommentary = async (moment: string) => {
     // Generate default commentary immediately
     const commentaryOptions = [
       `${moment} - This is incredible racing at ${circuit}!`,
       `What a moment at ${circuit}! ${moment}`,
       `The battle intensifies - ${moment}`,
       `Spectacular racing action on lap ${currentLap}!`,
       `${moment} - The crowd is on their feet!`
     ];
     
     const randomCommentary = commentaryOptions[Math.floor(Math.random() * commentaryOptions.length)];
     setCommentary(randomCommentary);
   };
 
   const generateRaceVideo = async () => {
     try {
       const { data, error } = await supabase.functions.invoke('f1-racing-ai', {
         body: {
           action: 'generateRaceVideo',
           circuit,
         },
       });
 
       if (error) throw error;
 
       if (data?.videoUrl) {
         setRaceVideo(data.videoUrl);
         localStorage.setItem(`f1-${circuit}-video`, data.videoUrl);
       }
     } catch (error) {
       console.error('Race video generation error:', error);
       toast({
         title: 'Race Video Unavailable',
         description: 'Starting race without live video, visuals will still run.',
       });
     }
   };
 
  const startRace = async () => {
    setRaceState('racing');
    generateRaceVideo(); // Fire-and-forget
    await generateRaceScenario();
    await generateLiveCommentary('Lights out and away we go!');

    // Initialize racing engine with drivers
    const racers = drivers.map((driver, index) => ({
      id: driver.id,
      name: driver.name,
      baseSpeed: 85 + (5 - index) * 3, // Better drivers start with slight advantage
    }));

    raceEngineRef.current = new RacingEngine(racers, {
      totalLaps,
      updateInterval: 50, // Update every 50ms for smooth racing
      crashProbability: 0.0005,
      overtakeDifficulty: 0.3,
    });

    // Subscribe to race updates
    raceEngineRef.current.onUpdate((racers, events) => {
      const state = raceEngineRef.current?.getCurrentState();
      if (state) {
        setLiveRaceState({
          racers: state.racers,
          events: state.events,
          currentLap: state.currentLap,
          isRunning: state.isRunning,
        });
        setCurrentLap(state.currentLap);

        // Generate commentary for major events
        if (events.length > 0) {
          const latestEvent = events[events.length - 1];
          if (latestEvent.type === 'overtake' || latestEvent.type === 'crash') {
            generateLiveCommentary(latestEvent.description);
          }
        }

        // Check for race finish
        if (state.currentLap > totalLaps) {
          const winner = raceEngineRef.current?.getWinner();
          if (winner) {
            setRaceState('finished');
            generateLiveCommentary(`Checkered flag! ${winner.name} wins the ${circuit} Grand Prix!`);
          }
        }
      }
    });

    // Start the race simulation
    raceEngineRef.current.start();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (raceEngineRef.current) {
        raceEngineRef.current.stop();
      }
    };
  }, []);

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
    liveRaceState,
    generateRaceScenario,
    startRace,
    loadAssets,
    generateRaceVideo,
  };
};

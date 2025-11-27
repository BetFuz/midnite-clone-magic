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
    startRace,
    loadAssets
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RacingParticipant {
  id: string;
  name: string;
  odds: number;
  stats?: {
    wins: number;
    races: number;
    winRate: string;
  };
  position?: number;
}

interface UsePremiumRacingProps {
  raceType: 'horse' | 'dog' | 'f1' | 'street' | 'motogp' | 'powerboat' | 'cycling' | 'robot' | 'space';
  raceId: string;
}

export const usePremiumRacing = ({ raceType, raceId }: UsePremiumRacingProps) => {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [raceVideo, setRaceVideo] = useState<string | null>(null);
  const [commentary, setCommentary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [raceState, setRaceState] = useState<'pre-race' | 'racing' | 'finished'>('pre-race');
  const [participants, setParticipants] = useState<RacingParticipant[]>([]);

  const racePrompts = {
    horse: "Cinematic horse racing, thoroughbred horses with detailed musculature, jockeys in silk uniforms, realistic track conditions, dramatic finish line with dust and excitement, 4K resolution, 60fps, professional broadcast quality",
    dog: "Premium greyhound racing, sleek athletic dogs bursting from starting traps, realistic fur textures and muscle definition, track surface details, competitive finish with dramatic angles, 4K resolution, slow-motion finish",
    f1: "Hyper-realistic Formula 1 racing, detailed car aerodynamics with visible downforce effects, realistic tire compounds and wear, authentic track surfaces with rubber buildup, pit stop mechanics, 8K resolution, professional F1 broadcast quality",
    street: "Cinematic street racing with realistic urban environments, detailed car modifications and neon lighting, authentic police chase sequences with realistic physics, tire smoke and skid marks, 4K resolution, Need for Speed quality",
    motogp: "Professional MotoGP racing with detailed bike physics including lean angles and knee sliders, realistic rider movements and gear, authentic track surfaces with rubber buildup, wheelie and stoppie animations, 8K resolution, broadcast quality",
    powerboat: "Premium powerboat racing with realistic water physics including wave dynamics and spray patterns, detailed boat hull designs with hydrodynamics, authentic maritime environments, dramatic water crashes and turns, 4K resolution, ocean racing quality",
    cycling: "Professional cycling with realistic peloton dynamics including drafting effects and team strategies, detailed bike specifications and gear systems, authentic mountain climbs and sprint finishes, 8K resolution, Tour de France quality",
    robot: "Futuristic robot racing with detailed mechanical designs and unique abilities, neon-lit cyberpunk environments with holographic elements, explosive speed trails and particle effects, 4K resolution, sci-fi cinematic quality",
    space: "Intergalactic space racing through detailed asteroid fields and nebula clouds, realistic spacecraft with unique propulsion systems, wormhole traversal and space-time effects, 8K resolution, cinematic space epic quality"
  };

  const generatePremiumAssets = async () => {
    setIsGenerating(true);
    try {
      // Generate hero image
      const { data: imageData, error: imageError } = await supabase.functions.invoke('kie-ai-generate', {
        body: {
          action: 'generateImage',
          prompt: racePrompts[raceType],
          type: 'hero',
          style: 'photorealistic'
        }
      });

      if (imageError) throw imageError;
      if (imageData?.imageUrl) {
        setHeroImage(imageData.imageUrl);
      }

      // Generate cinematic race video
      const { data: videoData, error: videoError } = await supabase.functions.invoke('kie-ai-generate', {
        body: {
          action: 'generateVideo',
          prompt: racePrompts[raceType],
          type: 'cinematic'
        }
      });

      if (videoError) throw videoError;
      if (videoData?.videoUrl) {
        setRaceVideo(videoData.videoUrl);
      }

      toast.success('Premium racing assets generated!');
    } catch (error) {
      console.error('Asset generation error:', error);
      toast.error('Failed to generate premium assets');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCommentary = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('racing-simulation', {
        body: {
          raceType,
          raceId,
          participants
        }
      });

      if (error) throw error;
      if (data?.commentary) {
        setCommentary(data.commentary);
      }
    } catch (error) {
      console.error('Commentary error:', error);
    }
  };

  const startRace = async () => {
    setRaceState('racing');
    await generateCommentary();
    
    // Simulate race progression
    setTimeout(() => {
      setRaceState('finished');
    }, 30000);
  };

  return {
    heroImage,
    raceVideo,
    commentary,
    isGenerating,
    raceState,
    participants,
    setParticipants,
    generatePremiumAssets,
    startRace
  };
};

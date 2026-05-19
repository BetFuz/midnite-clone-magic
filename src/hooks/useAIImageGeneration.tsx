import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface GenerateImageOptions {
  prompt: string;
  type?: 'hero' | 'league' | 'team' | 'promo' | 'character' | 'sport' | 'casino';
  style?: string;
}

export const useAIImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async ({ prompt, type = 'hero', style }: GenerateImageOptions) => {
    setIsGenerating(true);
    try {
      const data = null; const error = null;

      if (error) throw error;

      // AI feature unavailable - graceful no-op
      if (!data) return;
      toast.success('AI image generated successfully!');
      return data.imageUrl;
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('Failed to generate image');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVideo = async (prompt: string, type: 'cinematic' | 'win-animation' = 'cinematic') => {
    setIsGenerating(true);
    try {
      const data = null; const error = null;

      if (error) throw error;
      if (!data) return null;

      toast.success('AI video generated successfully!');
      return (data as any).videoUrl;
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Failed to generate video');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateImage,
    generateVideo,
    isGenerating,
    generatedImage
  };
};

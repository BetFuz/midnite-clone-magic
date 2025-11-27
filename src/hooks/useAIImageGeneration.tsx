import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase.functions.invoke('kie-ai-generate', {
        body: {
          action: 'generateImage',
          prompt,
          type,
          style
        }
      });

      if (error) throw error;

      setGeneratedImage(data.imageUrl);
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
      const { data, error } = await supabase.functions.invoke('kie-ai-generate', {
        body: {
          action: 'generateVideo',
          prompt,
          type
        }
      });

      if (error) throw error;

      toast.success('AI video generated successfully!');
      return data.videoUrl;
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

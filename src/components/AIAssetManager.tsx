import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAIImageGeneration } from '@/hooks/useAIImageGeneration';
import { Sparkles, Image, Video, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface AssetCategory {
  id: string;
  name: string;
  prompt: string;
  type: 'hero' | 'league' | 'team' | 'promo' | 'character' | 'sport' | 'casino';
  cacheKey: string;
}

const assetCategories: AssetCategory[] = [
  {
    id: 'hero-banner',
    name: 'Hero Banner',
    prompt: 'Nigerian football stadium at sunset, vibrant atmosphere, excited crowd celebrating, premium sports betting scene, dynamic action, Lagos cityscape in background',
    type: 'hero',
    cacheKey: 'betfuz-hero-image'
  },
  {
    id: 'premier-league',
    name: 'Premier League Badge',
    prompt: 'Premier League official logo, ultra high quality, professional sports branding, clean design, royal blue and purple',
    type: 'league',
    cacheKey: 'betfuz-premier-league-badge'
  },
  {
    id: 'nba-banner',
    name: 'NBA Banner',
    prompt: 'NBA basketball action, slam dunk, arena atmosphere, professional sports photography, dynamic lighting, red and blue accents',
    type: 'sport',
    cacheKey: 'betfuz-nba-banner'
  },
  {
    id: 'afcon-promo',
    name: 'AFCON Promotion',
    prompt: 'Africa Cup of Nations, vibrant African colors, football celebration, Pan-African unity, stadium atmosphere, gold trophy',
    type: 'promo',
    cacheKey: 'betfuz-afcon-promo'
  },
  {
    id: 'casino-lobby',
    name: 'Casino Lobby Background',
    prompt: 'Luxury casino interior, golden lights, slot machines, roulette tables, elegant atmosphere, Nigerian high-end casino, cinematic lighting',
    type: 'casino',
    cacheKey: 'betfuz-casino-lobby-bg'
  },
  {
    id: 'fuzflix-hero',
    name: 'FuzFlix Hero',
    prompt: 'Nollywood cinema premiere, red carpet, glamorous atmosphere, Nigerian entertainment industry, movie posters, cinematic',
    type: 'promo',
    cacheKey: 'betfuz-fuzflix-hero'
  },
  {
    id: 'world-cup',
    name: 'World Cup Banner',
    prompt: 'FIFA World Cup trophy, global celebration, stadium atmosphere, international flags, football excellence, dramatic lighting',
    type: 'promo',
    cacheKey: 'betfuz-world-cup-banner'
  },
  {
    id: 'slot-background',
    name: 'Slot Machine Background',
    prompt: 'Vibrant slot machine theme, African cultural patterns, gold coins, lucky symbols, dynamic colors, premium casino graphics',
    type: 'casino',
    cacheKey: 'betfuz-slot-bg'
  }
];

export const AIAssetManager = () => {
  const { generateImage, isGenerating } = useAIImageGeneration();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});

  const handleGenerate = async (category: AssetCategory) => {
    setSelectedCategory(category.id);
    const imageUrl = await generateImage({
      prompt: category.prompt,
      type: category.type,
      style: 'photorealistic'
    });

    if (imageUrl) {
      localStorage.setItem(category.cacheKey, imageUrl);
      setGeneratedImages(prev => ({ ...prev, [category.id]: imageUrl }));
      toast.success(`${category.name} generated successfully!`);
    }
    setSelectedCategory(null);
  };

  const handleGenerateAll = async () => {
    toast.info('Generating all platform assets... This may take a few minutes.');
    for (const category of assetCategories) {
      await handleGenerate(category);
    }
    toast.success('All platform assets generated successfully!');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Asset Generation
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Generate premium images using Flux.1, Imagen 4, and Ideogram V3
          </p>
        </div>
        <Button onClick={handleGenerateAll} disabled={isGenerating} size="lg">
          <Palette className="w-4 h-4 mr-2" />
          Generate All Assets
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assetCategories.map((category) => (
          <Card key={category.id} className="p-4 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Model: {category.type}
                </p>
              </div>
              {category.type === 'casino' || category.type === 'hero' ? (
                <Video className="w-5 h-5 text-primary" />
              ) : (
                <Image className="w-5 h-5 text-primary" />
              )}
            </div>

            {generatedImages[category.id] && (
              <div className="mb-3 rounded-lg overflow-hidden">
                <img 
                  src={generatedImages[category.id]} 
                  alt={category.name}
                  className="w-full h-32 object-cover"
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {category.prompt}
            </p>

            <Button
              onClick={() => handleGenerate(category)}
              disabled={isGenerating}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className="w-full"
              size="sm"
            >
              {selectedCategory === category.id ? (
                <>
                  <Sparkles className="w-3 h-3 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Available AI Models
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="p-2 bg-background rounded">
            <strong>Flux.1 Kontext</strong>
            <p className="text-muted-foreground">Photorealistic scenes</p>
          </div>
          <div className="p-2 bg-background rounded">
            <strong>Imagen 4</strong>
            <p className="text-muted-foreground">Sports & action</p>
          </div>
          <div className="p-2 bg-background rounded">
            <strong>Ideogram V3</strong>
            <p className="text-muted-foreground">Logos & graphics</p>
          </div>
          <div className="p-2 bg-background rounded">
            <strong>Sora 2 / Veo 3</strong>
            <p className="text-muted-foreground">Video generation</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

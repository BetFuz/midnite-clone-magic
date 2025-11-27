import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAIImageGeneration } from "@/hooks/useAIImageGeneration";
import { Sparkles } from "lucide-react";

const HeroBanner = () => {
  const { generateImage, isGenerating } = useAIImageGeneration();
  const [heroBackground, setHeroBackground] = useState<string | null>(null);

  useEffect(() => {
    const cachedImage = localStorage.getItem('betfuz-hero-image');
    if (cachedImage) {
      setHeroBackground(cachedImage);
    }
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-hero h-64 mb-6">
      {heroBackground && (
        <div className="absolute inset-0 opacity-40">
          <img 
            src={heroBackground} 
            alt="Sports promotion" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Sparkles className="w-8 h-8 animate-pulse" />
            <p className="text-sm font-medium">Generating AI-powered visuals...</p>
          </div>
        </div>
      )}
      <div className="relative h-full flex items-center px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-2">
            Premium Odds Boost
          </h2>
          <p className="text-white/90 text-sm mb-4">
            Enhanced odds on today's featured matches. Max stake applies. T&C's apply.
          </p>
          <Button className="bg-white text-primary-foreground font-bold hover:bg-white/90" asChild>
            <Link to="/promotions/welcome">Bet Here</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;

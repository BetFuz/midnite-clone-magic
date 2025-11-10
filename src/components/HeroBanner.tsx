import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-sports.jpg";
import { Link } from "react-router-dom";

const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-hero h-64 mb-6">
      <div className="absolute inset-0 opacity-30">
        <img 
          src={heroImage} 
          alt="Sports promotion" 
          className="w-full h-full object-cover"
        />
      </div>
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

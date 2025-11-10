import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface BoostCardProps {
  title: string;
  description: string;
  wasOdds: string;
  nowOdds: string;
  url?: string;
}

const BoostCard = ({ title, description, wasOdds, nowOdds, url = "/promotions/acca-boost" }: BoostCardProps) => {
  return (
    <Link to={url}>
      <Card className="p-4 bg-gradient-card border-border hover:border-primary/50 transition-all cursor-pointer group">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/20 p-2 group-hover:bg-primary/30 transition-colors">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{description}</p>
            <div className="flex items-center gap-3">
              <div className="text-xs">
                <span className="text-muted-foreground">Was </span>
                <span className="text-muted-foreground line-through">{wasOdds}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">NOW </span>
                <span className="text-primary font-bold text-base">{nowOdds}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BoostCard;

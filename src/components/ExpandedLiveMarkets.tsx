import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { TrendingUp, Trophy, Target } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ExpandedLiveMarketsProps {
  matchId: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
}

const ExpandedLiveMarkets = ({
  matchId,
  sport,
  league,
  homeTeam,
  awayTeam,
}: ExpandedLiveMarketsProps) => {
  const { addSelection } = useBetSlip();

  const markets = {
    goals: {
      title: "Goals Markets",
      icon: <Trophy className="h-4 w-4" />,
      options: [
        { label: "Over 2.5 Goals", odds: 1.85, hot: true },
        { label: "Under 2.5 Goals", odds: 1.95 },
        { label: "Both Teams to Score", odds: 1.70, hot: true },
        { label: "No Goal", odds: 8.50 },
      ],
    },
    nextGoal: {
      title: "Next Goal",
      icon: <Target className="h-4 w-4" />,
      options: [
        { label: `${homeTeam}`, odds: 1.65 },
        { label: `${awayTeam}`, odds: 2.40 },
        { label: "No More Goals", odds: 4.20 },
      ],
    },
    halftime: {
      title: "Halftime/Fulltime",
      icon: <TrendingUp className="h-4 w-4" />,
      options: [
        { label: `${homeTeam}/${homeTeam}`, odds: 2.10 },
        { label: `${homeTeam}/Draw`, odds: 8.50 },
        { label: `${awayTeam}/${awayTeam}`, odds: 4.50 },
        { label: "Draw/Draw", odds: 5.20 },
      ],
    },
    corners: {
      title: "Corners",
      icon: <Target className="h-4 w-4" />,
      options: [
        { label: "Over 9.5 Corners", odds: 1.90 },
        { label: "Under 9.5 Corners", odds: 1.90 },
        { label: "Next Corner Home", odds: 1.80 },
        { label: "Next Corner Away", odds: 2.00 },
      ],
    },
  };

  const handleBetClick = (
    marketTitle: string,
    option: { label: string; odds: number }
  ) => {
    addSelection({
      id: `${matchId}-${marketTitle}-${option.label}`,
      matchId,
      sport,
      league,
      homeTeam,
      awayTeam,
      selectionType: "home",
      selectionValue: `${marketTitle}: ${option.label}`,
      odds: option.odds,
      matchTime: "LIVE",
    });
  };

  return (
    <Card className="p-4">
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(markets).map(([key, market]) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                {market.icon}
                <span className="font-semibold">{market.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {market.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-primary hover:text-primary-foreground transition-all relative"
                    onClick={() => handleBetClick(market.title, option)}
                  >
                    {option.hot && (
                      <Badge className="absolute -top-2 -right-2 bg-orange-500 text-xs px-1.5 py-0">
                        Hot
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground group-hover:text-primary-foreground">
                      {option.label}
                    </span>
                    <span className="text-base font-bold animate-pulse">
                      {option.odds.toFixed(2)}
                    </span>
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
};

export default ExpandedLiveMarkets;

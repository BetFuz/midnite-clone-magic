import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBetSlip } from "@/contexts/BetSlipContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSportMarkets } from "@/lib/sportMarkets";

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

  const markets = getSportMarkets(sport, homeTeam, awayTeam);

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
        {Object.entries(markets).map(([key, market]) => {
          const IconComponent = market.icon;
          return (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
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
        );
        })}
      </Accordion>
    </Card>
  );
};

export default ExpandedLiveMarkets;

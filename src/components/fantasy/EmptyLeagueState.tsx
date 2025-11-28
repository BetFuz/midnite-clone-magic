import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyLeagueStateProps {
  sport: string;
  description: string;
  generating: boolean;
  onGenerate: () => void;
}

export const EmptyLeagueState = ({ sport, description, generating, onGenerate }: EmptyLeagueStateProps) => {
  return (
    <Card className="p-8 md:p-12 text-center">
      <Trophy className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg md:text-xl font-semibold mb-2">{sport} Leagues Coming Soon</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button size="sm" onClick={onGenerate} disabled={generating}>
        {generating ? 'Generating...' : 'Generate Leagues Now'}
      </Button>
    </Card>
  );
};

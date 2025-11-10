import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BetSlipProps {
  className?: string;
}

const BetSlip = ({ className }: BetSlipProps) => {
  return (
    <aside className={cn("hidden md:flex w-full md:w-80 border-l border-border bg-card h-[calc(100vh-4rem)] flex-col", className)}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Bet Slip</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-sm font-medium">Bet Slip is empty</p>
          <p className="text-xs mt-1">Add selections to place bet</p>
        </div>
      </div>
    </aside>
  );
};

export default BetSlip;

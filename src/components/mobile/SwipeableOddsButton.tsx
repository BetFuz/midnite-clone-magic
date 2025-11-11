import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plus, Check } from "lucide-react";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { toast } from "sonner";

interface SwipeableOddsButtonProps {
  odds: number;
  selection: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  league: string;
  selectionType: "home" | "away" | "draw";
  disabled?: boolean;
  className?: string;
}

export const SwipeableOddsButton = ({
  odds,
  selection,
  matchId,
  homeTeam,
  awayTeam,
  sport,
  league,
  selectionType,
  disabled = false,
  className
}: SwipeableOddsButtonProps) => {
  const { addSelection, removeSelection, selections } = useBetSlip();
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [startX, setStartX] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const selectionId = `${matchId}-${selectionType}`;
  const isSelected = selections.some(
    sel => sel.matchId === matchId && sel.id === selectionId
  );

  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Only allow swipe if not already selected (swipe left to add)
    // or if selected (swipe right to remove)
    if (!isSelected && diff < 0) {
      setDragX(Math.max(diff, -SWIPE_THRESHOLD * 2));
    } else if (isSelected && diff > 0) {
      setDragX(Math.min(diff, SWIPE_THRESHOLD * 2));
    }
  };

  const handleTouchEnd = () => {
    if (disabled) return;
    
    if (!isSelected && dragX < -SWIPE_THRESHOLD) {
      // Swiped left - add to bet slip
      addSelection({
        id: selectionId,
        matchId,
        sport,
        league,
        homeTeam,
        awayTeam,
        selectionType,
        selectionValue: selection,
        odds,
      });
      toast.success("Added to bet slip", {
        description: `${selection} @ ${odds}`,
        duration: 2000,
      });
    } else if (isSelected && dragX > SWIPE_THRESHOLD) {
      // Swiped right - remove from bet slip
      removeSelection(selectionId);
      toast.info("Removed from bet slip", {
        description: selection,
        duration: 2000,
      });
    }

    setIsDragging(false);
    setDragX(0);
  };

  const handleClick = () => {
    if (disabled || isDragging) return;
    
    if (isSelected) {
      removeSelection(selectionId);
      toast.info("Removed from bet slip");
    } else {
      addSelection({
        id: selectionId,
        matchId,
        sport,
        league,
        homeTeam,
        awayTeam,
        selectionType,
        selectionValue: selection,
        odds,
      });
      toast.success("Added to bet slip");
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      disabled={disabled}
      className={cn(
        "relative overflow-hidden min-h-[56px] px-4 py-2 rounded-xl font-semibold transition-all active:scale-95 touch-none",
        isSelected
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          : "bg-card hover:bg-muted/50 text-foreground border-2 border-border",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        transform: isDragging ? `translateX(${dragX}px)` : undefined,
        transition: isDragging ? "none" : "all 0.2s ease",
      }}
    >
      {/* Background hint when swiping */}
      {isDragging && !isSelected && dragX < -20 && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-start px-4">
          <Plus className="h-5 w-5 text-primary" />
        </div>
      )}
      {isDragging && isSelected && dragX > 20 && (
        <div className="absolute inset-0 bg-destructive/20 flex items-center justify-end px-4">
          <div className="h-5 w-5 text-destructive">✕</div>
        </div>
      )}

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs opacity-80">{selection}</span>
        <span className="text-lg font-bold">{odds}</span>
      </div>

      {isSelected && !isDragging && (
        <div className="absolute top-1 right-1">
          <Check className="h-4 w-4" />
        </div>
      )}
    </button>
  );
};

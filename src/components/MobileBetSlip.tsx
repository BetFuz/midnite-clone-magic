import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import BetSlip from "./BetSlip";
import { Badge } from "@/components/ui/badge";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { useLocation } from "react-router-dom";

const MobileBetSlip = () => {
  const [open, setOpen] = useState(false);
  const { selections } = useBetSlip();
  const location = useLocation();

  // Close the sheet automatically on route change to avoid appearing as if navigation opened it
  useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (selections.length === 0) {
    // Hide mobile floating cart entirely when there are no selections to prevent accidental opens
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button 
        size="icon" 
        className="md:hidden fixed bottom-4 sm:bottom-6 right-4 h-14 w-14 rounded-full shadow-lg bg-primary z-50"
        aria-label="Open bet slip"
        onClick={() => setOpen(true)}
      >
        <ShoppingCart className="h-6 w-6" />
        {selections.length > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-destructive">
            {selections.length}
          </Badge>
        )}
      </Button>
      <SheetContent side="right" className="p-0 w-full sm:w-96">
        <BetSlip />
      </SheetContent>
    </Sheet>
  );
};

export default MobileBetSlip;

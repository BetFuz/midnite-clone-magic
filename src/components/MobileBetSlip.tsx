import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import BetSlip from "./BetSlip";
import { Badge } from "@/components/ui/badge";

const MobileBetSlip = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          size="icon" 
          className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-primary z-50"
        >
          <ShoppingCart className="h-6 w-6" />
          <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-destructive">
            0
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-full sm:w-96">
        <BetSlip />
      </SheetContent>
    </Sheet>
  );
};

export default MobileBetSlip;

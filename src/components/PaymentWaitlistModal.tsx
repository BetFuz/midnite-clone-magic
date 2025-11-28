import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PaymentWaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: "apple_pay" | "google_pay";
}

export const PaymentWaitlistModal = ({ open, onOpenChange, paymentMethod }: PaymentWaitlistModalProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinWaitlist = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("payment_waitlist").insert({
        email,
        payment_method: paymentMethod,
        user_id: user?.id || null,
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already on waitlist",
            description: "You're already registered for this payment method",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Joined Waitlist!",
          description: `We'll notify you when ${paymentMethod.replace("_", " ")} goes live with a 20% deposit boost`,
        });
        onOpenChange(false);
        setEmail("");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {paymentMethod === "apple_pay" ? "Apple Pay" : "Google Pay"} Waitlist
          </DialogTitle>
          <DialogDescription>
            Be the first to know when {paymentMethod.replace("_", " ")} launches and get an instant 20% deposit boost!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleJoinWaitlist} disabled={loading || !email} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Join Waitlist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
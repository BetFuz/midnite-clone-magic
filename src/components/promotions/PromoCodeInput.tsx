import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface PromoCodeInputProps {
  onCodeApplied?: (code: string) => void;
  webhookUrl?: string;
}

export const PromoCodeInput = ({ onCodeApplied, webhookUrl }: PromoCodeInputProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const validCodes = ["BETFUZ100", "WELCOME50", "BOOST25"];

  const handleApplyCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Send to n8n webhook if configured
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            event: "promo_code_applied",
            code: code.toUpperCase(),
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error("Webhook error:", error);
      }
    }

    // Mock validation
    setTimeout(() => {
      if (validCodes.includes(code.toUpperCase())) {
        setAppliedCode(code.toUpperCase());
        toast({
          title: "Code Applied!",
          description: `Promo code ${code.toUpperCase()} has been successfully applied`,
        });
        onCodeApplied?.(code.toUpperCase());
      } else {
        toast({
          title: "Invalid Code",
          description: "This promo code is not valid or has expired",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  if (appliedCode) {
    return (
      <Card className="p-4 bg-success/10 border-success/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <p className="font-semibold text-success">Code Applied</p>
              <Badge variant="secondary" className="mt-1">{appliedCode}</Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setAppliedCode(null)}
          >
            Remove
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Tag className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Have a Promo Code?</h3>
      </div>
      
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter promo code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1"
          onKeyPress={(e) => e.key === "Enter" && handleApplyCode()}
        />
        <Button onClick={handleApplyCode} disabled={isLoading}>
          {isLoading ? "Applying..." : "Apply"}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-3">
        Try: BETFUZ100, WELCOME50, or BOOST25
      </p>
    </Card>
  );
};

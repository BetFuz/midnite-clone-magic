import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatCurrency } from "@/lib/currency";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-6">Frequently Asked Questions</h1>
            <Card className="p-6 bg-card border-border">
              <Accordion type="multiple">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-foreground">What is the minimum deposit?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    The minimum deposit is {formatCurrency(5000)} for most payment methods. Some methods may have higher minimums.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-foreground">Are there any fees for deposits or withdrawals?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    We don't charge fees for deposits or withdrawals. However, your payment provider may charge their own fees.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-foreground">How do I verify my account?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Upload a photo ID and proof of address in your account settings. Verification usually takes 24-48 hours.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-foreground">Can I cancel a bet after placing it?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Generally, bets cannot be cancelled once confirmed. However, you may be able to cash out early on selected markets.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-foreground">What is Cash Out?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Cash Out allows you to settle your bet early before the event finishes. The amount offered is based on current odds and your original stake.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-foreground">How do I set deposit limits?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Go to Account Settings, then Responsible Gambling, then Deposit Limits. You can set daily, weekly, or monthly limits.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FAQ;

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-6">Help Center</h1>
            <Card className="p-6 bg-card border-border">
              <Accordion type="single" collapsible>
                <AccordionItem value="account">
                  <AccordionTrigger className="text-foreground">How do I create an account?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Click the "Join Now" button in the top right corner and follow the registration process. You'll need to provide basic information and verify your identity.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="deposit">
                  <AccordionTrigger className="text-foreground">How do I make a deposit?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Navigate to the deposits section, choose your preferred payment method, enter the amount, and confirm. Deposits are usually instant.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="withdrawal">
                  <AccordionTrigger className="text-foreground">How long do withdrawals take?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Withdrawal processing times vary by method. E-wallets are typically processed within 24 hours, while bank transfers may take 3-5 business days.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bet">
                  <AccordionTrigger className="text-foreground">How do I place a bet?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Select your market and odds, which will add the selection to your bet slip. Enter your stake and confirm to place the bet.
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

export default HelpCenter;

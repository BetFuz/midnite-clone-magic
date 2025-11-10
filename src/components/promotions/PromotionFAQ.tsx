import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export const PromotionFAQ = () => {
  const faqs = [
    {
      question: "How do I claim the welcome bonus?",
      answer: "Simply sign up for a new account, make your first deposit of at least ₦5,000, and place a qualifying bet. Your free bets will be credited within 24 hours."
    },
    {
      question: "Can I withdraw my free bet winnings?",
      answer: "Yes! Any winnings from free bets can be withdrawn after meeting the wagering requirements. The free bet stake itself is not returned with winnings."
    },
    {
      question: "How long are free bets valid?",
      answer: "Free bets are valid for 7 days from the date they are credited to your account. Make sure to use them before they expire!"
    },
    {
      question: "What are the minimum odds for the welcome bonus?",
      answer: "Your qualifying bet must be placed at minimum odds of 2.0 (evens) or greater to be eligible for the welcome bonus."
    },
    {
      question: "Can I combine promotions?",
      answer: "Some promotions can be combined, but others cannot. Check the specific terms and conditions for each promotion to see which ones can be used together."
    },
    {
      question: "How does Acca Boost work?",
      answer: "Add 5 or more selections to your accumulator bet with minimum odds of 1.20 per selection. If your bet wins, you'll receive an automatic boost on your winnings based on the number of selections."
    },
  ];

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <HelpCircle className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Frequently Asked Questions</h3>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
};

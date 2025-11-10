import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

const ResponsibleGambling = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Responsible Gambling</h1>
            </div>
            <Card className="p-8 bg-card border-border">
              <div className="prose prose-invert max-w-none space-y-4">
                <p className="text-foreground">We are committed to promoting responsible gambling and protecting our customers.</p>
                <h2 className="text-2xl font-bold text-foreground">Tools Available</h2>
                <ul className="text-muted-foreground space-y-2">
                  <li>Deposit Limits - Set daily, weekly or monthly limits</li>
                  <li>Time-Out Periods - Take a break from 24 hours to 6 weeks</li>
                  <li>Self-Exclusion - Exclude yourself for 6 months to 5 years</li>
                  <li>Reality Checks - Get reminders of time spent gambling</li>
                </ul>
                <h2 className="text-2xl font-bold text-foreground mt-6">Warning Signs</h2>
                <ul className="text-muted-foreground space-y-2">
                  <li>Gambling with money you can't afford to lose</li>
                  <li>Chasing losses</li>
                  <li>Lying about gambling habits</li>
                  <li>Gambling interfering with work or relationships</li>
                </ul>
                <h2 className="text-2xl font-bold text-foreground mt-6">Get Help</h2>
                <p className="text-muted-foreground">If you're concerned about your gambling, contact:</p>
                <ul className="text-muted-foreground">
                  <li>BeGambleAware: 0808 8020 133</li>
                  <li>GamCare: www.gamcare.org.uk</li>
                  <li>Gambling Therapy: www.gamblingtherapy.org</li>
                </ul>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResponsibleGambling;

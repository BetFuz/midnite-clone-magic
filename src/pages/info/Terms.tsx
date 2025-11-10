import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto prose prose-invert">
            <h1 className="text-4xl font-bold text-foreground mb-6">Terms & Conditions</h1>
            <Card className="p-8 bg-card border-border">
              <div className="space-y-4 text-foreground">
                <h2 className="text-2xl font-bold">1. General Terms</h2>
                <p className="text-muted-foreground">These terms and conditions govern your use of our betting services. By creating an account, you agree to comply with these terms.</p>
                
                <h2 className="text-2xl font-bold">2. Account Registration</h2>
                <ul className="text-muted-foreground space-y-2">
                  <li>You must be 18 years or older to create an account</li>
                  <li>Only one account per person is permitted</li>
                  <li>All information provided must be accurate and up-to-date</li>
                  <li>You are responsible for maintaining account security</li>
                </ul>

                <h2 className="text-2xl font-bold">3. Betting Rules</h2>
                <ul className="text-muted-foreground space-y-2">
                  <li>All bets are final once confirmed</li>
                  <li>Minimum and maximum stake limits apply</li>
                  <li>We reserve the right to void bets in case of errors</li>
                  <li>Settlement of bets follows official results</li>
                </ul>

                <h2 className="text-2xl font-bold">4. Deposits & Withdrawals</h2>
                <ul className="text-muted-foreground space-y-2">
                  <li>Deposits are credited instantly where possible</li>
                  <li>Withdrawal requests processed within stated timeframes</li>
                  <li>Identity verification may be required</li>
                  <li>Bonus funds have specific wagering requirements</li>
                </ul>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Terms;

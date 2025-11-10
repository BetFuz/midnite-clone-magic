import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto prose prose-invert">
            <h1 className="text-4xl font-bold text-foreground mb-6">Privacy Policy</h1>
            <Card className="p-8 bg-card border-border">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Data Collection</h2>
                <p className="text-muted-foreground">We collect personal information necessary to provide our services including name, address, date of birth, and payment details.</p>
                
                <h2 className="text-2xl font-bold text-foreground">How We Use Your Data</h2>
                <ul className="text-muted-foreground space-y-2">
                  <li>To verify your identity and age</li>
                  <li>To process transactions and payments</li>
                  <li>To comply with legal obligations</li>
                  <li>To prevent fraud and ensure security</li>
                  <li>To improve our services</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground">Data Protection</h2>
                <p className="text-muted-foreground">We use industry-standard encryption and security measures to protect your personal information. Data is stored securely and access is restricted to authorized personnel only.</p>

                <h2 className="text-2xl font-bold text-foreground">Your Rights</h2>
                <ul className="text-muted-foreground space-y-2">
                  <li>Right to access your personal data</li>
                  <li>Right to correct inaccurate data</li>
                  <li>Right to request data deletion</li>
                  <li>Right to object to data processing</li>
                </ul>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Privacy;

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto prose prose-invert">
            <h1 className="text-4xl font-bold text-foreground mb-6">About Us</h1>
            <Card className="p-8 bg-card border-border">
              <div className="space-y-4 text-foreground">
                <p>Welcome to the premier online sports betting and gaming platform, where passion meets opportunity.</p>
                <p>Founded with a mission to revolutionize the betting experience, we combine cutting-edge technology with exceptional customer service to deliver the ultimate platform for sports enthusiasts and gaming fans.</p>
                <h2 className="text-2xl font-bold text-foreground mt-6">Our Mission</h2>
                <p>To provide a safe, entertaining, and rewarding betting experience for customers worldwide.</p>
                <h2 className="text-2xl font-bold text-foreground mt-6">Why Choose Us</h2>
                <ul>
                  <li>Best odds guaranteed on selected markets</li>
                  <li>24/7 customer support</li>
                  <li>Fast and secure payments</li>
                  <li>Responsible gambling tools</li>
                  <li>Licensed and regulated</li>
                </ul>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default About;

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MessageCircle } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-6">Contact Us</h1>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="p-5 bg-card border-border text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-bold text-foreground mb-1">Email</h3>
                <p className="text-sm text-muted-foreground">support@betting.com</p>
              </Card>
              <Card className="p-5 bg-card border-border text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-bold text-foreground mb-1">Phone</h3>
                <p className="text-sm text-muted-foreground">0800 123 4567</p>
              </Card>
              <Card className="p-5 bg-card border-border text-center">
                <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-bold text-foreground mb-1">Live Chat</h3>
                <p className="text-sm text-muted-foreground">24/7 Available</p>
              </Card>
            </div>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Send us a message</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" className="bg-secondary" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" className="bg-secondary" />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" className="bg-secondary" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={6} placeholder="Your message..." className="bg-secondary" />
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Send Message</Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Contact;

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const Profile = () => {
  const [email, setEmail] = useState("user@example.com");
  const [name, setName] = useState("John Doe");
  const [phone, setPhone] = useState("+234 700 900 0000");
  const [dob, setDob] = useState("1990-01-01");

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <h1 className="text-3xl font-bold text-foreground mb-6">My Profile</h1>
          <Card className="p-6 bg-card border-border max-w-2xl">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary" 
                />
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary" 
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-secondary" 
                />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input 
                  id="dob" 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="bg-secondary" 
                />
              </div>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Profile;

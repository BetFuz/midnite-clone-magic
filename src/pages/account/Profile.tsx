import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Profile = () => {
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
                <Input id="email" type="email" defaultValue="user@example.com" className="bg-secondary" />
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Doe" className="bg-secondary" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="+44 7700 900000" className="bg-secondary" />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" defaultValue="1990-01-01" className="bg-secondary" />
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Profile;

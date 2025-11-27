import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Mail, Phone, MapPin, Calendar, Shield, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  avatarUrl: string;
  tier: string;
  totalBets: number;
  winRate: number;
  accountAge: string;
  verified: boolean;
}

const EnhancedProfile = () => {
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+234 801 234 5678',
    dateOfBirth: '1990-05-15',
    address: '123 Victoria Island',
    city: 'Lagos',
    country: 'Nigeria',
    avatarUrl: '',
    tier: 'Gold',
    totalBets: 1247,
    winRate: 58.3,
    accountAge: '2 years 4 months',
    verified: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile Updated', {
      description: 'Your profile information has been saved successfully',
    });
  };

  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File too large', {
            description: 'Please upload an image smaller than 5MB',
          });
          return;
        }
        toast.success('Avatar uploaded', {
          description: `Selected ${file.name}. Upload functionality ready for backend integration.`,
        });
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="text-3xl font-bold">
                  {profile.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-10 w-10"
                onClick={handleAvatarUpload}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>

            <div className="text-center">
              <Badge className="mb-2" variant="outline">
                <Trophy className="h-3 w-3 mr-1" />
                {profile.tier} Tier
              </Badge>
              {profile.verified && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Shield className="h-3 w-3" />
                  <span>Verified Account</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold text-primary">{profile.totalBets}</div>
              <div className="text-xs text-muted-foreground">Total Bets</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold text-green-600">{profile.winRate}%</div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold text-primary">{profile.tier}</div>
              <div className="text-xs text-muted-foreground">VIP Tier</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-sm font-bold text-muted-foreground">{profile.accountAge}</div>
              <div className="text-xs text-muted-foreground">Member Since</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Personal Information</h2>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fullName"
                value={profile.fullName}
                onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                id="dob"
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profile.city}
              onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={profile.country}
              onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
              disabled={!isEditing}
            />
          </div>
        </div>
      </Card>

      {/* Account Security */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Account Security</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <h3 className="font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">Add extra security to your account</p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <h3 className="font-semibold">Change Password</h3>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
            <Button variant="outline">Change</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <h3 className="font-semibold">Active Sessions</h3>
              <p className="text-sm text-muted-foreground">Manage your logged-in devices</p>
            </div>
            <Button variant="outline">View Sessions</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedProfile;

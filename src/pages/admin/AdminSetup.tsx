import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { 
  Shield, Copy, CheckCircle, AlertTriangle, ArrowRight, 
  Database, Key, Sparkles, Lock, ExternalLink
} from "lucide-react";
import { toast } from "sonner";

const AdminSetup = () => {
  const [userUuid, setUserUuid] = useState("");
  const [sqlCopied, setSqlCopied] = useState(false);

  const handleCopySQL = (role: 'admin' | 'superadmin') => {
    const sql = `-- Grant ${role} role to user
INSERT INTO user_roles (user_id, role, granted_by)
VALUES (
  '${userUuid || 'YOUR_USER_UUID_HERE'}',
  '${role}',
  '${userUuid || 'YOUR_USER_UUID_HERE'}'
);`;

    navigator.clipboard.writeText(sql);
    setSqlCopied(true);
    toast.success(`SQL copied! Paste in Lovable Cloud SQL Editor`);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const setupSteps = [
    {
      number: 1,
      title: "Get Your User UUID",
      icon: Database,
      description: "Find your user ID from the database",
      instructions: [
        "Open Lovable Cloud (Backend button)",
        "Go to Database → Tables → auth.users",
        "Find your email and copy the UUID",
        "Paste it in the box below"
      ]
    },
    {
      number: 2,
      title: "Grant Admin Role",
      icon: Key,
      description: "Run SQL to give yourself admin access",
      instructions: [
        "Choose Admin or Superadmin role",
        "Click 'Copy SQL' button",
        "Open Lovable Cloud → SQL Editor",
        "Paste and run the SQL query"
      ]
    },
    {
      number: 3,
      title: "Access Admin Pages",
      icon: Sparkles,
      description: "You're all set! Visit admin area",
      instructions: [
        "Refresh this page",
        "Look for 'Admin Area' in sidebar",
        "Click 'Admin Dashboard'",
        "Check audit logs and statistics"
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      
      <main className="flex-1 p-6 lg:ml-64 pb-20 md:pb-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Admin Setup Wizard</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get admin access in 3 simple steps. Follow the guide below to set up your secure admin account.
            </p>
          </div>

          {/* Role Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-500" />
                  Admin Role
                </CardTitle>
                <CardDescription>Read-only access to admin features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>View admin dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Read audit logs</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>View webhook settings</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-4 h-4">✗</span>
                  <span>Modify webhooks</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-4 h-4">✗</span>
                  <span>Grant/revoke roles</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Superadmin Role
                </CardTitle>
                <CardDescription>Full admin access and privileges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>All admin features</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Modify webhook settings</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Grant admin roles</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Revoke admin roles</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Complete system control</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Setup Steps */}
          <div className="space-y-6">
            {setupSteps.map((step, index) => (
              <Card key={step.number} className={index === 0 ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Step {step.number}</Badge>
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                      </div>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="space-y-2">
                    {step.instructions.map((instruction, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{instruction}</span>
                      </li>
                    ))}
                  </ol>

                  {/* Step 1: UUID Input */}
                  {step.number === 1 && (
                    <div className="mt-4 space-y-3">
                      <Input
                        placeholder="550e8400-e29b-41d4-a716-446655440000"
                        value={userUuid}
                        onChange={(e) => setUserUuid(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <Alert>
                        <Database className="h-4 w-4" />
                        <AlertDescription>
                          Your UUID is a long string of letters and numbers like: 550e8400-e29b-41d4-a716-446655440000
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Step 2: Copy SQL */}
                  {step.number === 2 && (
                    <div className="mt-4 space-y-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCopySQL('admin')}
                          variant="outline"
                          className="flex-1"
                          disabled={!userUuid}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy SQL (Admin)
                        </Button>
                        <Button
                          onClick={() => handleCopySQL('superadmin')}
                          variant="default"
                          className="flex-1"
                          disabled={!userUuid}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy SQL (Superadmin)
                        </Button>
                      </div>
                      
                      {!userUuid && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Please enter your UUID in Step 1 first
                          </AlertDescription>
                        </Alert>
                      )}

                      {sqlCopied && (
                        <Alert>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertDescription>
                            SQL copied! Now open Lovable Cloud → SQL Editor and paste it
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Step 3: Access Links */}
                  {step.number === 3 && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.location.href = '/admin/dashboard'}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.location.href = '/admin/webhooks'}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Webhook Settings
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                      <Alert>
                        <Sparkles className="h-4 w-4 text-primary" />
                        <AlertDescription>
                          If you see "Access Denied", make sure you ran the SQL in Step 2 and refresh this page
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Documentation Links */}
          <Card>
            <CardHeader>
              <CardTitle>📚 Documentation & Next Steps</CardTitle>
              <CardDescription>Learn more about admin security and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a 
                href="https://github.com/yourusername/betfuz/blob/main/ADMIN_SETUP_GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="font-semibold">Admin Setup Guide</p>
                  <p className="text-sm text-muted-foreground">Complete setup instructions</p>
                </div>
              </a>

              <a 
                href="https://github.com/yourusername/betfuz/blob/main/ADMIN_ARCHITECTURE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="font-semibold">Admin Architecture</p>
                  <p className="text-sm text-muted-foreground">Technical documentation</p>
                </div>
              </a>

              <a 
                href="https://github.com/yourusername/betfuz/blob/main/SECURITY_CHECKLIST.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="font-semibold">Security Checklist</p>
                  <p className="text-sm text-muted-foreground">Production readiness</p>
                </div>
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminSetup;

import { Github, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AdminFooter = () => {
  return (
    <footer className="border-t border-border bg-background py-4 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          <p>© 2025 BetFuz Admin. All rights reserved.</p>
          <p className="text-xs">Powered by Lovable Cloud & n8n Integration</p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Github className="h-4 w-4 mr-2" />
            Docs
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Twitter className="h-4 w-4 mr-2" />
            Support
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded">
            System Online
          </span>
        </div>
      </div>
    </footer>
  );
};

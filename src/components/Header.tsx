import { Search, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">M</div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              ⚽ Sports
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              🏇 Racing
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              🎮 Games
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              🎰 Live Casino
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              🎲 Virtuals
            </Button>
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="w-64 pl-10 bg-secondary border-border"
            />
          </div>
          <Button variant="outline" size="sm">
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Join Now
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

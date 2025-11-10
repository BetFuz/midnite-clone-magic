import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
          <p className="mb-8 text-xl text-muted-foreground">Oops! Page not found</p>
          <Button onClick={() => window.location.href = "/"} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

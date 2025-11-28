import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Maximize, Volume2, Users, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface StreamPlayerProps {
  title: string;
  viewers: number;
  isLive?: boolean;
  thumbnail?: string;
  matchId: string;
}

const StreamPlayer = ({ title, viewers, isLive = true, thumbnail, matchId }: StreamPlayerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkStreamAccess();
  }, [matchId]);

  const checkStreamAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check if user has placed a bet on this match for "watch & bet" compliance
      const { data: bets } = await supabase
        .from('bet_selections')
        .select('id')
        .eq('match_id', matchId)
        .limit(1);
      
      setHasAccess(!!bets && bets.length > 0);
    }
  };

  const handleStreamRequest = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please login to watch live streams",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('streaming-token', {
        body: { matchId }
      });

      if (error) throw error;

      if (data.success) {
        setStreamUrl(data.embedUrl);
        toast({
          title: "Stream Ready",
          description: "NLRC 2025 Watch & Bet compliance - stream activated"
        });
      }
    } catch (error) {
      console.error('Stream error:', error);
      toast({
        title: "Stream Error",
        description: "Could not load stream. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
        {streamUrl ? (
          <iframe
            src={streamUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen"
            title="Live Stream"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
            
            {thumbnail ? (
              <div className="text-6xl">{thumbnail}</div>
            ) : (
              <div className="text-muted-foreground">Stream Placeholder</div>
            )}

            {isLive && (
              <Badge variant="destructive" className="absolute top-4 left-4 gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </Badge>
            )}

            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              <Users className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">{viewers.toLocaleString()}</span>
            </div>

            <Button 
              size="icon" 
              className="absolute inset-0 m-auto w-16 h-16 rounded-full"
              onClick={handleStreamRequest}
              disabled={isLoading || !hasAccess}
            >
              {!hasAccess ? (
                <Lock className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 fill-current" />
              )}
            </Button>

            {!hasAccess && (
              <div className="absolute bottom-20 left-0 right-0 text-center">
                <Badge variant="outline" className="bg-black/70 text-white border-amber-500">
                  <Lock className="h-3 w-3 mr-1" />
                  Place a bet to watch (NLRC 2025)
                </Badge>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{title}</h3>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default StreamPlayer;

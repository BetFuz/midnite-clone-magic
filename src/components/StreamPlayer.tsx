import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Maximize, Volume2, Users } from "lucide-react";

interface StreamPlayerProps {
  title: string;
  viewers: number;
  isLive?: boolean;
  thumbnail?: string;
}

const StreamPlayer = ({ title, viewers, isLive = true, thumbnail }: StreamPlayerProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
        {/* TODO: DEV – wire to backend when ready */}
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

        <Button size="icon" className="absolute inset-0 m-auto w-16 h-16 rounded-full">
          <Play className="h-8 w-8 fill-current" />
        </Button>

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
      </div>
    </Card>
  );
};

export default StreamPlayer;

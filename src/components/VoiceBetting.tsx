import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { RealtimeVoiceChat } from "@/utils/RealtimeVoice";

interface VoiceBettingProps {
  onTranscript?: (text: string) => void;
}

const VoiceBetting = ({ onTranscript }: VoiceBettingProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const chatRef = useRef<RealtimeVoiceChat | null>(null);
  const { toast } = useToast();

  const handleMessage = (event: any) => {
    console.log('Voice event:', event);
    
    if (event.type === 'response.audio_transcript.delta') {
      setTranscript(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] += event.delta;
        } else {
          updated.push(event.delta);
        }
        onTranscript?.(updated[updated.length - 1]);
        return updated;
      });
    } else if (event.type === 'response.audio_transcript.done') {
      setTranscript(prev => [...prev, ""]);
    } else if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
    } else if (event.type === 'input_audio_buffer.speech_started') {
      console.log('User started speaking');
    } else if (event.type === 'input_audio_buffer.speech_stopped') {
      console.log('User stopped speaking');
    }
  };

  const startConversation = async () => {
    setIsConnecting(true);
    try {
      chatRef.current = new RealtimeVoiceChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Voice Assistant Ready",
        description: "Start speaking to place bets with voice commands",
      });
    } catch (error: any) {
      console.error('Error starting voice chat:', error);
      toast({
        title: "Connection Error",
        description: error.message || 'Failed to start voice assistant',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    setTranscript([]);
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Mic className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Voice Betting</h3>
        </div>

        {!isConnected ? (
          <Button
            onClick={startConversation}
            disabled={isConnecting}
            className="relative h-20 w-20 rounded-full"
            size="lg"
          >
            {isConnecting ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={`relative h-20 w-20 rounded-full flex items-center justify-center ${
              isSpeaking ? 'bg-primary animate-pulse' : 'bg-muted'
            }`}>
              <Mic className="h-8 w-8 text-primary-foreground" />
            </div>
            <Button
              onClick={endConversation}
              variant="secondary"
              className="gap-2"
            >
              <MicOff className="h-4 w-4" />
              End Voice Session
            </Button>
          </div>
        )}

        {transcript.length > 0 && (
          <div className="w-full mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Transcript:</p>
            <div className="space-y-1">
              {transcript.filter(t => t.trim()).map((text, i) => (
                <p key={i} className="text-sm text-foreground">{text}</p>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center max-w-sm">
          Say commands like "Place ₦5000 on Arsenal to win" or "Show me today's football matches"
        </p>
      </div>
    </Card>
  );
};

export default VoiceBetting;
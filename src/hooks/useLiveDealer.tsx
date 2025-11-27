import { useState, useEffect, useRef } from 'react';
import { LiveDealerChat } from '@/utils/RealtimeVoice';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type: 'transcript' | 'game' | 'bet';
  timestamp: Date;
}

interface DealerProfile {
  name: string;
  specialty: string;
  language: string;
  avatar: string;
  description: string;
}

export const useLiveDealer = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentGame, setCurrentGame] = useState<string>('blackjack');
  const [balance, setBalance] = useState(50000);
  const [currentBet, setCurrentBet] = useState(0);
  const chatRef = useRef<LiveDealerChat | null>(null);

  const dealers: DealerProfile[] = [
    {
      name: 'Chioma',
      specialty: 'Blackjack & Poker',
      language: 'English, Igbo, Pidgin',
      avatar: '👩🏾‍💼',
      description: 'Professional dealer from Lagos with 8 years experience'
    },
    {
      name: 'Kunle',
      specialty: 'Roulette & Baccarat',
      language: 'English, Yoruba, Pidgin',
      avatar: '👨🏾‍💼',
      description: 'Expert dealer known for lucky spins'
    },
    {
      name: 'Amara',
      specialty: 'All Games',
      language: 'English, Hausa, Pidgin',
      avatar: '👩🏿‍💼',
      description: 'Multi-talented dealer from Abuja'
    }
  ];

  const [selectedDealer, setSelectedDealer] = useState<DealerProfile>(dealers[0]);

  const handleMessage = (message: any) => {
    const newMessage: Message = {
      role: message.role,
      content: message.content,
      type: message.type || 'transcript',
      timestamp: new Date()
    };

    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.role === message.role && lastMessage.type === 'transcript') {
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, content: lastMessage.content + message.content }
        ];
      }
      return [...prev, newMessage];
    });
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as any);
    
    if (newStatus === 'connected') {
      toast({
        title: "Connected to Live Dealer",
        description: `${selectedDealer.name} is ready to deal`,
      });
    } else if (newStatus === 'error') {
      toast({
        title: "Connection Error",
        description: "Failed to connect to live dealer",
        variant: "destructive",
      });
    }
  };

  const startSession = async () => {
    try {
      chatRef.current = new LiveDealerChat(handleMessage, handleStatusChange);
      await chatRef.current.init(selectedDealer.name, currentGame);
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Failed to Start",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const endSession = () => {
    chatRef.current?.disconnect();
    setStatus('idle');
    toast({
      title: "Session Ended",
      description: "Thank you for playing!",
    });
  };

  const sendMessage = async (text: string) => {
    try {
      await chatRef.current?.sendTextMessage(text);
      setMessages(prev => [...prev, {
        role: 'user',
        content: text,
        type: 'transcript',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to Send",
        description: "Could not send message",
        variant: "destructive",
      });
    }
  };

  const placeBet = (amount: number) => {
    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: `Your balance is ₦${balance.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    setCurrentBet(amount);
    setBalance(prev => prev - amount);
    
    const betMessage = `I'm placing a bet of ₦${amount.toLocaleString()} on ${currentGame}`;
    sendMessage(betMessage);

    toast({
      title: "Bet Placed",
      description: `₦${amount.toLocaleString()} on ${currentGame}`,
    });
  };

  const selectDealer = (dealer: DealerProfile) => {
    if (status !== 'idle') {
      toast({
        title: "Cannot Change Dealer",
        description: "End current session first",
        variant: "destructive",
      });
      return;
    }
    setSelectedDealer(dealer);
  };

  const selectGame = (game: string) => {
    if (status !== 'idle') {
      toast({
        title: "Cannot Change Game",
        description: "End current session first",
        variant: "destructive",
      });
      return;
    }
    setCurrentGame(game);
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return {
    status,
    messages,
    dealers,
    selectedDealer,
    currentGame,
    balance,
    currentBet,
    startSession,
    endSession,
    sendMessage,
    placeBet,
    selectDealer,
    selectGame,
  };
};

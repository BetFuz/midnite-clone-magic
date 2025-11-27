import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface KenoPattern {
  numbers: number[];
  description: string;
  confidence: number;
}

interface QuickPick {
  numbers: number[];
  strategy: string;
}

export const useKeno = () => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [stake, setStake] = useState(100);
  const [balance, setBalance] = useState(50000);
  const [isDrawing, setIsDrawing] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [winAmount, setWinAmount] = useState(0);
  const [aiPattern, setAiPattern] = useState<KenoPattern | null>(null);
  const [quickPick, setQuickPick] = useState<QuickPick | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [drawHistory, setDrawHistory] = useState<number[][]>([]);
  const { toast } = useToast();

  const payoutTable: Record<number, Record<number, number>> = {
    1: { 1: 3 },
    2: { 2: 15 },
    3: { 2: 2, 3: 45 },
    4: { 2: 1, 3: 5, 4: 120 },
    5: { 3: 2, 4: 15, 5: 800 },
    6: { 3: 1, 4: 5, 5: 100, 6: 1500 },
    7: { 4: 2, 5: 20, 6: 200, 7: 7500 },
    8: { 5: 10, 6: 50, 7: 1000, 8: 25000 },
    9: { 5: 5, 6: 25, 7: 200, 8: 5000, 9: 50000 },
    10: { 5: 2, 6: 20, 7: 100, 8: 1000, 9: 10000, 10: 100000 }
  };

  const toggleNumber = useCallback((num: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num);
      }
      if (prev.length >= 10) {
        toast({
          title: "Maximum Selection",
          description: "You can select up to 10 numbers",
          variant: "destructive"
        });
        return prev;
      }
      return [...prev, num].sort((a, b) => a - b);
    });
  }, [toast]);

  const generateQuickPick = useCallback((count: number = 10) => {
    const numbers: number[] = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * 80) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
  }, []);

  const getAIQuickPick = useCallback(async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-keno', {
        body: { action: 'quickPick', history: drawHistory }
      });

      if (error) throw error;

      setQuickPick(data);
      setSelectedNumbers(data.numbers.sort((a: number, b: number) => a - b));
      
      toast({
        title: "AI Quick Pick",
        description: data.strategy
      });
    } catch (error) {
      console.error('AI Quick Pick error:', error);
      generateQuickPick();
    } finally {
      setIsLoadingAI(false);
    }
  }, [drawHistory, generateQuickPick, toast]);

  const getAIPattern = useCallback(async () => {
    if (drawHistory.length < 5) {
      toast({
        title: "Insufficient Data",
        description: "Play a few rounds to get AI pattern analysis"
      });
      return;
    }

    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-keno', {
        body: { action: 'analyzePattern', history: drawHistory }
      });

      if (error) throw error;

      setAiPattern(data);
      
      toast({
        title: "AI Pattern Analysis",
        description: data.description
      });
    } catch (error) {
      console.error('AI Pattern error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze patterns",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAI(false);
    }
  }, [drawHistory, toast]);

  const draw = useCallback(async () => {
    if (selectedNumbers.length === 0) {
      toast({
        title: "No Numbers Selected",
        description: "Please select at least 1 number",
        variant: "destructive"
      });
      return;
    }

    if (stake > balance) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough balance for this bet",
        variant: "destructive"
      });
      return;
    }

    setIsDrawing(true);
    setBalance(prev => prev - stake);

    // Simulate draw animation
    const drawn: number[] = [];
    const drawInterval = setInterval(() => {
      if (drawn.length < 20) {
        let num;
        do {
          num = Math.floor(Math.random() * 80) + 1;
        } while (drawn.includes(num));
        drawn.push(num);
        setDrawnNumbers([...drawn]);
      } else {
        clearInterval(drawInterval);
        
        // Calculate matches
        const matches = selectedNumbers.filter(n => drawn.includes(n)).length;
        setMatchCount(matches);

        // Calculate winnings
        const payout = payoutTable[selectedNumbers.length]?.[matches] || 0;
        const winnings = stake * payout;
        setWinAmount(winnings);

        if (winnings > 0) {
          setBalance(prev => prev + winnings);
          toast({
            title: `${matches} Matches! 🎉`,
            description: `You won ₦${winnings.toLocaleString()}!`
          });
        } else {
          toast({
            title: `${matches} Matches`,
            description: "Better luck next time!"
          });
        }

        // Add to history
        setDrawHistory(prev => [drawn, ...prev].slice(0, 20));
        setIsDrawing(false);
      }
    }, 100);
  }, [selectedNumbers, stake, balance, toast]);

  const reset = useCallback(() => {
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setMatchCount(0);
    setWinAmount(0);
    setAiPattern(null);
    setQuickPick(null);
  }, []);

  return {
    selectedNumbers,
    drawnNumbers,
    stake,
    setStake,
    balance,
    isDrawing,
    matchCount,
    winAmount,
    aiPattern,
    quickPick,
    isLoadingAI,
    drawHistory,
    toggleNumber,
    generateQuickPick,
    getAIQuickPick,
    getAIPattern,
    draw,
    reset,
    payoutTable
  };
};

import { useCasinoBalance } from './useCasinoBalance';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

interface Prize {
  id: string;
  name: string;
  multiplier: number;
  probability: number;
  isJackpot?: boolean;
}

interface ShowHost {
  name: string;
  personality: string;
  catchphrase: string;
}

export const useGameShow = () => {
  const { balance, setBalance, playRound } = useCasinoBalance();
  const [currentStake, setCurrentStake] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showHost, setShowHost] = useState<ShowHost | null>(null);
  const [commentary, setCommentary] = useState('');
  const [jackpotAmount, setJackpotAmount] = useState(250000);
  const [totalSpins, setTotalSpins] = useState(0);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const { toast } = useToast();

  const prizes: Prize[] = [
    { id: '1', name: '2x Multiplier', multiplier: 2, probability: 0.25 },
    { id: '2', name: '5x Multiplier', multiplier: 5, probability: 0.15 },
    { id: '3', name: '10x Multiplier', multiplier: 10, probability: 0.10 },
    { id: '4', name: '20x Multiplier', multiplier: 20, probability: 0.08 },
    { id: '5', name: '50x Multiplier', multiplier: 50, probability: 0.05 },
    { id: '6', name: '100x Multiplier', multiplier: 100, probability: 0.03 },
    { id: '7', name: 'MEGA JACKPOT', multiplier: jackpotAmount / currentStake, probability: 0.01, isJackpot: true },
    { id: '8', name: 'Try Again', multiplier: 0, probability: 0.33 },
  ];

  const generateShowHost = async () => {
    try {
      // AI host generation unavailable
    } catch (error) {
      console.error('Error generating show host:', error);
    }
  };

  const generateCommentary = async (gameState: string, prizeWon?: Prize) => {
    try {
      const data = null;
      // Feature unavailable
      if (data != null && false) {
        setCommentary(data.commentary);
      }
    } catch (error) {
      console.error('Error generating commentary:', error);
      setCommentary('🎉 What a spin! The excitement is building!');
    }
  };

  const selectPrize = (): Prize => {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        return prize;
      }
    }

    return prizes[prizes.length - 1];
  };

  const spinWheel = async () => {
    if (currentStake > balance) {
      toast({
        title: 'Insufficient Balance',
        description: 'Please lower your stake amount',
        variant: 'destructive'
      });
      return;
    }

    setIsSpinning(true);
    setSelectedPrize(null);
    setBalance(prev => prev - currentStake);

    await generateCommentary('spinning');

    // Simulate spinning animation duration
    setTimeout(async () => {
      const prize = selectPrize();
      setSelectedPrize(prize);

      const winAmount = currentStake * prize.multiplier;
      playRound('gameshow', currentStake, winAmount).catch(() => {
        setBalance(prev => prev + currentStake);
      });
      if (winAmount > 0) {
        setBalance(prev => prev + winAmount);
        setTotalWinnings(prev => prev + winAmount);
        
        if (prize.isJackpot) {
          setJackpotAmount(50000); // Reset jackpot
          toast({
            title: '🎊 MEGA JACKPOT WON! 🎊',
            description: `You won ₦${winAmount.toLocaleString()}!`,
            duration: 5000
          });
        } else {
          toast({
            title: '🎉 Prize Won!',
            description: `You won ₦${winAmount.toLocaleString()}!`
          });
        }
      } else {
        toast({
          title: '😔 Better Luck Next Time',
          description: 'Keep spinning for another chance!'
        });
      }

      await generateCommentary('result', prize);
      setTotalSpins(prev => prev + 1);
      setJackpotAmount(prev => prev + (currentStake * 0.01)); // 1% contribution to jackpot
      setIsSpinning(false);
    }, 3000);
  };

  const resetGame = () => {
    setCurrentStake(100);
    setSelectedPrize(null);
    setTotalSpins(0);
    setTotalWinnings(0);
    setCommentary('');
    toast({
      title: 'Game Reset',
      description: 'Starting fresh with ₦10,000'
    });
  };

  return {
    balance,
    currentStake,
    setCurrentStake,
    isSpinning,
    selectedPrize,
    showHost,
    commentary,
    jackpotAmount,
    totalSpins,
    totalWinnings,
    prizes,
    spinWheel,
    resetGame,
    generateShowHost
  };
};

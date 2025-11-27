import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface BingoCard {
  id: string;
  numbers: (number | null)[][]; // 5x5 grid, center is FREE space
  marked: boolean[][];
  price: number;
}

export interface BingoRoom {
  id: string;
  name: string;
  cardPrice: number;
  prize: number;
  players: number;
  maxPlayers: number;
  nextDraw: string;
  pattern: 'line' | 'fullHouse' | 'corners' | 'anyPattern';
}

const AVAILABLE_ROOMS: BingoRoom[] = [
  {
    id: 'naija-90',
    name: 'Naija 90-Ball',
    cardPrice: 100,
    prize: 50000,
    players: 45,
    maxPlayers: 90,
    nextDraw: '2 min',
    pattern: 'line'
  },
  {
    id: 'lagos-express',
    name: 'Lagos Express',
    cardPrice: 500,
    prize: 250000,
    players: 67,
    maxPlayers: 100,
    nextDraw: '5 min',
    pattern: 'fullHouse'
  },
  {
    id: 'mega-millions',
    name: 'Mega Millions',
    cardPrice: 2000,
    prize: 5000000,
    players: 234,
    maxPlayers: 500,
    nextDraw: '10 min',
    pattern: 'anyPattern'
  }
];

export const useBingo = () => {
  const [balance, setBalance] = useState(50000);
  const [rooms] = useState<BingoRoom[]>(AVAILABLE_ROOMS);
  const [activeRoom, setActiveRoom] = useState<BingoRoom | null>(null);
  const [cards, setCards] = useState<BingoCard[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [lastDrawn, setLastDrawn] = useState<number | null>(null);

  const generateCard = useCallback((): BingoCard => {
    const numbers: (number | null)[][] = [];
    
    // Generate 5x5 bingo card
    for (let col = 0; col < 5; col++) {
      const column: (number | null)[] = [];
      const min = col * 15 + 1;
      const max = min + 14;
      const used = new Set<number>();
      
      for (let row = 0; row < 5; row++) {
        if (col === 2 && row === 2) {
          column.push(null); // FREE space
        } else {
          let num: number;
          do {
            num = Math.floor(Math.random() * (max - min + 1)) + min;
          } while (used.has(num));
          used.add(num);
          column.push(num);
        }
      }
      numbers.push(column);
    }

    // Transpose to get row-major order
    const transposed: (number | null)[][] = [];
    for (let row = 0; row < 5; row++) {
      const rowData: (number | null)[] = [];
      for (let col = 0; col < 5; col++) {
        rowData.push(numbers[col][row]);
      }
      transposed.push(rowData);
    }

    return {
      id: crypto.randomUUID(),
      numbers: transposed,
      marked: Array(5).fill(null).map(() => Array(5).fill(false)),
      price: activeRoom?.cardPrice || 100
    };
  }, [activeRoom]);

  const buyCards = useCallback((count: number) => {
    if (!activeRoom) {
      toast({
        title: 'No Room Selected',
        description: 'Please select a bingo room first',
        variant: 'destructive'
      });
      return;
    }

    const totalCost = activeRoom.cardPrice * count;
    if (balance < totalCost) {
      toast({
        title: 'Insufficient Balance',
        description: 'Not enough funds to buy cards',
        variant: 'destructive'
      });
      return;
    }

    const newCards = Array(count).fill(null).map(() => generateCard());
    setCards(prev => [...prev, ...newCards]);
    setBalance(prev => prev - totalCost);

    toast({
      title: 'Cards Purchased!',
      description: `Bought ${count} card(s) for ₦${totalCost.toLocaleString()}`
    });
  }, [activeRoom, balance, generateCard]);

  const checkWin = useCallback((card: BingoCard): boolean => {
    if (!activeRoom) return false;

    const { marked } = card;

    // Check horizontal lines
    for (let row = 0; row < 5; row++) {
      if (marked[row].every(m => m)) return true;
    }

    // Check vertical lines
    for (let col = 0; col < 5; col++) {
      if (marked.every(row => row[col])) return true;
    }

    // Check diagonals
    if (marked[0][0] && marked[1][1] && marked[2][2] && marked[3][3] && marked[4][4]) return true;
    if (marked[0][4] && marked[1][3] && marked[2][2] && marked[3][1] && marked[4][0]) return true;

    // Full house check
    if (activeRoom.pattern === 'fullHouse') {
      return marked.every(row => row.every(m => m));
    }

    return false;
  }, [activeRoom]);

  const drawNumber = useCallback(() => {
    if (drawnNumbers.length >= 75) {
      toast({
        title: 'All Numbers Drawn',
        description: 'Game complete!',
      });
      setIsDrawing(false);
      return;
    }

    let num: number;
    do {
      num = Math.floor(Math.random() * 75) + 1;
    } while (drawnNumbers.includes(num));

    setDrawnNumbers(prev => [...prev, num]);
    setLastDrawn(num);

    // Auto-mark on all cards
    setCards(prevCards => 
      prevCards.map(card => {
        const newMarked = card.marked.map((row, rowIdx) =>
          row.map((marked, colIdx) => {
            if (card.numbers[rowIdx][colIdx] === num) return true;
            return marked;
          })
        );

        // Check for win
        const cardWithNewMarked = { ...card, marked: newMarked };
        if (checkWin(cardWithNewMarked)) {
          setTimeout(() => {
            toast({
              title: '🎉 BINGO!',
              description: `You won ₦${activeRoom?.prize.toLocaleString()}!`,
            });
            setBalance(prev => prev + (activeRoom?.prize || 0));
            setIsDrawing(false);
            setGameActive(false);
          }, 500);
        }

        return { ...card, marked: newMarked };
      })
    );
  }, [drawnNumbers, cards, checkWin, activeRoom]);

  const startGame = useCallback(() => {
    if (cards.length === 0) {
      toast({
        title: 'No Cards',
        description: 'Buy at least one card to play',
        variant: 'destructive'
      });
      return;
    }

    setGameActive(true);
    setIsDrawing(true);
    setDrawnNumbers([]);
    setLastDrawn(null);

    toast({
      title: 'Game Started!',
      description: 'Numbers are being drawn...'
    });
  }, [cards]);

  const joinRoom = useCallback((room: BingoRoom) => {
    setActiveRoom(room);
    setCards([]);
    setDrawnNumbers([]);
    setGameActive(false);
    setIsDrawing(false);

    toast({
      title: 'Joined Room',
      description: `${room.name} - Buy cards to play`
    });
  }, []);

  return {
    balance,
    rooms,
    activeRoom,
    cards,
    drawnNumbers,
    lastDrawn,
    isDrawing,
    gameActive,
    buyCards,
    startGame,
    drawNumber,
    joinRoom
  };
};

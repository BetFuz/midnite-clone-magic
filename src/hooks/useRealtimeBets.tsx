import { useState } from 'react';

export interface BetSettlement {
  bet_id: string;
  status: 'won' | 'lost' | 'void';
  payout?: number;
  timestamp: string;
}

export const useRealtimeBets = () => {
  const [settlements, setSettlements] = useState<BetSettlement[]>([]);
  // Realtime not yet wired to BetFuz socket; returns empty state
  return {
    settlements,
    isConnected: false,
    clearSettlements: () => setSettlements([]),
  };
};

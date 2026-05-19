import { api } from './client';

export interface JackpotRound {
  id: string;
  tier: 'MINI' | 'MIDI' | 'MEGA';
  weekLabel: string;
  status: 'OPEN' | 'CLOSED' | 'SETTLED' | 'ROLLED_OVER';
  poolAmount: number;
  guaranteedMin: number;
  entryFee: number;
  matchCount: number;
  closesAt: string;
  rolloverWeeks: number;
  rolloverFrom?: string;
  jackpot_matches: JackpotMatch[];
}

export interface JackpotMatch {
  id: string;
  roundId: string;
  position: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoffAt: string;
  result?: 'HOME' | 'DRAW' | 'AWAY';
  homeOdds?: number;
  drawOdds?: number;
  awayOdds?: number;
  statsSnapshot: {
    homeForm?: string;
    awayForm?: string;
    h2hHome?: number;
    h2hDraw?: number;
    h2hAway?: number;
    homeGoalsFor?: number;
    homeGoalsAgainst?: number;
    awayGoalsFor?: number;
    awayGoalsAgainst?: number;
    injuries?: string;
    poolGrowth?: number[];
  };
}

export interface JackpotEntry {
  id: string;
  roundId: string;
  picks: Array<{ matchId: string; pick: 'HOME' | 'DRAW' | 'AWAY' }>;
  ticketNumber: number;
  entryFee: number;
  status: 'PENDING' | 'CORRECT_ALL' | 'CONSOLATION' | 'LOST';
  correctCount?: number;
  payout?: number;
  usedAIPicks: boolean;
  createdAt: string;
  jackpot_rounds?: JackpotRound;
}

export interface AIPick {
  matchId: string;
  pick: 'HOME' | 'DRAW' | 'AWAY';
  confidence: number;
  reason: string;
}

export const jackpotApi = {
  getRounds: async (): Promise<JackpotRound[]> => {
    const { data } = await api.get('/jackpot/rounds');
    return data.data;
  },

  getRound: async (id: string): Promise<JackpotRound> => {
    const { data } = await api.get(`/jackpot/rounds/${id}`);
    return data.data;
  },

  enter: async (roundId: string, picks: Array<{ matchId: string; pick: string }>, usedAIPicks = false) => {
    const { data } = await api.post('/jackpot/enter', { roundId, picks, usedAIPicks });
    return data.data;
  },

  getAIPicks: async (roundId: string): Promise<AIPick[]> => {
    const { data } = await api.post(`/jackpot/ai-picks/${roundId}`, {});
    return data.data;
  },

  createSyndicate: async (roundId: string, requiredMembers: number) => {
    const { data } = await api.post('/jackpot/syndicate/create', { roundId, requiredMembers });
    return data.data;
  },

  joinSyndicate: async (code: string) => {
    const { data } = await api.post(`/jackpot/syndicate/join/${code}`, {});
    return data.data;
  },

  getSyndicate: async (code: string) => {
    const { data } = await api.get(`/jackpot/syndicate/${code}`);
    return data.data;
  },

  getMyTickets: async (): Promise<JackpotEntry[]> => {
    const { data } = await api.get('/jackpot/my-tickets');
    return data.data;
  },

  getHistory: async (): Promise<JackpotRound[]> => {
    const { data } = await api.get('/jackpot/history');
    return data.data;
  },
};

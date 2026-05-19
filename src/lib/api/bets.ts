import { api } from './client';

export const betApi = {
  placeBet: (data: {
    selections: { eventId: string; marketId: string; oddsId: string; odds: number }[];
    stake: number;
    betType: 'single' | 'accumulator';
  }) => api.post('/bets/place', data).then(r => r.data.data),

  getMyBets: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get('/bets/my', { params }).then(r => r.data.data),

  getBet: (id: string) =>
    api.get(`/bets/${id}`).then(r => r.data.data),

  cashOut: (betId: string) =>
    api.post(`/bets/${betId}/cashout`).then(r => r.data.data),

  getCashOutValue: (betId: string) =>
    api.get(`/bets/${betId}/cashout-value`).then(r => r.data.data),
};

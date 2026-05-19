import { api } from './client';

export const casinoApi = {
  playRound: (data: { game: string; stake: number; payout: number }) =>
    api.post('/casino/round', data).then(r => r.data.data),


  getGames: (params?: { category?: string; limit?: number }) =>
    api.get('/casino/games', { params }).then(r => r.data.data),

  getGame: (id: string) =>
    api.get(`/casino/games/${id}`).then(r => r.data.data),

  play: (data: { gameId: string; stake: number; action?: string; data?: unknown }) =>
    api.post('/casino/play', data).then(r => r.data.data),

  getHistory: (params?: { limit?: number; offset?: number }) =>
    api.get('/casino/history', { params }).then(r => r.data.data),
};

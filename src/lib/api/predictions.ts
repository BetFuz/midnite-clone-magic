import { api } from './client';

export const predictionsApi = {
  // Politics
  getPoliticsMarkets: async () => {
    const { data } = await api.get('/political');
    return data.data;
  },
  placePoliticsBet: async (marketId: string, selectionId: string, stake: number) => {
    const { data } = await api.post('/political/bet', { marketId, selectionId, stake });
    return data.data;
  },
  getMyPoliticsBets: async () => {
    const { data } = await api.get('/political/my-bets');
    return data.data;
  },

  // Entertainment / Social
  getEntertainmentMarkets: async () => {
    const { data } = await api.get('/entertainment');
    return data.data;
  },
  placeEntertainmentBet: async (marketId: string, selectionId: string, stake: number) => {
    const { data } = await api.post('/entertainment/bet', { marketId, selectionId, stake });
    return data.data;
  },
  getMyEntertainmentBets: async () => {
    const { data } = await api.get('/entertainment/my-bets');
    return data.data;
  },

  // Financial
  getFinancialMarkets: async () => {
    const { data } = await api.get('/financial');
    return data.data;
  },
  getLivePrices: async () => {
    const { data } = await api.get('/financial/live-prices');
    return data.data;
  },
  placeFinancialBet: async (marketId: string, prediction: 'UP' | 'DOWN', stake: number) => {
    const { data } = await api.post('/financial/bet', { marketId, prediction, stake });
    return data.data;
  },
  getMyFinancialBets: async () => {
    const { data } = await api.get('/financial/my-bets');
    return data.data;
  },

  // Sports Predictions
  getPredictMarkets: async () => {
    const { data } = await api.get('/predict');
    return data.data;
  },
  getMyPredictBets: async () => {
    const { data } = await api.get('/predict/my-bets');
    return data.data;
  },
  getPredictLeaderboard: async () => {
    const { data } = await api.get('/predict/leaderboard');
    return data.data;
  },
};

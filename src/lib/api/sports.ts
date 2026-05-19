import { api } from './client';

export const sportsApi = {
  getEvents: (params?: { sport?: string; status?: string; limit?: number }) =>
    api.get('/sports/events', { params }).then(r => r.data.data),

  getLiveEvents: (params?: { limit?: number }) =>
    api.get('/sports/events/live', { params }).then(r => r.data.data),

  getEvent: (id: string) =>
    api.get(`/sports/events/${id}`).then(r => r.data.data),

  getLeagues: () =>
    api.get('/sports/leagues').then(r => r.data.data),

  getMarkets: (eventId: string) =>
    api.get(`/sports/events/${eventId}/markets`).then(r => r.data.data),
};

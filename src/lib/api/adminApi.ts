import { api } from './client';
import { useAuthStore } from '@/store/authStore';

export const adminApi = {
  // Stats
  getStats: () => api.get('/admin/stats').then(r => r.data.data ?? r.data),

  // Users
  getUsers: (params?: { limit?: number; page?: number; search?: string; status?: string; kyc?: string }) =>
    api.get('/admin/users', { params }).then(r => r.data),
  getUser: (id: string) => api.get(`/admin/users/${id}`).then(r => r.data.data),
  getUserActivity: (id: string) => api.get(`/admin/users/${id}/activity`).then(r => r.data.data),
  creditUser: (id: string, body: { amount: number; note?: string }) =>
    api.post(`/admin/users/${id}/credit`, body).then(r => r.data.data),
  suspendUser: (id: string, body?: { reason?: string }) =>
    api.post(`/admin/users/${id}/suspend`, body ?? {}).then(r => r.data.data),
  unsuspendUser: (id: string) =>
    api.post(`/admin/users/${id}/unsuspend`).then(r => r.data.data),

  // Bets
  getBets: (params?: { status?: string; sport?: string; search?: string; limit?: number; page?: number }) =>
    api.get('/admin/bets', { params }).then(r => r.data),
  getBetStats: () => api.get('/admin/bets/stats').then(r => r.data.data ?? r.data),
  settleBet: (id: string, body: { outcome: 'won' | 'lost' | 'WON' | 'LOST' }) =>
    api.post(`/admin/bets/${id}/settle`, body).then(r => r.data),
  voidBet: (id: string) => api.post(`/admin/bets/${id}/void`).then(r => r.data),

  // Events
  getEvents: (params?: { status?: string; sport?: string; search?: string; limit?: number }) =>
    api.get('/admin/events', { params }).then(r => r.data),
  createEvent: (data: any) => api.post('/admin/events', data).then(r => r.data.data),
  updateEvent: (id: string, data: any) => api.patch(`/admin/events/${id}`, data).then(r => r.data.data),
  deleteEvent: (id: string) => api.delete(`/admin/events/${id}`).then(r => r.data),
  createMarket: (eventId: string, data: any) =>
    api.post(`/admin/events/${eventId}/markets`, data).then(r => r.data.data),
  updateOdds: (oddsId: string, data: any) =>
    api.patch(`/admin/odds/${oddsId}`, data).then(r => r.data.data),

  // KYC
  getKyc: (params?: { status?: string; limit?: number; page?: number; search?: string }) =>
    api.get('/admin/kyc', { params }).then(r => r.data),
  getKycStats: () => api.get('/admin/kyc/stats').then(r => r.data.data ?? r.data),
  approveKyc: (id: string) => api.post(`/admin/kyc/${id}/approve`).then(r => r.data.data),
  rejectKyc: (id: string, reason: string) =>
    api.post(`/admin/kyc/${id}/reject`, { reason }).then(r => r.data.data),

  // Finances
  getWithdrawals: (params?: { status?: string; limit?: number; page?: number; search?: string }) =>
    api.get('/admin/withdrawals', { params }).then(r => r.data),
  approveWithdrawal: (id: string) =>
    api.post(`/admin/withdrawals/${id}/approve`).then(r => r.data),
  rejectWithdrawal: (id: string, reason?: string) =>
    api.post(`/admin/withdrawals/${id}/reject`, { reason }).then(r => r.data),
  getTransactions: (params?: { type?: string; status?: string; search?: string; limit?: number; page?: number }) =>
    api.get('/admin/transactions', { params }).then(r => r.data),
  getFinanceStats: () => api.get('/admin/finance/stats').then(r => r.data.data ?? r.data),

  // Fraud
  getFraudFlags: (params?: { limit?: number; offset?: number }) =>
    api.get('/admin/fraud', { params }).then(r => r.data.data),

  // Audit
  getAuditLogs: (params?: { search?: string; limit?: number; page?: number }) =>
    api.get('/admin/audit-logs', { params }).then(r => r.data),

  // Config
  getSystemConfig: () => api.get('/admin/system-config').then(r => r.data.data ?? r.data),
  updateSystemConfig: (updates: Record<string, any>) =>
    api.patch('/admin/system-config', updates).then(r => r.data),

  // Broadcast
  broadcast: (data: { message: string; title?: string; type?: string; target?: string; userIds?: string[] }) =>
    api.post('/admin/broadcast', data).then(r => r.data),

  // Credentials
  getCredentials: () => api.get('/admin/credentials').then(r => r.data.data),

  // AI
  getAIInsights: () => api.post('/admin/ai/insights').then(r => r.data.data ?? r.data),
  getAIFraudScore: (userId: string) => api.get(`/admin/ai/fraud/${userId}`).then(r => r.data.data ?? r.data),
  getAIBettingTips: () => api.get('/admin/ai/tips').then(r => r.data.data ?? r.data),
  getAIBonusRec: (userId: string) => api.get(`/admin/ai/bonus/${userId}`).then(r => r.data.data ?? r.data),

  // AI Control Center
  getAIControlConfig: () =>
    api.get('/admin/ai-control/config').then(r => r.data.data ?? r.data),
  saveAIControlConfig: (config: Record<string, number>) =>
    api.patch('/admin/ai-control/config', config).then(r => r.data),
  getAIDecisions: (params?: { module?: string; page?: number; limit?: number }) =>
    api.get('/admin/ai-control/decisions', { params }).then(r => r.data.data ?? r.data),
  runAutopilot: () =>
    api.post('/admin/ai-control/run').then(r => r.data.data ?? r.data),
  overrideDecision: (auditLogId: string, reason?: string) =>
    api.post(`/admin/ai-control/override/${auditLogId}`, { reason }).then(r => r.data),

  // n8n workflows
  getN8nWorkflows: () => api.get('/admin/n8n/workflows').then(r => r.data.data ?? r.data),
  getN8nExecutions: () => api.get('/admin/n8n/executions').then(r => r.data.data ?? r.data),
  activateWorkflow: (id: string) => api.post(`/admin/n8n/workflows/${id}/activate`).then(r => r.data),
  deactivateWorkflow: (id: string) => api.post(`/admin/n8n/workflows/${id}/deactivate`).then(r => r.data),
  triggerWorkflow: (workflowName: string, payload?: any) =>
    api.post(`/admin/n8n/trigger/${workflowName}`, payload ?? {}).then(r => r.data),

  // Analytics
  getWeeklyAnalytics: () => api.get('/admin/analytics/weekly').then(r => r.data.data ?? r.data),
  getSportsBreakdown: () => api.get('/admin/analytics/sports').then(r => r.data.data ?? r.data),
  getTopUsers: () => api.get('/admin/analytics/top-users').then(r => r.data.data ?? r.data),
  getAnalyticsSummary: () => api.get('/admin/analytics/summary').then(r => r.data.data ?? r.data),

  // Bonus
  grantBonus: (data: { userId: string; type: string; amount: number; note?: string }) =>
    api.post('/admin/bonus/grant', data).then(r => r.data),
  broadcastBonus: (data: { type: string; amount: number; target?: string; note?: string }) =>
    api.post('/admin/bonus/broadcast', data).then(r => r.data),
  checkBonusExpiry: () => api.post('/admin/bonus/check-expiry').then(r => r.data),

  // Responsible Gambling
  getRGFlags: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/rg/flags', { params }).then(r => r.data.data ?? r.data),
  forceSelfExclude: (userId: string, body: { reason?: string; duration?: string }) =>
    api.post(`/admin/rg/self-exclude/${userId}`, body).then(r => r.data),

  // Live data sync
  syncOdds: () => api.post('/admin/sync/odds').then(r => r.data),
  updateScore: (eventId: string, data: { homeScore?: number; awayScore?: number; minute?: number; status?: string }) =>
    api.post(`/admin/events/${eventId}/score`, data).then(r => r.data.data),

  // System Health
  getHealth: () => api.get('/admin/health').then(r => r.data.data ?? r.data),

  // SSE — returns an EventSource connected with the auth token
  createEventSource: (): EventSource | null => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return null;
    // SSE passes token as query param since EventSource doesn't support custom headers
    return new EventSource(`/api/v1/admin/stream?token=${token}`);
  },
};

import { api } from './client';

export const adminApi = {
  getStats: () =>
    api.get('/admin/stats').then(r => r.data.data),

  getUsers: (params?: { limit?: number; offset?: number; search?: string }) =>
    api.get('/admin/users', { params }).then(r => r.data.data),

  getUser: (id: string) =>
    api.get(`/admin/users/${id}`).then(r => r.data.data),

  creditUser: (id: string, amount: number, reason: string) =>
    api.post(`/admin/users/${id}/credit`, { amount, reason }).then(r => r.data.data),

  suspendUser: (id: string, reason: string) =>
    api.post(`/admin/users/${id}/suspend`, { reason }).then(r => r.data.data),

  unsuspendUser: (id: string) =>
    api.post(`/admin/users/${id}/unsuspend`).then(r => r.data.data),

  getBets: (params?: { limit?: number; offset?: number; status?: string }) =>
    api.get('/admin/bets', { params }).then(r => r.data.data),

  settleBet: (id: string, outcome: string) =>
    api.post(`/admin/bets/${id}/settle`, { outcome }).then(r => r.data.data),

  voidBet: (id: string, reason: string) =>
    api.post(`/admin/bets/${id}/void`, { reason }).then(r => r.data.data),

  getKycRequests: (params?: { limit?: number; offset?: number; status?: string }) =>
    api.get('/admin/kyc', { params }).then(r => r.data.data),

  approveKyc: (id: string) =>
    api.post(`/admin/kyc/${id}/approve`).then(r => r.data.data),

  rejectKyc: (id: string, reason: string) =>
    api.post(`/admin/kyc/${id}/reject`, { reason }).then(r => r.data.data),

  getWithdrawals: (params?: { limit?: number; offset?: number; status?: string }) =>
    api.get('/admin/withdrawals', { params }).then(r => r.data.data),

  approveWithdrawal: (id: string) =>
    api.post(`/admin/withdrawals/${id}/approve`).then(r => r.data.data),

  rejectWithdrawal: (id: string, reason: string) =>
    api.post(`/admin/withdrawals/${id}/reject`, { reason }).then(r => r.data.data),

  getTransactions: (params?: { limit?: number; offset?: number }) =>
    api.get('/admin/transactions', { params }).then(r => r.data.data),

  getEvents: (params?: { limit?: number; offset?: number }) =>
    api.get('/admin/events', { params }).then(r => r.data.data),

  createEvent: (data: any) =>
    api.post('/admin/events', data).then(r => r.data.data),

  updateEvent: (id: string, data: any) =>
    api.patch(`/admin/events/${id}`, data).then(r => r.data.data),

  deleteEvent: (id: string) =>
    api.delete(`/admin/events/${id}`).then(r => r.data.data),

  getAuditLogs: (params?: { limit?: number; offset?: number }) =>
    api.get('/admin/audit-logs', { params }).then(r => r.data.data),

  getFraudAlerts: () =>
    api.get('/admin/fraud').then(r => r.data.data),

  getSystemConfig: () =>
    api.get('/admin/system-config').then(r => r.data.data),

  updateSystemConfig: (key: string, value: any) =>
    api.patch(`/admin/system-config/${key}`, { value }).then(r => r.data.data),

  broadcast: (message: string, type: string) =>
    api.post('/admin/broadcast', { message, type }).then(r => r.data.data),
};

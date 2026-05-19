import { api } from './client';

export const userApi = {
  getProfile: () =>
    api.get('/users/profile').then(r => r.data.data),

  updateProfile: (data: Partial<{ firstName: string; lastName: string; username: string; phone: string; avatarUrl: string }>) =>
    api.patch('/users/profile', data).then(r => r.data.data),

  getStats: () =>
    api.get('/users/stats').then(r => r.data.data),

  submitKyc: (data: FormData) =>
    api.post('/kyc/submit', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data),

  getKycStatus: () =>
    api.get('/kyc/status').then(r => r.data.data),

  getRgLimits: () =>
    api.get('/rg').then(r => r.data.data),

  setRgLimit: (data: { type: string; amount: number; periodDays: number }) =>
    api.post('/rg/limits', data).then(r => r.data.data),

  selfExclude: (data: { type?: string; reason?: string; days?: number }) =>
    api.post('/rg/self-exclude', data).then(r => r.data.data),
};

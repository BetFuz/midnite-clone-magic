import { api } from './client';

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then(r => r.data.data),

  register: (data: {
    email: string; password: string;
    firstName: string; lastName: string;
    username: string; phone?: string; referralCode?: string;
  }) => api.post('/auth/register', data).then(r => r.data.data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me').then(r => r.data.data),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then(r => r.data.data),

  loginWeb3: (data: { address: string; signature: string; message: string }) =>
    api.post('/auth/login/web3', data).then(r => r.data.data),
};

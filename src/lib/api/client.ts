import axios, { AxiosInstance } from 'axios';

let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _onUnauthorized: (() => void) | null = null;

export function setTokens(access: string | null, refresh: string | null) {
  _accessToken  = access;
  _refreshToken = refresh;
}

export function setUnauthorizedHandler(fn: () => void) {
  _onUnauthorized = fn;
}

export const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry && _refreshToken) {
      original._retry = true;
      try {
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken: _refreshToken });
        const newAccess  = data.data.accessToken;
        const newRefresh = data.data.refreshToken;
        setTokens(newAccess, newRefresh);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api.request(original);
      } catch {
        setTokens(null, null);
        _onUnauthorized?.();
      }
    }
    return Promise.reject(err);
  }
);

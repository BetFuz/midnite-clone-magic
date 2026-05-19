import { api } from './client';

export const walletApi = {
  getBalance: () =>
    api.get('/wallet/balance').then(r => r.data.data),

  getTransactions: (params?: { limit?: number; offset?: number; type?: string }) =>
    api.get('/wallet/transactions', { params }).then(r => r.data.data),

  initiateDeposit: (data: { amount: number; currency?: string; method?: string; phone?: string }) =>
    api.post('/wallet/deposit/initiate', data).then(r => r.data.data),

  initiateWithdrawal: (data: { amount: number; accountNumber?: string; bankCode?: string; bankName?: string; method?: string; [key: string]: any }) =>
    api.post('/wallet/withdraw', data).then(r => r.data.data),

  getBanks: () =>
    api.get('/wallet/banks').then(r => r.data.data),

  resolveAccount: (data: { accountNumber: string; bankCode: string }) =>
    api.post('/wallet/resolve-account', data).then(r => r.data.data),

  getWithdrawals: (params?: { limit?: number; offset?: number }) =>
    api.get('/wallet/withdrawals', { params }).then(r => r.data.data),

  getPaymentMethods: () =>
    api.get('/wallet/payment-methods').then(r => r.data.data).catch(() => []),
};

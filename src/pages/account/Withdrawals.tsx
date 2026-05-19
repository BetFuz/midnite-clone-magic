import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import {
  Zap, Smartphone, CreditCard, Bitcoin, ChevronRight,
  CheckCircle, Clock, Shield, ArrowLeft, History,
  RefreshCw, AlertCircle, Globe, ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProviderConfig {
  id: string;
  name: string;
  type: string;
  logoColor: string;
  priority: number;
  processingTime: string;
  withdrawalSupported: boolean;
}

interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  dialCode: string;
  minWithdrawal: number;
  maxWithdrawal: number;
  autoSettleLimit: number;
  quickAmounts: number[];
  providers: ProviderConfig[];
}

const PROVIDER_ICONS: Record<string, any> = {
  mobile_money: Smartphone,
  card: CreditCard,
  crypto: Bitcoin,
  bank: CreditCard,
};

const PROVIDER_COLORS: Record<string, string> = {
  mtn: '#FFCC00',
  mpesa: '#00A651',
  airtel: '#E40000',
  wave: '#2563EB',
  orange: '#FF7900',
  moov: '#00B5E2',
  flutterwave: '#F5A623',
  crypto: '#26A17B',
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'text-green-400',
  PENDING:   'text-yellow-400',
  FAILED:    'text-red-400',
  PROCESSING:'text-blue-400',
};

const BetFuzLogo = ({ size = 'md' }: { size?: 'sm' | 'md' }) => (
  <div className="flex items-center gap-2">
    <div className={`${size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-[#00b15c] flex items-center justify-center flex-shrink-0`}>
      <Zap className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'} text-white`} />
    </div>
    <div>
      <span className={`text-white font-bold ${size === 'sm' ? 'text-sm' : 'text-base'} leading-none`}>BetFuz</span>
      {size !== 'sm' && <span className="block text-[9px] text-[#00b15c] font-semibold tracking-[0.2em] uppercase mt-0.5">Africa</span>}
    </div>
  </div>
);

export default function Withdrawals() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [countries, setCountries]     = useState<CountryConfig[]>([]);
  const [country, setCountry]         = useState<CountryConfig | null>(null);
  const [showCountry, setShowCountry] = useState(false);
  const [balance, setBalance]         = useState<number | null>(null);
  const [selected, setSelected]       = useState<string | null>(null);
  const [amount, setAmount]           = useState('');
  const [dest, setDest]               = useState('');
  const [loading, setLoading]         = useState(false);
  const [balLoading, setBalLoading]   = useState(true);
  const [history, setHistory]         = useState<any[]>([]);
  const [done, setDone]               = useState<any>(null);

  const selectedProvider = country?.providers.find(p => p.id === selected) ?? null;
  const isMobile  = selectedProvider?.type === 'mobile_money';
  const isCrypto  = selected === 'crypto';
  const numAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const isInsufficient = balance !== null && numAmount > 0 && numAmount > balance;
  const autoSettle = isMobile && country ? numAmount > 0 && numAmount <= country.autoSettleLimit : false;

  useEffect(() => {
    api.get('/wallet/africa/countries').then(r => {
      const list: CountryConfig[] = r.data.data ?? r.data ?? [];
      setCountries(list);
      const ke = list.find(c => c.code === 'KE') ?? list[0];
      if (ke) setCountry(ke);
    }).catch(() => {});

    api.get('/wallet/balance').then(r => {
      setBalance(parseFloat(r.data.data?.cashBalance ?? 0));
    }).catch(() => setBalance(0)).finally(() => setBalLoading(false));

    api.get('/wallet/withdrawals').then(r => {
      setHistory(r.data.data ?? []);
    }).catch(() => {});
  }, []);

  const fmt = (n: number) => country
    ? `${country.currencySymbol}${Number(n).toLocaleString()}`
    : `${Number(n).toLocaleString()}`;

  const handleWithdraw = async () => {
    if (!selectedProvider || !country) return;
    if (!numAmount || numAmount < country.minWithdrawal || numAmount > country.maxWithdrawal) {
      return toast.error(`Amount must be between ${fmt(country.minWithdrawal)} and ${fmt(country.maxWithdrawal)}`);
    }
    if ((isMobile || isCrypto) && !dest) return toast.error('Destination required');
    if (isInsufficient) return toast.error('Insufficient balance');

    setLoading(true);
    setDone(null);
    try {
      const res = await api.post('/wallet/africa/withdraw', {
        country: country.code,
        provider: selected,
        amount: numAmount,
        phone: isMobile ? dest.replace(/\D/g, '') : undefined,
        walletAddress: isCrypto ? dest : undefined,
        currency: country.currency,
      });

      const data = res.data.data ?? {};
      setBalance(data.newBalance ?? null);
      setDone({ ...data, amount: numAmount });
      setAmount(''); setDest('');
      toast.success(data.autoSettle
        ? '⚡ Withdrawal processing — arrives shortly!'
        : 'Withdrawal submitted successfully');
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Withdrawal failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <BetFuzLogo />
        </div>

        {/* Fast withdrawal promise */}
        <div className="bg-gradient-to-r from-[#00b15c]/20 via-[#00b15c]/10 to-transparent border border-[#00b15c]/30 rounded-2xl p-4 mb-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#00b15c] flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">⚡ Mobile Money — Under 5 Minutes</p>
            <p className="text-gray-400 text-xs mt-0.5">Mobile money withdrawals below your country's auto-settle limit are processed instantly — no manual review needed.</p>
          </div>
        </div>

        {/* Country selector */}
        <div className="mb-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Your Country</p>
          <div className="relative">
            <button
              onClick={() => setShowCountry(!showCountry)}
              className="w-full bg-[#111827] border border-[#1f2d3d] rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[#00b15c]/40 transition-colors"
            >
              <Globe className="w-4 h-4 text-gray-500" />
              {country ? (
                <>
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-white font-medium text-sm flex-1 text-left">{country.name}</span>
                  <span className="text-gray-500 text-xs">{country.currency}</span>
                </>
              ) : (
                <span className="text-gray-500 text-sm flex-1 text-left">Select your country…</span>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showCountry ? 'rotate-180' : ''}`} />
            </button>

            {showCountry && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto">
                {countries.map(c => (
                  <button
                    key={c.code}
                    onClick={() => { setCountry(c); setSelected(null); setShowCountry(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="text-white text-sm flex-1">{c.name}</span>
                    <span className="text-gray-500 text-xs">{c.currency}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Balance card */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Available to Withdraw</p>
              {balLoading ? (
                <div className="w-36 h-8 bg-white/10 rounded animate-pulse" />
              ) : (
                <p className="text-white font-bold text-3xl">{fmt(balance ?? 0)}</p>
              )}
              <p className="text-gray-600 text-xs mt-1">{user?.email}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#00b15c] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Success confirmation */}
        {done && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold text-sm">
                  {done.autoSettle ? '⚡ Withdrawal Processing!' : 'Withdrawal Submitted'}
                </p>
                {done.reference && <p className="text-gray-400 text-xs">Ref: {done.reference}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Amount: <strong className="text-white">{fmt(done.amount)}</strong></span>
              {done.estimatedTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ETA: <strong className={`ml-1 ${done.autoSettle ? 'text-green-400' : 'text-yellow-400'}`}>{done.estimatedTime}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Withdrawal methods */}
        {country && (
          <div className="space-y-3 mb-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Choose withdrawal method</p>

            {country.providers.filter(p => p.withdrawalSupported !== false).map(p => {
              const Icon = PROVIDER_ICONS[p.type] ?? Smartphone;
              const color = PROVIDER_COLORS[p.id] ?? '#00b15c';
              const isSelected = selected === p.id;

              return (
                <button
                  key={p.id}
                  onClick={() => { setSelected(isSelected ? null : p.id); setDone(null); }}
                  className={`w-full text-left rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-[#00b15c]/60 bg-[#00b15c]/5'
                      : 'border-[#1f2d3d] bg-[#111827] hover:border-[#1f2d3d]/80'
                  }`}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold">{p.name}</p>
                      <p className="text-gray-500 text-xs">{p.processingTime}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {p.type === 'mobile_money' && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full border font-medium bg-green-500/10 text-green-400 border-green-500/20">
                          ⚡ Auto-settle
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {isSelected && (
                    <div className="px-5 pb-5 border-t border-[#1f2d3d] pt-4" onClick={e => e.stopPropagation()}>

                      {/* Auto-settle badge */}
                      {isMobile && autoSettle && (
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 text-xs text-green-400">
                          <Zap className="w-4 h-4 flex-shrink-0" />
                          This amount qualifies for instant auto-settlement — no manual review needed.
                        </div>
                      )}

                      {/* Destination field */}
                      {(isMobile || isCrypto) && (
                        <div className="mb-3">
                          <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">
                            {isMobile ? `Phone Number (${country.dialCode})` : 'USDT Wallet Address (TRC-20)'}
                          </label>
                          <input
                            type={isMobile ? 'tel' : 'text'}
                            value={dest}
                            onChange={e => setDest(e.target.value)}
                            placeholder={isMobile ? `${country.dialCode} XXX XXX XXXX` : 'TRx… or 0x…'}
                            className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-xl text-white text-sm px-4 py-3 focus:outline-none focus:border-[#00b15c]/50 placeholder:text-gray-600"
                          />
                        </div>
                      )}

                      {/* Amount */}
                      <div className="mb-3">
                        <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">
                          Amount ({country.currency})
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{country.currencySymbol}</span>
                          <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0"
                            min={country.minWithdrawal}
                            max={country.maxWithdrawal}
                            className={`w-full bg-[#0d1520] border rounded-xl text-white text-sm pl-12 pr-4 py-3 focus:outline-none placeholder:text-gray-600 ${
                              isInsufficient ? 'border-red-500/50' : 'border-[#1f2d3d] focus:border-[#00b15c]/50'
                            }`}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-gray-600 text-xs">
                            Min: {fmt(country.minWithdrawal)} · Max: {fmt(country.maxWithdrawal)}
                          </p>
                          {isInsufficient && (
                            <p className="text-red-400 text-xs flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Insufficient balance
                            </p>
                          )}
                        </div>
                        {isMobile && numAmount > 0 && country.autoSettleLimit > 0 && (
                          <p className="text-gray-500 text-xs mt-1">
                            Auto-settle limit: {fmt(country.autoSettleLimit)}
                            {numAmount <= country.autoSettleLimit
                              ? ' · ⚡ Qualifies for instant payout'
                              : ' · Will require manual processing'}
                          </p>
                        )}
                      </div>

                      {/* Quick amounts */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {country.quickAmounts.filter(q => q >= country.minWithdrawal && q <= (balance ?? Infinity)).map(q => (
                          <button
                            key={q}
                            onClick={() => setAmount(q.toString())}
                            className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                              amount === q.toString()
                                ? 'bg-[#00b15c]/10 text-[#00b15c] border-[#00b15c]/30'
                                : 'bg-[#0d1520] text-gray-400 border-[#1f2d3d] hover:border-[#00b15c]/30 hover:text-white'
                            }`}
                          >
                            {fmt(q)}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleWithdraw}
                        disabled={loading || !amount || ((isMobile || isCrypto) && !dest) || !!isInsufficient}
                        className="w-full bg-[#00b15c] hover:bg-[#00963d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {loading
                          ? <><RefreshCw className="w-4 h-4 animate-spin" /> Processing…</>
                          : autoSettle
                          ? <><Zap className="w-4 h-4" /> Withdraw {numAmount ? fmt(numAmount) : ''} ⚡</>
                          : <>Withdraw {numAmount ? fmt(numAmount) : ''}</>
                        }
                      </button>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Withdrawal history */}
        {history.length > 0 && (
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1f2d3d] flex items-center gap-2">
              <History className="w-4 h-4 text-gray-400" />
              <h3 className="text-white font-semibold text-sm">Withdrawal History</h3>
            </div>
            {history.map((t: any, i: number) => {
              const meta = t.metadata as any;
              const method = meta?.provider ?? meta?.method ?? 'bank';
              return (
                <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-[#1f2d3d]/50 last:border-0">
                  <div>
                    <p className="text-white text-xs font-medium capitalize">{method.replace('_', ' ')}</p>
                    <p className="text-gray-500 text-[10px]">{new Date(t.createdAt).toLocaleString()} · {t.reference?.slice(0, 16)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-bold text-sm">-{Number(t.amount).toLocaleString()}</p>
                    <span className={`text-[10px] ${STATUS_COLORS[t.status] ?? 'text-gray-400'}`}>{t.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust footer */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Secure</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Licensed</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Fast payouts</span>
          </div>
          <BetFuzLogo size="sm" />
        </div>

      </div>
    </div>
  );
}

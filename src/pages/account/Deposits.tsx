import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import {
  Zap, Smartphone, CreditCard, Bitcoin, ChevronRight,
  CheckCircle, Clock, Shield, ArrowLeft, History,
  RefreshCw, Copy, Globe, ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProviderConfig {
  id: string;
  name: string;
  type: string;
  logoColor: string;
  priority: number;
  processingTime: string;
}

interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  dialCode: string;
  minDeposit: number;
  maxDeposit: number;
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

const CRYPTO_ADDRESS = import.meta.env.VITE_USDT_ADDRESS || 'TRX_BETFUZ_WALLET_ADDRESS_HERE';

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

export default function Deposits() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [countries, setCountries]   = useState<CountryConfig[]>([]);
  const [country, setCountry]       = useState<CountryConfig | null>(null);
  const [showCountry, setShowCountry] = useState(false);
  const [balance, setBalance]       = useState<number | null>(null);
  const [selected, setSelected]     = useState<string | null>(null);
  const [phone, setPhone]           = useState('');
  const [amount, setAmount]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [balLoading, setBalLoading] = useState(true);
  const [history, setHistory]       = useState<any[]>([]);
  const [copied, setCopied]         = useState(false);
  const [depositResult, setDepositResult] = useState<any>(null);

  const selectedProvider = country?.providers.find(p => p.id === selected) ?? null;
  const isMobile = selectedProvider?.type === 'mobile_money';
  const isCrypto = selected === 'crypto';
  const isCard   = selected === 'flutterwave';

  useEffect(() => {
    api.get('/wallet/africa/countries').then(r => {
      const list: CountryConfig[] = r.data.data ?? r.data ?? [];
      setCountries(list);
      // Default to Kenya or first country
      const ke = list.find(c => c.code === 'KE') ?? list[0];
      if (ke) setCountry(ke);
    }).catch(() => {});

    api.get('/wallet/balance').then(r => {
      setBalance(parseFloat(r.data.data?.cashBalance ?? 0));
    }).catch(() => setBalance(0)).finally(() => setBalLoading(false));

    api.get('/wallet/transactions?type=DEPOSIT&limit=5').then(r => {
      setHistory(r.data.data ?? []);
    }).catch(() => {});
  }, []);

  const fmt = (n: number) => country
    ? `${country.currencySymbol}${Number(n).toLocaleString()}`
    : `${Number(n).toLocaleString()}`;

  const handleDeposit = async () => {
    if (!selectedProvider || !country) return;
    const num = parseInt(amount.replace(/\D/g, ''), 10);
    if (!num || num < country.minDeposit || num > country.maxDeposit) {
      return toast.error(`Amount must be between ${fmt(country.minDeposit)} and ${fmt(country.maxDeposit)}`);
    }
    if (isMobile && !phone) return toast.error('Phone number required');

    setLoading(true);
    setDepositResult(null);
    try {
      const res = await api.post('/wallet/africa/deposit', {
        country: country.code,
        provider: selected,
        amount: num,
        phone: isMobile ? phone.replace(/\D/g, '') : undefined,
        currency: country.currency,
      });

      const data = res.data.data ?? {};
      setDepositResult(data);

      if (data.paymentUrl || data.waveLaunchUrl) {
        window.open(data.paymentUrl ?? data.waveLaunchUrl, '_blank');
        toast.success('Redirecting to payment…');
      } else if (data.checkoutRequestId || data.message) {
        toast.success(data.message ?? 'Payment request sent to your phone!');
      } else {
        toast.success('Deposit initiated');
      }
      setAmount(''); setPhone('');
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Deposit failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="bg-gradient-to-br from-[#00b15c]/20 to-[#00963d]/10 border border-[#00b15c]/30 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Available Balance</p>
              {balLoading ? (
                <div className="w-36 h-8 bg-white/10 rounded animate-pulse" />
              ) : (
                <p className="text-white font-bold text-3xl">{fmt(balance ?? 0)}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">{user?.email}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="w-12 h-12 rounded-xl bg-[#00b15c] flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#00b15c]">
                <Shield className="w-3 h-3" /> Secure · SSL
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 text-xs text-gray-300">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Unified wallet
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 text-xs text-gray-300">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> All markets
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 text-xs text-gray-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Fast payouts
            </div>
          </div>
        </div>

        {/* Payment methods */}
        {country && (
          <div className="space-y-3 mb-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Choose deposit method</p>

            {country.providers.map(p => {
              const Icon = PROVIDER_ICONS[p.type] ?? Smartphone;
              const color = PROVIDER_COLORS[p.id] ?? '#00b15c';
              const isSelected = selected === p.id;

              return (
                <button
                  key={p.id}
                  onClick={() => { setSelected(isSelected ? null : p.id); setDepositResult(null); }}
                  className={`w-full text-left rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-[#00b15c]/60 bg-[#00b15c]/5'
                      : 'border-[#1f2d3d] bg-[#111827] hover:border-[#1f2d3d]/80 hover:bg-[#1a2535]'
                  }`}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-sm font-semibold">{p.name}</span>
                        {p.priority === 1 && <span className="text-[10px] bg-[#00b15c] text-white px-1.5 py-0.5 rounded font-bold">Popular</span>}
                      </div>
                      <p className="text-gray-500 text-xs">{p.processingTime}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] px-2 py-0.5 rounded-full border font-medium bg-green-500/10 text-green-400 border-green-500/20">
                        {p.processingTime}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded form */}
                  {isSelected && (
                    <div className="px-5 pb-5 border-t border-[#1f2d3d] pt-4" onClick={e => e.stopPropagation()}>

                      {/* Deposit result */}
                      {depositResult && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-4 text-xs text-blue-300">
                          <p className="font-semibold mb-1">Payment initiated</p>
                          {depositResult.checkoutRequestId && <p>Ref: {depositResult.checkoutRequestId}</p>}
                          {depositResult.message && <p>{depositResult.message}</p>}
                          {(depositResult.paymentUrl || depositResult.waveLaunchUrl) && (
                            <a href={depositResult.paymentUrl ?? depositResult.waveLaunchUrl} target="_blank" rel="noreferrer"
                              className="text-blue-400 underline">Open payment page</a>
                          )}
                        </div>
                      )}

                      {/* Crypto address */}
                      {isCrypto && (
                        <div className="bg-[#0d1520] rounded-xl p-4 mb-4">
                          <p className="text-gray-400 text-xs font-medium mb-2">USDT Deposit Address (TRC-20)</p>
                          <div className="flex items-center gap-2 bg-[#111827] rounded-lg px-3 py-2.5">
                            <code className="text-white text-xs font-mono flex-1 break-all">{CRYPTO_ADDRESS}</code>
                            <button onClick={() => copyAddress(CRYPTO_ADDRESS)} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
                              {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-yellow-400 text-xs mt-2">Only send USDT (TRC-20 or BEP-20). Other tokens will be lost.</p>
                        </div>
                      )}

                      {/* Phone input for mobile money */}
                      {isMobile && (
                        <div className="mb-3">
                          <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">
                            Phone Number ({country.dialCode})
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder={`${country.dialCode} XXX XXX XXXX`}
                            className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-xl text-white text-sm px-4 py-3 focus:outline-none focus:border-[#00b15c]/50 placeholder:text-gray-600"
                          />
                        </div>
                      )}

                      {/* Amount */}
                      {!isCrypto && (
                        <>
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
                                min={country.minDeposit}
                                max={country.maxDeposit}
                                className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-xl text-white text-sm pl-12 pr-4 py-3 focus:outline-none focus:border-[#00b15c]/50 placeholder:text-gray-600"
                              />
                            </div>
                            <p className="text-gray-600 text-xs mt-1">
                              Min: {fmt(country.minDeposit)} · Max: {fmt(country.maxDeposit)}
                            </p>
                          </div>

                          {/* Quick amounts */}
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {country.quickAmounts.map(q => (
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
                            onClick={handleDeposit}
                            disabled={loading || !amount || (isMobile && !phone)}
                            className="w-full bg-[#00b15c] hover:bg-[#00963d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            {loading
                              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Processing…</>
                              : <><Zap className="w-4 h-4" /> Deposit {amount ? fmt(parseInt(amount || '0')) : ''}</>
                            }
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Recent history */}
        {history.length > 0 && (
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1f2d3d] flex items-center gap-2">
              <History className="w-4 h-4 text-gray-400" />
              <h3 className="text-white font-semibold text-sm">Recent Deposits</h3>
            </div>
            {history.map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-[#1f2d3d]/50 last:border-0">
                <div>
                  <p className="text-white text-xs font-medium">{t.description?.slice(0, 40) ?? 'Deposit'}</p>
                  <p className="text-gray-500 text-[10px]">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold text-sm">+{Number(t.amount).toLocaleString()}</p>
                  <span className={`text-[10px] ${t.status === 'COMPLETED' ? 'text-green-400' : t.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'}`}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trust footer */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> 256-bit SSL</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Licensed</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Instant deposits</span>
          </div>
          <BetFuzLogo size="sm" />
        </div>

      </div>
    </div>
  );
}

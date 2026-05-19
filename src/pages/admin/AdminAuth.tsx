import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Zap, Lock, Mail, AlertCircle } from 'lucide-react';

export default function AdminAuth() {
  const navigate = useNavigate();
  const { login, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const role = user?.role?.toLowerCase();
    if (user && (role === 'admin' || role === 'superadmin' || role === 'super_admin')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      const fresh = useAuthStore.getState().user;
      const role  = fresh?.role?.toLowerCase();
      if (!fresh || (role !== 'admin' && role !== 'superadmin' && role !== 'super_admin')) {
        useAuthStore.getState().logout();
        setError('Access denied — admin privileges required.');
        return;
      }
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1520] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#00b15c] flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">BetFuz</p>
            <p className="text-[#00b15c] text-xs font-semibold tracking-widest uppercase">Admin Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl p-8">
          <h2 className="text-white font-bold text-xl mb-1">Sign In</h2>
          <p className="text-gray-500 text-sm mb-6">Restricted to authorized administrators</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="admin@betfuz.com"
                  className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#00b15c]/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg pl-10 pr-10 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#00b15c]/50 transition-colors"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00b15c] hover:bg-[#00963f] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</>
              ) : 'Access Admin Portal'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          Unauthorized access attempts are logged and prosecuted.
        </p>
      </div>
    </div>
  );
}

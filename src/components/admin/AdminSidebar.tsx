import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, Users, Activity, Calendar, DollarSign,
  ShieldCheck, Brain, ClipboardList, Settings, LogOut, Zap, Workflow, Sparkles,
  BarChart2, Gift, HeartHandshake, Key, Wallet, Trophy,
} from 'lucide-react';

const NAV = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users',      icon: Users,           label: 'Users' },
  { to: '/admin/bets',       icon: Activity,        label: 'Bets' },
  { to: '/admin/events',     icon: Calendar,        label: 'Events & Odds' },
  { to: '/admin/finances',   icon: DollarSign,      label: 'Finances' },
  { to: '/admin/payments',   icon: Wallet,          label: 'Payments' },
  { to: '/admin/kyc',        icon: ShieldCheck,     label: 'KYC & Compliance' },
  { to: '/admin/reports',    icon: BarChart2,       label: 'Reports' },
  { to: '/admin/bonus',      icon: Gift,            label: 'Bonus Manager' },
  { to: '/admin/rg',         icon: HeartHandshake,  label: 'Resp. Gambling' },
  { to: '/admin/ai-control', icon: Brain,     label: 'AI Control' },
  { to: '/admin/jackpot',    icon: Trophy,    label: 'Jackpot' },
  { to: '/admin/ai',         icon: Sparkles,  label: 'AI Center' },
  { to: '/admin/workflows',  icon: Workflow,        label: 'Automations' },
  { to: '/admin/audit',      icon: ClipboardList,   label: 'Audit Log' },
  { to: '/admin/credentials',icon: Key,             label: 'Credentials' },
  { to: '/admin/settings',   icon: Settings,        label: 'Settings' },
];

export const AdminSidebar = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-[#111827] border-r border-[#1f2d3d] min-h-screen">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-[#1f2d3d]">
        <div className="w-8 h-8 rounded-lg bg-[#00b15c] flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-base leading-none">BetFuz</span>
          <span className="block text-[10px] text-[#00b15c] font-semibold tracking-widest uppercase mt-0.5">Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#00b15c]/10 text-[#00b15c] border border-[#00b15c]/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-[#1f2d3d] space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-[#00b15c]/20 flex items-center justify-center">
            <span className="text-[#00b15c] text-xs font-bold">
              {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.firstName ?? user?.email}</p>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

import { Link } from "react-router-dom";

const PROMOS = [
  { label: "300% Bonus", sub: "New users only", url: "/promotions/welcome", color: "from-emerald-500 to-teal-600", emoji: "🎁" },
  { label: "Refer & Earn", sub: "₦500 per friend", url: "/promotions", color: "from-blue-500 to-indigo-600", emoji: "👥" },
  { label: "Cashback 10%", sub: "On all losses", url: "/promotions", color: "from-purple-500 to-violet-600", emoji: "💰" },
  { label: "Free Bet", sub: "₦1,000 free bet", url: "/promotions", color: "from-orange-500 to-red-600", emoji: "🆓" },
];

export const PromoStripBanner = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
    {PROMOS.map(p => (
      <Link
        key={p.label}
        to={p.url}
        className={`bg-gradient-to-r ${p.color} rounded-xl p-3 flex items-center gap-2.5 hover:opacity-90 transition-opacity`}
      >
        <span className="text-xl flex-shrink-0">{p.emoji}</span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-white leading-tight">{p.label}</p>
          <p className="text-[10px] text-white/80 leading-tight truncate">{p.sub}</p>
        </div>
      </Link>
    ))}
  </div>
);

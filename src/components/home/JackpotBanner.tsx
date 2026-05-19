import { Link } from "react-router-dom";
import { Trophy, ChevronRight, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const JACKPOT_BASE = 10_000_000;

export const JackpotBanner = () => {
  const [amount, setAmount] = useState(JACKPOT_BASE);

  // Simulate jackpot growing in real-time
  useEffect(() => {
    const tick = setInterval(() => {
      setAmount(a => a + Math.floor(Math.random() * 500 + 100));
    }, 3000);
    return () => clearInterval(tick);
  }, []);

  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <Link
      to="/jackpot"
      className="block relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-4 mb-4 hover:opacity-95 transition-opacity"
    >
      {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Zap className="w-3 h-3 text-yellow-200" />
              <span className="text-[11px] font-bold text-yellow-100 uppercase tracking-wide">FuzJackpot — Live</span>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-white leading-none">{formatted}</p>
            <p className="text-xs text-yellow-100 mt-0.5">Growing every second • Win it all tonight</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <span className="bg-white text-orange-600 font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
            Play Now <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
};

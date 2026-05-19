import { Brain, Loader2, Sparkles } from 'lucide-react';
import { AIPick } from '@/lib/api/jackpot';

interface Props {
  onRequest: () => void;
  loading: boolean;
  picks: AIPick[];
}

export function JackpotAIPicks({ onRequest, loading, picks }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Brain className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <div className="text-sm font-semibold text-purple-300 flex items-center gap-1.5">
            AI Suggest
            {picks.length > 0 && (
              <span className="text-[10px] bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded-full">
                {picks.length} filled
              </span>
            )}
          </div>
          <div className="text-[10px] text-gray-500">Claude analyses form, H2H, odds &amp; injuries</div>
        </div>
      </div>
      <button
        onClick={onRequest}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all"
      >
        {loading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Sparkles className="w-3.5 h-3.5" />}
        {loading ? 'Analysing…' : picks.length > 0 ? 'Refresh' : 'Get Picks'}
      </button>
    </div>
  );
}

import { AlertCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { JackpotMatch } from '@/lib/api/jackpot';

type Pick = 'HOME' | 'DRAW' | 'AWAY';

interface Props {
  match: JackpotMatch;
  pick?: Pick;
  onPick: (pick: Pick) => void;
  aiConfidence?: number;
  aiReason?: string;
  aiPick?: Pick;
  result?: Pick;
}

function FormBadge({ result }: { result: string }) {
  const cls =
    result === 'W' ? 'bg-[#00b15c] text-white' :
    result === 'D' ? 'bg-yellow-500 text-black' :
    'bg-red-500 text-white';
  return (
    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${cls}`}>
      {result}
    </span>
  );
}

function OddsArrow({ current, open }: { current?: number; open?: number }) {
  if (!current || !open) return null;
  if (current > open + 0.05) return <TrendingDown className="w-3 h-3 text-red-400" />;
  if (current < open - 0.05) return <TrendingUp className="w-3 h-3 text-[#00b15c]" />;
  return <Minus className="w-3 h-3 text-gray-500" />;
}

export function JackpotMatchCard({ match, pick, onPick, aiConfidence, aiReason, aiPick, result }: Props) {
  const stats = match.statsSnapshot;
  const homeFormArr = stats.homeForm ? stats.homeForm.split('') : [];
  const awayFormArr = stats.awayForm ? stats.awayForm.split('') : [];
  const h2hTotal = (stats.h2hHome ?? 0) + (stats.h2hDraw ?? 0) + (stats.h2hAway ?? 0);
  const homeW  = h2hTotal > 0 ? ((stats.h2hHome ?? 0) / h2hTotal) * 100 : 33;
  const drawW  = h2hTotal > 0 ? ((stats.h2hDraw ?? 0) / h2hTotal) * 100 : 34;
  const awayW  = h2hTotal > 0 ? ((stats.h2hAway ?? 0) / h2hTotal) * 100 : 33;

  const BUTTONS: { label: string; value: Pick; odds?: number }[] = [
    { label: '1', value: 'HOME', odds: match.homeOdds },
    { label: 'X', value: 'DRAW', odds: match.drawOdds },
    { label: '2', value: 'AWAY', odds: match.awayOdds },
  ];

  return (
    <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm truncate">
            {match.homeTeam} <span className="text-gray-500">vs</span> {match.awayTeam}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {match.league} · {new Date(match.kickoffAt).toLocaleString('en-GB', {
              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {stats.injuries && <AlertCircle className="w-4 h-4 text-red-400" title={stats.injuries} />}
          {result && (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#00b15c]/20 text-[#00b15c]">
              {result === 'HOME' ? match.homeTeam : result === 'AWAY' ? match.awayTeam : 'DRAW'}
            </span>
          )}
        </div>
      </div>

      {/* Form guides */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="text-[9px] text-gray-500 mb-1 uppercase tracking-wide">{match.homeTeam} form</div>
          <div className="flex gap-1">{homeFormArr.map((r, i) => <FormBadge key={i} result={r} />)}</div>
          {stats.homeGoalsFor !== undefined && (
            <div className="text-[9px] text-gray-600 mt-1">
              {stats.homeGoalsFor?.toFixed(1)} scored · {stats.homeGoalsAgainst?.toFixed(1)} conceded
            </div>
          )}
        </div>
        <div className="flex-1 text-right">
          <div className="text-[9px] text-gray-500 mb-1 uppercase tracking-wide">{match.awayTeam} form</div>
          <div className="flex gap-1 justify-end">{awayFormArr.map((r, i) => <FormBadge key={i} result={r} />)}</div>
          {stats.awayGoalsFor !== undefined && (
            <div className="text-[9px] text-gray-600 mt-1">
              {stats.awayGoalsFor?.toFixed(1)} scored · {stats.awayGoalsAgainst?.toFixed(1)} conceded
            </div>
          )}
        </div>
      </div>

      {/* H2H bar */}
      {h2hTotal > 0 && (
        <div>
          <div className="text-[9px] text-gray-500 mb-1 uppercase tracking-wide">H2H last {h2hTotal} meetings</div>
          <div className="flex h-2 rounded-full overflow-hidden gap-px">
            <div className="bg-[#00b15c] transition-all" style={{ width: `${homeW}%` }} />
            <div className="bg-yellow-500 transition-all" style={{ width: `${drawW}%` }} />
            <div className="bg-red-500 transition-all" style={{ width: `${awayW}%` }} />
          </div>
          <div className="flex justify-between text-[9px] text-gray-500 mt-0.5">
            <span className="text-[#00b15c]">{Math.round(homeW)}%</span>
            <span className="text-yellow-500">{Math.round(drawW)}%</span>
            <span className="text-red-400">{Math.round(awayW)}%</span>
          </div>
        </div>
      )}

      {/* AI reasoning */}
      {aiReason && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-purple-300 font-semibold">AI Suggestion · {aiConfidence}% confidence</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">{aiReason}</p>
          {aiConfidence !== undefined && (
            <div className="mt-1.5 h-1 bg-[#1f2d3d] rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${aiConfidence}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Pick buttons */}
      <div className="flex gap-2">
        {BUTTONS.map(({ label, value, odds }) => {
          const isSelected = pick === value;
          const isAISuggest = aiPick === value && !pick;
          const isCorrect = !!result && pick === value && result === value;
          const isWrong = !!result && pick === value && result !== value;

          return (
            <button
              key={value}
              onClick={() => !result && onPick(value)}
              disabled={!!result}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isCorrect  ? 'bg-[#00b15c]/20 border-[#00b15c] text-[#00b15c]' :
                isWrong    ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                isSelected ? 'bg-[#00b15c] border-[#00b15c] text-white shadow-lg shadow-[#00b15c]/20' :
                isAISuggest ? 'bg-purple-500/20 border-purple-500/60 text-purple-300' :
                'bg-[#0d1520] border-[#1f2d3d] text-gray-300 hover:border-[#00b15c]/40 hover:text-white'
              }`}
            >
              <span>{label}</span>
              {odds && (
                <span className="flex items-center gap-0.5 text-[9px] mt-0.5 opacity-70">
                  {Number(odds).toFixed(2)}
                  <OddsArrow current={Number(odds)} open={Number(odds)} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

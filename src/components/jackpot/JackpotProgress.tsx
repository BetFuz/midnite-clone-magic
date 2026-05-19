import { Loader2 } from 'lucide-react';

interface Props {
  picked: number;
  total: number;
  entryFee: number;
  onSubmit: () => void;
  submitting: boolean;
}

export function JackpotProgress({ picked, total, entryFee, onSubmit, submitting }: Props) {
  const pct = total > 0 ? (picked / total) * 100 : 0;
  const allPicked = picked === total;

  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 bg-[#0d1520]/95 backdrop-blur-sm border-t border-[#1f2d3d] px-4 py-3">
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-400">{picked} / {total} picked</span>
            <span className={allPicked ? 'text-[#00b15c] font-semibold' : 'text-gray-500'}>
              {allPicked ? 'Ready to submit!' : `${total - picked} remaining`}
            </span>
          </div>
          <div className="h-1.5 bg-[#1f2d3d] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, background: allPicked ? '#00b15c' : '#3b82f6' }}
            />
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={!allPicked || submitting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed flex-shrink-0"
          style={{
            background: allPicked ? '#00b15c' : '#1f2d3d',
            color: allPicked ? '#fff' : '#4b5563',
            opacity: !allPicked ? 0.6 : 1,
          }}
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit · ₦{entryFee}
        </button>
      </div>
    </div>
  );
}

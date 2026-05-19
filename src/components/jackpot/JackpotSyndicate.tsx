import { useState } from 'react';
import { Users, Copy, Check, Loader2, Share2 } from 'lucide-react';
import { jackpotApi } from '@/lib/api/jackpot';

interface Props {
  roundId: string;
  entryFee: number;
}

export function JackpotSyndicate({ roundId, entryFee }: Props) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState(2);
  const [shareCode, setShareCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState('');

  const create = async () => {
    setLoading(true);
    setMsg('');
    try {
      const syndicate = await jackpotApi.createSyndicate(roundId, members);
      setShareCode(syndicate.shareCode);
    } catch (e: any) {
      setMsg(e.response?.data?.error ?? e.message);
    }
    setLoading(false);
  };

  const join = async () => {
    if (joinCode.length < 6) return;
    setLoading(true);
    setMsg('');
    try {
      const result = await jackpotApi.joinSyndicate(joinCode.toUpperCase());
      setMsg(result.complete
        ? '🎉 Syndicate complete — entry submitted!'
        : '✅ Joined! Waiting for more members…');
    } catch (e: any) {
      setMsg(e.response?.data?.error ?? e.message);
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    const per = Math.ceil(entryFee / members);
    const text = `Join my FuzJackpot syndicate! Code: ${shareCode} — only ₦${per} per person. Let's win together!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-[#111827] border border-[#1f2d3d] hover:border-[#00b15c]/30 rounded-xl text-sm text-gray-300 transition-all"
      >
        <Users className="w-4 h-4 text-[#00b15c]" />
        <span>Enter with friends (Syndicate)</span>
        <span className="ml-auto text-[10px] text-gray-600">Split ₦{entryFee} entry</span>
      </button>

      {open && (
        <div className="mt-2 bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 space-y-4">
          {!shareCode ? (
            <div>
              <div className="text-sm font-semibold text-white mb-3">Create a syndicate</div>
              <label className="text-xs text-gray-400 block mb-1">Number of members (2–20)</label>
              <input
                type="number" min={2} max={20} value={members}
                onChange={e => setMembers(Math.min(20, Math.max(2, Number(e.target.value))))}
                className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2 text-white text-sm mb-2 focus:outline-none focus:border-[#00b15c]/40"
              />
              <div className="text-xs text-gray-500 mb-3">
                Each person pays ₦{Math.ceil(entryFee / members).toLocaleString()}
              </div>
              <button
                onClick={create}
                disabled={loading}
                className="w-full py-2.5 bg-[#00b15c] hover:bg-[#00b15c]/80 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                Create Syndicate
              </button>
            </div>
          ) : (
            <div>
              <div className="text-sm font-semibold text-white mb-2">Share your code</div>
              <div className="flex items-center gap-2 bg-[#0d1520] border border-[#1f2d3d] rounded-xl px-4 py-3 mb-3">
                <span className="text-3xl font-black text-[#00b15c] tracking-widest flex-1 text-center">{shareCode}</span>
                <button onClick={copy} className="text-gray-400 hover:text-white transition-colors">
                  {copied ? <Check className="w-5 h-5 text-[#00b15c]" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={share}
                className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share on WhatsApp
              </button>
            </div>
          )}

          <div className="border-t border-[#1f2d3d] pt-4">
            <div className="text-sm font-semibold text-white mb-2">Join a syndicate</div>
            <div className="flex gap-2">
              <input
                placeholder="6-digit code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                maxLength={6}
                className="flex-1 bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2 text-white text-sm tracking-widest uppercase focus:outline-none focus:border-[#00b15c]/40"
              />
              <button
                onClick={join}
                disabled={loading || joinCode.length < 6}
                className="px-4 py-2 bg-[#00b15c] hover:bg-[#00b15c]/80 text-white rounded-lg text-sm font-bold disabled:opacity-40 transition-all"
              >
                Join
              </button>
            </div>
          </div>

          {msg && (
            <div className={`text-xs text-center py-2 px-3 rounded-lg ${
              msg.startsWith('🎉') || msg.startsWith('✅')
                ? 'bg-[#00b15c]/10 text-[#00b15c]'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

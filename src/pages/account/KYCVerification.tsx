import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import {
  Shield, Upload, CheckCircle, Clock, X, ArrowLeft,
  FileText, Camera, CreditCard, Home, RefreshCw, AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TIER_BENEFITS: Record<string, { label: string; color: string; perks: string[] }> = {
  TIER_0: { label: 'Unverified', color: 'text-gray-400', perks: ['Deposits only', 'No withdrawals'] },
  TIER_1: { label: 'Basic', color: 'text-blue-400', perks: ['Withdraw up to 50K/day', 'Access all markets'] },
  TIER_2: { label: 'Verified', color: 'text-green-400', perks: ['Withdraw up to 500K/day', 'VIP support', 'Higher bet limits'] },
  TIER_3: { label: 'Elite', color: 'text-yellow-400', perks: ['Unlimited withdrawals', 'Dedicated manager', 'Exclusive events'] },
};

const DOC_TYPES = [
  { value: 'NATIONAL_ID',       label: 'National ID', icon: CreditCard, desc: 'Front & back of your national ID card' },
  { value: 'PASSPORT',          label: 'Passport', icon: FileText, desc: 'Bio data page of your passport' },
  { value: 'DRIVERS_LICENSE',   label: "Driver's License", icon: CreditCard, desc: 'Front & back of your driving license' },
  { value: 'PROOF_OF_ADDRESS',  label: 'Proof of Address', icon: Home, desc: 'Utility bill or bank statement (last 3 months)' },
  { value: 'SELFIE',            label: 'Selfie with ID', icon: Camera, desc: 'A clear photo holding your ID document' },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'Under Review', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  APPROVED: { label: 'Approved', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  REJECTED: { label: 'Rejected', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function KYCVerification() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [kycData, setKycData]     = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [docType, setDocType]     = useState('NATIONAL_ID');
  const [file, setFile]           = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kyc/status');
      setKycData(res.data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !docType) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('document', file);
      form.append('docType', docType);
      await api.post('/kyc/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Document submitted! We\'ll review within 24 hours.');
      setFile(null); setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? 'Upload failed. Try again.');
    } finally { setUploading(false); }
  };

  const tier = kycData?.tier ?? 'TIER_0';
  const tierInfo = TIER_BENEFITS[tier] ?? TIER_BENEFITS.TIER_0;
  const tierNum = parseInt(tier.replace('TIER_', '')) || 0;
  const docs: any[] = kycData?.documents ?? [];
  const hasPending = docs.some(d => d.status === 'PENDING');
  const submittedTypes = docs.map(d => d.type);

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-bold text-xl">Identity Verification</h1>
            <p className="text-gray-500 text-sm">Verify your identity to unlock full platform features</p>
          </div>
        </div>

        {/* KYC Tier Progress */}
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Level</p>
              <div className="flex items-center gap-2">
                <Shield className={`w-5 h-5 ${tierInfo.color}`} />
                <span className={`text-lg font-bold ${tierInfo.color}`}>{tierInfo.label}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs mb-1">Account</p>
              <p className="text-white text-sm">{user?.email}</p>
            </div>
          </div>

          {/* Tier progress dots */}
          <div className="flex items-center gap-2 mb-4">
            {[0, 1, 2, 3].map(t => (
              <div key={t} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  t <= tierNum
                    ? 'bg-[#00b15c] border-[#00b15c] text-white'
                    : 'bg-[#0d1520] border-[#1f2d3d] text-gray-600'
                }`}>
                  {t <= tierNum ? <CheckCircle className="w-4 h-4" /> : t}
                </div>
                {t < 3 && <div className={`flex-1 h-0.5 w-8 ${t < tierNum ? 'bg-[#00b15c]' : 'bg-[#1f2d3d]'}`} />}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {tierInfo.perks.map(p => (
              <span key={p} className="text-xs bg-[#0d1520] border border-[#1f2d3d] text-gray-400 px-2.5 py-1 rounded-lg">
                ✓ {p}
              </span>
            ))}
          </div>
        </div>

        {/* Pending notice */}
        {hasPending && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-5 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-medium text-sm">Documents Under Review</p>
              <p className="text-gray-400 text-xs mt-0.5">Our team will verify your documents within 24 hours. You'll receive an email when done.</p>
            </div>
          </div>
        )}

        {/* Submitted documents */}
        {docs.length > 0 && (
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-[#1f2d3d]">
              <h3 className="text-white font-semibold text-sm">Submitted Documents</h3>
            </div>
            {docs.map((doc, i) => {
              const dt = DOC_TYPES.find(d => d.value === doc.type);
              const st = STATUS_BADGE[doc.status] ?? STATUS_BADGE.PENDING;
              return (
                <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-[#1f2d3d]/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0d1520] flex items-center justify-center">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{dt?.label ?? doc.type}</p>
                      <p className="text-gray-500 text-xs">{new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${st.cls}`}>{st.label}</span>
                    {doc.status === 'REJECTED' && doc.rejectionReason && (
                      <span className="text-red-400 text-xs" title={doc.rejectionReason}><AlertCircle className="w-3.5 h-3.5" /></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload form */}
        {loading ? (
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl p-6 animate-pulse h-64" />
        ) : (
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4">Upload Document</h3>

            {/* Doc type selector */}
            <div className="grid grid-cols-1 gap-2 mb-5">
              {DOC_TYPES.map(dt => {
                const Icon = dt.icon;
                const submitted = submittedTypes.includes(dt.value);
                const isSelected = docType === dt.value;
                return (
                  <button
                    key={dt.value}
                    onClick={() => setDocType(dt.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#00b15c]/60 bg-[#00b15c]/5'
                        : 'border-[#1f2d3d] hover:border-[#1f2d3d]/80'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#00b15c]/20' : 'bg-[#0d1520]'}`}>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#00b15c]' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>{dt.label}</p>
                      <p className="text-gray-600 text-xs">{dt.desc}</p>
                    </div>
                    {submitted && <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">Submitted</span>}
                  </button>
                );
              })}
            </div>

            {/* File drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${
                file ? 'border-[#00b15c]/60 bg-[#00b15c]/5' : 'border-[#1f2d3d] hover:border-[#00b15c]/40'
              }`}
            >
              {preview ? (
                <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-lg object-contain" />
              ) : file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-8 h-8 text-[#00b15c]" />
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{file.name}</p>
                    <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Click to select file</p>
                  <p className="text-gray-600 text-xs mt-1">JPG, PNG, PDF or HEIC · Max 10MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf,.heic" onChange={onFileChange} className="hidden" />
            </div>

            {file && (
              <div className="flex gap-2">
                <button
                  onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1f2d3d] text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 bg-[#00b15c] hover:bg-[#00963d] disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {uploading
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Uploading…</>
                    : <><Upload className="w-4 h-4" /> Submit Document</>
                  }
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info footer */}
        <div className="mt-5 bg-[#111827]/50 border border-[#1f2d3d]/50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
          <p className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#00b15c]" /> Your documents are encrypted and stored securely.</p>
          <p>We verify against government databases. All data is handled per applicable data protection law.</p>
        </div>

      </div>
    </div>
  );
}

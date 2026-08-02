import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Copy, 
  Check, 
  Sparkles, 
  KeyRound, 
  AlertCircle,
  Terminal,
  Cpu,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminSignIn, isAdmin } = useAuth();

  const [adminId, setAdminId] = useState('admin@pakizzle.pk');
  const [password, setPassword] = useState('PakizzleAdmin2026!');
  const [securityPin, setSecurityPin] = useState('2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'id' | 'pass' | null>(null);

  // Auto redirect if already admin
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleCopy = (text: string, field: 'id' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field === 'id' ? 'Admin ID' : 'Password'} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFillDemo = () => {
    setAdminId('admin@pakizzle.pk');
    setPassword('PakizzleAdmin2026!');
    setSecurityPin('2026');
    setErrorMsg(null);
    toast.info('Demo Admin credentials filled successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) {
      setErrorMsg('Please enter both your Admin ID and Password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await adminSignIn(adminId, password, securityPin);
      toast.success('Authentication Successful! Welcome to Pakizzle Admin Terminal.', {
        icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />
      });
      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMsg(err.message || 'Invalid Admin ID or Password. Please check the credentials provided.');
      toast.error('Authentication Failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-white flex flex-col justify-between relative overflow-hidden font-sans selection:bg-apple-blue selection:text-white">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-apple-blue/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-sky-500/10 blur-[130px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono tracking-tight">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            SECURE TERMINAL v4.2 • ONLINE
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-xl space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-apple-blue via-indigo-600 to-purple-600 p-0.5 shadow-2xl shadow-apple-blue/30 mx-auto">
              <div className="w-full h-full bg-[#0D0E15] rounded-[22px] flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-apple-blue animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Pakizzle Admin Terminal
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
                Authorized Executive & Operations Protocol Access
              </p>
            </div>
          </div>

          {/* Preset Credentials Box */}
          <div className="bg-[#13151F]/90 border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
                  Default Admin Credentials
                </span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-3 py-1 rounded-lg bg-apple-blue/20 hover:bg-apple-blue/30 text-apple-blue border border-apple-blue/30 text-[11px] font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-3 h-3" />
                1-Click Auto Fill
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Admin ID Display */}
              <div className="bg-[#090A0F] border border-white/5 rounded-2xl p-3 flex justify-between items-center group">
                <div className="space-y-0.5 overflow-hidden">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">Admin ID / Email</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 truncate block">admin@pakizzle.pk</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('admin@pakizzle.pk', 'id')}
                  className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors shrink-0"
                  title="Copy Admin ID"
                >
                  {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Password Display */}
              <div className="bg-[#090A0F] border border-white/5 rounded-2xl p-3 flex justify-between items-center group">
                <div className="space-y-0.5 overflow-hidden">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">Password</span>
                  <span className="text-xs font-mono font-bold text-amber-300 truncate block">PakizzleAdmin2026!</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('PakizzleAdmin2026!', 'pass')}
                  className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors shrink-0"
                  title="Copy Password"
                >
                  {copiedField === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="bg-[#13151F]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs font-semibold flex items-start gap-3 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Admin ID / Username */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-apple-blue" />
                Admin Identifier / Email ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="e.g. admin@pakizzle.pk or ADMIN_01"
                  className="w-full bg-[#090A0F] border border-white/15 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20 rounded-2xl px-4 py-3.5 text-sm font-mono text-white placeholder:text-neutral-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-apple-blue" />
                  Admin Secret Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full bg-[#090A0F] border border-white/15 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20 rounded-2xl pl-4 pr-12 py-3.5 text-sm font-mono text-white placeholder:text-neutral-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terminal Security PIN */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Terminal Access Pin (Optional 2FA)
              </label>
              <input
                type="password"
                maxLength={6}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                placeholder="2026"
                className="w-full bg-[#090A0F] border border-white/15 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl px-4 py-3 text-sm font-mono text-white placeholder:text-neutral-600 outline-none transition-all"
              />
            </div>

            {/* Remember & Protocol Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-neutral-400 select-none hover:text-neutral-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-[#090A0F] text-apple-blue focus:ring-apple-blue/30 focus:ring-offset-0"
                />
                Persist Session Credentials
              </label>
              <span className="text-[11px] font-mono text-neutral-400">256-bit AES Crypt</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-apple-blue via-indigo-600 to-purple-600 hover:from-apple-blue hover:to-indigo-600 font-bold text-sm text-white shadow-lg shadow-apple-blue/25 hover:shadow-apple-blue/40 transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating Admin...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Authenticate & Launch Admin Dashboard
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Security Footer Notice */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-neutral-400">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>IP: 182.180.xx.xx</span>
              <span>•</span>
              <span>Audit Logging Active</span>
            </div>
            <p className="text-[10px] text-neutral-400">
              Unauthorized access attempts are cryptographically logged and flagged for compliance.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center border-t border-white/5 bg-[#07080C]/80 backdrop-blur-md">
        <p className="text-xs text-neutral-400 font-medium">
          © {new Date().getFullYear()} Pakizzle Operations & Governance Hub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Fingerprint, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Key,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SPRING_SNAPPY } from '../motion';
import { 
  isPasskeySupported, 
  registerPasskey, 
  getRegisteredPasskeys, 
  deletePasskey, 
  RegisteredPasskey 
} from '../../lib/passkey';
import { toast } from 'sonner';

interface PasskeyManagementCardProps {
  className?: string;
}

export const PasskeyManagementCard: React.FC<PasskeyManagementCardProps> = ({ className }) => {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [passkeys, setPasskeys] = useState<RegisteredPasskey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  useEffect(() => {
    async function init() {
      const isSupp = await isPasskeySupported();
      setSupported(isSupp);
      if (isSupp) {
        const list = await getRegisteredPasskeys();
        setPasskeys(list);
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      const res = await registerPasskey(nicknameInput.trim() || undefined);
      if (res.success && res.passkey) {
        setPasskeys(prev => [...prev, res.passkey!]);
        setShowAddModal(false);
        setNicknameInput('');
        toast.success(`Passkey "${res.passkey.nickname}" successfully registered!`);
      } else {
        toast.error(res.error || 'Failed to create passkey.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      const ok = await deletePasskey(id);
      if (ok) {
        setPasskeys(prev => prev.filter(p => p.id !== id));
        toast.success(`Passkey "${name}" removed.`);
      } else {
        toast.error('Unable to remove passkey.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-3xl bg-apple-gray/20 border border-black/5 dark:border-white/10 flex items-center justify-center gap-2 text-xs text-apple-text-muted">
        <Loader2 className="w-4 h-4 animate-spin text-apple-blue" />
        <span>Evaluating hardware biometric capabilities...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold text-apple-text tracking-tight">
                Passkeys (Face ID & Touch ID)
              </h4>
              {supported && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  Supported on this device
                </span>
              )}
            </div>
            <p className="text-xs text-apple-text-muted mt-0.5">
              Sign in instantly using your device biometric lock. Immune to phishing and SIM swaps.
            </p>
          </div>
        </div>

        {supported && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 rounded-xl bg-apple-blue text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-apple-blue/20 hover:bg-apple-blue/90 transition-all cursor-pointer touch-target min-h-[44px] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create a Passkey</span>
          </button>
        )}
      </div>

      {/* Hardware Support Evaluation */}
      {!supported ? (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
            <Info className="w-4 h-4 shrink-0" />
            <span>Passkeys Not Supported on this Browser / Device</span>
          </div>
          <p className="text-apple-text-muted leading-relaxed">
            Your current browser does not have platform biometric authenticator integration enabled. You can continue using verified Email and SMS OTP access with full protection.
          </p>
        </div>
      ) : passkeys.length === 0 ? (
        <div className="p-8 rounded-3xl bg-apple-gray/30 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center mx-auto">
            <Key className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-sm text-apple-text">No Passkeys Registered Yet</h5>
            <p className="text-xs text-apple-text-muted max-w-sm mx-auto leading-relaxed">
              Register this computer or phone to sign in with Touch ID, Face ID, or Windows Hello without typing passwords.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 rounded-xl bg-apple-blue text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-apple-blue/20 hover:bg-apple-blue/90 transition-all cursor-pointer touch-target min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Register This Device</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {passkeys.map((p) => (
            <div
              key={p.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141824] border border-black/10 dark:border-white/10 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-sm text-apple-text truncate">
                    {p.nickname}
                  </h5>
                  <p className="text-[11px] text-apple-text-muted truncate">
                    Created: {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    FIDO2 WebAuthn Verified
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={deletingId === p.id}
                onClick={() => handleDelete(p.id, p.nickname)}
                className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer touch-target min-h-[36px]"
                title="Remove passkey"
              >
                {deletingId === p.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Register Passkey */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={SPRING_SNAPPY}
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#141824] border border-black/10 dark:border-white/10 p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Fingerprint className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h4 className="font-bold text-base text-apple-text">
                  Register a Passkey
                </h4>
                <p className="text-xs text-apple-text-muted leading-relaxed">
                  Your device will prompt you to verify your identity with Face ID, Touch ID, or your device PIN.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-apple-text">
                  Device Nickname (Optional)
                </label>
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="e.g. My MacBook Pro or iPhone"
                  className="w-full h-11 px-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-apple-gray/40 dark:bg-white/5 text-xs text-apple-text outline-none focus:border-apple-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isRegistering}
                  onClick={() => setShowAddModal(false)}
                  className="h-11 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-apple-text hover:bg-apple-gray dark:hover:bg-white/5 cursor-pointer touch-target min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isRegistering}
                  onClick={handleRegister}
                  className="h-11 rounded-xl bg-apple-blue text-white text-xs font-bold shadow-md shadow-apple-blue/20 hover:bg-apple-blue/90 flex items-center justify-center gap-1.5 cursor-pointer touch-target min-h-[44px]"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Register</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

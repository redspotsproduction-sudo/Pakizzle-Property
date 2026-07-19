import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Phone, 
  ShieldCheck, 
  Loader2, 
  ArrowRight, 
  RefreshCw, 
  X,
  CheckCircle2,
  AlertCircle,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface ContactVerificationProps {
  type: 'email' | 'phone';
  onClose: () => void;
  onSuccess: () => void;
}

const COUNTRY_CODES = [
  { code: '+92', country: 'PK', name: 'Pakistan' },
  { code: '+971', country: 'AE', name: 'UAE' },
  { code: '+1', country: 'US', name: 'USA' },
  { code: '+44', country: 'UK', name: 'UK' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia' },
];

export default function ContactVerification({ type, onClose, onSuccess }: ContactVerificationProps) {
  const { sendOtp, verifyOtp, sendPhoneOtp, verifyPhoneOtp, setOtpVerified, setPhoneVerified, profile } = useAuth();
  
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [value, setValue] = useState(type === 'email' ? (profile?.email || '') : (profile?.phone?.replace(/^\+\d+\s?/, '') || ''));
  const [countryCode, setCountryCode] = useState(profile?.phone?.match(/^\+\d+/)?.[0] || '+92');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSend = async () => {
    if (!value) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fullValue = type === 'phone' ? `${countryCode}${value}` : value;
      const code = type === 'email' ? await sendOtp(fullValue) : await sendPhoneOtp(fullValue);
      
      if (code) {
        setDemoCode(code);
        setStep('otp');
        setTimer(60);
      } else {
        setError(`Failed to send verification code to ${type}.`);
      }
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;

    setLoading(true);
    setError(null);
    
    try {
      const fullValue = type === 'phone' ? `${countryCode}${value}` : value;
      const success = type === 'email' 
        ? await verifyOtp(fullValue, code) 
        : await verifyPhoneOtp(fullValue, code);
      
      if (success) {
        if (type === 'email') {
          await setOtpVerified(fullValue);
        } else {
          await setPhoneVerified(fullValue);
        }
        setStep('success');
        setTimeout(onSuccess, 2000);
      } else {
        setError("Invalid or expired verification code.");
      }
    } catch (e: any) {
      setError(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-apple-bg rounded-[40px] shadow-2xl border border-apple-border overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-apple-gray rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-apple-text-muted" />
        </button>

        <div className="p-10 pt-12">
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <div className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl",
                    type === 'email' ? "bg-apple-blue/10 text-apple-blue" : "bg-apple-green/10 text-apple-green"
                  )}>
                    {type === 'email' ? <Mail className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mb-2">
                    {type === 'email' ? 'Update Email' : 'Update Phone'}
                  </h2>
                  <p className="text-apple-text-muted text-sm px-4">
                    Enter your {type} address below. We'll send you a verification code to confirm ownership.
                  </p>
                </div>

                <div className="space-y-4">
                  {type === 'phone' ? (
                    <div className="flex gap-2">
                      <div className="relative shrink-0">
                        <select 
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="apple-input pl-10 pr-8 appearance-none font-bold"
                        >
                          {COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code}>{c.country} ({c.code})</option>
                          ))}
                        </select>
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-muted pointer-events-none" />
                      </div>
                      <input 
                        type="tel"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="300 1234567"
                        className="apple-input flex-1 font-bold text-lg"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-text-muted" />
                      <input 
                        type="email"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="your@email.com"
                        className="apple-input w-full pl-14 font-bold text-lg"
                      />
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-apple-red/10 border border-apple-red/20 rounded-2xl text-apple-red text-xs font-bold animate-shake">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSend}
                  disabled={!value || loading}
                  className={cn(
                    "w-full py-5 rounded-[24px] font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-apple-blue/10",
                    type === 'email' ? "bg-apple-blue text-white" : "bg-apple-green text-white"
                  )}
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      Send Verification Code
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-apple-blue/10 text-apple-blue rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mb-2">Verify it's you</h2>
                  <p className="text-apple-text-muted text-sm px-4 leading-relaxed">
                    We've sent a 6-digit code to <br />
                    <span className="font-black text-apple-text">
                      {type === 'phone' ? `${countryCode} ${value}` : value}
                    </span>
                  </p>
                </div>

                {demoCode && (
                  <div className="p-6 bg-apple-blue/10 border border-apple-blue/20 rounded-3xl text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-apple-blue/60">Demo Instance Code</p>
                    <div className="text-4xl font-black text-apple-blue tracking-[0.2em]">{demoCode}</div>
                  </div>
                )}

                <div className="flex justify-between gap-2 px-2">
                  {otp.map((digit, i) => (
                    <input 
                      key={i}
                      id={`otp-input-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="w-12 h-16 text-center text-2xl font-black bg-apple-card-bg border border-apple-border rounded-2xl focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/10 outline-none transition-all"
                    />
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-apple-red/10 border border-apple-red/20 rounded-2xl text-apple-red text-xs font-bold">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    onClick={handleVerify}
                    disabled={otp.some(d => !d) || loading}
                    className="w-full py-5 bg-apple-text text-apple-bg rounded-[24px] font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Connect"}
                  </button>

                  <div className="flex justify-center">
                    <button
                      onClick={handleSend}
                      disabled={timer > 0 || loading}
                      className="text-xs font-bold text-apple-blue disabled:text-apple-text-muted transition-colors flex items-center gap-1.5"
                    >
                      {timer > 0 ? (
                        <>Resend code in {timer}s</>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          Resend Code
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => setStep('input')}
                    className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted hover:text-apple-text transition-colors"
                  >
                    Change {type === 'email' ? 'Email' : 'Phone'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-6"
              >
                <div className="relative inline-block">
                  <div className={cn(
                    "absolute inset-0 blur-[60px] rounded-full animate-pulse opacity-40",
                    type === 'email' ? "bg-apple-blue" : "bg-apple-green"
                  )} />
                  <div className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center mx-auto relative z-10 shadow-2xl animate-bounce",
                    type === 'email' ? "bg-apple-blue text-white" : "bg-apple-green text-white"
                  )}>
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-2">Verified</h2>
                  <p className="text-apple-text-muted font-medium">
                    Your {type} has been successfully verified <br /> and connected to your profile.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

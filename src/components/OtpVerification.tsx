import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Loader2, ArrowRight, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface OtpVerificationProps {
  onVerified: () => void;
}

export default function OtpVerification({ onVerified }: OtpVerificationProps) {
  const { user, sendOtp, verifyOtp, setOtpVerified } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  
  const hasSentRef = useRef(false);

  useEffect(() => {
    if (user?.email && !hasSentRef.current) {
      hasSentRef.current = true;
      const lastSent = sessionStorage.getItem(`otp_last_sent_${user.email}`);
      const now = Date.now();
      if (lastSent && now - parseInt(lastSent, 10) < 60000) {
        const elapsed = Math.floor((now - parseInt(lastSent, 10)) / 1000);
        setTimer(60 - elapsed);
        const storedDemoCode = sessionStorage.getItem(`otp_demo_code_${user.email}`);
        if (storedDemoCode) {
          setDemoCode(storedDemoCode);
        }
        return;
      }
      handleSendOtp();
    }
  }, [user?.email]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    if (!user?.email) return;
    setResending(true);
    setError("");
    const code = await sendOtp(user.email);
    if (code) {
      setDemoCode(code);
      setTimer(60);
      sessionStorage.setItem(`otp_last_sent_${user.email}`, Date.now().toString());
      sessionStorage.setItem(`otp_demo_code_${user.email}`, code);
    } else {
      setError("Failed to send OTP. Please try again.");
    }
    setResending(false);
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    const success = await verifyOtp(user?.email || "", code);
    
    if (success) {
      // Clear sessionStorage OTP flags upon successful verification to avoid stale flags
      sessionStorage.removeItem(`otp_last_sent_${user?.email}`);
      sessionStorage.removeItem(`otp_demo_code_${user?.email}`);
      await setOtpVerified();
      onVerified();
    } else {
      setError("Invalid or expired OTP code.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-bg px-6 relative overflow-hidden">
      {/* Decorative ambient background blur lights */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-apple-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel p-8 md:p-12 rounded-[40px] max-w-lg w-full shadow-apple-soft border border-apple-blue/10 text-center relative z-10 backdrop-blur-3xl bg-white/70 dark:bg-[#1C1C1E]/70"
      >
        {/* Pulsing Shield Glow Icon */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 bg-apple-blue/15 rounded-3xl animate-ping opacity-25" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-apple-blue/10 via-purple-500/10 to-transparent rounded-3xl border border-apple-blue/20 flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-10 h-10 text-apple-blue animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold tracking-tight text-apple-text mb-3">
          Identity Access Protocol
        </h2>
        <p className="text-apple-text-muted text-base max-w-sm mx-auto mb-8 font-medium leading-relaxed">
          We have sent an authentication code to verify your session ledger details for: <br />
          <span className="font-bold text-apple-text block mt-1 font-mono text-sm bg-apple-blue/5 border border-apple-blue/10 py-1.5 px-3 rounded-full truncate">{user?.email}</span>
        </p>

        {/* Showroom Verification Ledger (Blueprint Element) */}
        <div className="mb-8 p-4 rounded-3xl border border-apple-blue/15 bg-gradient-to-br from-apple-blue/[0.03] via-purple-500/[0.03] to-transparent shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-apple-blue block leading-none mb-0.5">Showroom Audited</span>
                <span className="text-xs font-bold text-apple-text leading-none">Security Compliance Matrix</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shrink-0">
              <Sparkles className="w-3 h-3" />
              Secured Link
            </div>
          </div>
          
          {demoCode && (
            <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-between font-mono animate-fade-in shadow-sm">
              <span className="uppercase tracking-wider">DEMO BYPASS KEY</span>
              <span className="text-lg tracking-[0.1em] font-black">{demoCode}</span>
            </div>
          )}
        </div>

        {/* OTP Input Fields */}
        <div className="flex justify-center gap-2.5 sm:gap-3 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-16 sm:w-14 sm:h-16 text-center text-3xl font-black font-mono bg-white dark:bg-[#161618] border border-apple-border rounded-2xl focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/10 outline-none transition-all duration-200 shadow-sm"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-apple-orange text-xs font-bold mb-6 bg-apple-orange/10 border border-apple-orange/20 py-2.5 px-4 rounded-2xl inline-flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-apple-orange animate-pulse" />
            {error}
          </motion.div>
        )}

        {/* Submit button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.some(d => !d)}
          className="apple-button-primary w-full h-14 flex items-center justify-center gap-2 mb-6 disabled:opacity-40 disabled:cursor-not-allowed text-base font-bold shadow-apple-soft transition-all"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Confirm Credentials
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Resend Actions */}
        <div className="text-sm border-t border-apple-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-apple-text-muted font-medium">Didn't receive the credentials?</span>
          <button
            onClick={handleSendOtp}
            disabled={timer > 0 || resending}
            className="text-apple-blue font-extrabold text-xs uppercase tracking-wider hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1.5 hover:text-apple-blue/80 transition-all shrink-0"
          >
            {resending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : timer > 0 ? (
              `Retry in ${timer}s`
            ) : (
              "Request New Code"
            )}
          </button>
        </div>

        {/* Cancel */}
        <button
          onClick={() => window.location.href = "/"}
          className="mt-10 text-[10px] font-black text-apple-text-muted uppercase tracking-widest hover:text-apple-text transition-colors border border-apple-border/30 py-2.5 px-6 rounded-full bg-white/40 dark:bg-white/5 shadow-sm"
        >
          Cancel & Terminate Handshake
        </button>
      </motion.div>
    </div>
  );
}


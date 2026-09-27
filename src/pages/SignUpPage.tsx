import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ChevronLeft, ShieldCheck } from 'lucide-react';
import { SignUpCard } from '../components/Auth/SignUpCard';
import { SPRING_SNAPPY } from '../components/motion';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-apple-bg relative flex flex-col justify-between overflow-x-hidden selection:bg-apple-blue selection:text-white">
      {/* Subtle branded background with blurred property architectural ambiance */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 filter blur-3xl opacity-15 dark:opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-apple-bg/80 via-apple-bg/95 to-apple-bg" />
      </div>

      {/* Top minimal bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 group transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-md shadow-[#0F766E]/20 group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-apple-text">
            Pakizzle<span className="text-[#0F766E] dark:text-teal-400">Property</span>
          </span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-bold text-apple-text-muted hover:text-apple-text px-3 py-1.5 rounded-full hover:bg-apple-gray dark:hover:bg-white/5 transition-colors touch-target min-h-[36px]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Center content across breakpoints */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[440px]">
          <SignUpCard
            onSuccess={() => navigate('/dashboard')}
            onSwitchToSignIn={() => navigate('/login')}
          />
        </div>
      </main>

      {/* Footer reassurance notes */}
      <footer 
        className="w-full max-w-md mx-auto px-4 pb-6 text-center text-apple-text-muted text-[11px] space-y-1"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>256-Bit SSL Encrypted Verification • LDA & CDA Validated</span>
        </div>
        <p className="text-[10px] text-apple-text-muted/70">
          © {new Date().getFullYear()} Pakizzle Property Network. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default SignUpPage;

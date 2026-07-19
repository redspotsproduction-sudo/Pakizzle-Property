import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  Car, 
  ChevronDown,
  Activity,
  ArrowRight
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import CarInsuranceCalculator from './CarInsuranceCalculator';

export default function CarInsurancePage() {
  return (
    <div className="min-h-screen bg-apple-bg selection:bg-apple-blue/20">
      <Header />
      
      <main className="pt-6 lg:pt-10">
        {/* Main Calculator Entry */}
        <section className="mb-24">
          <CarInsuranceCalculator />
        </section>

        {/* Benefits Section */}
        <section className="py-32 bg-apple-gray dark:bg-apple-card-bg/50 mt-20 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-apple-blue/10 rounded-full blur-[120px] -mr-32 -mt-32" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-apple-green/10 rounded-full blur-[120px] -ml-32 -mb-32" />
           <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
                 <div className="space-y-6 group">
                    <div className="w-14 h-14 bg-apple-blue/10 rounded-2xl flex items-center justify-center text-apple-blue group-hover:scale-110 transition-transform shadow-sm">
                       <Zap className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Instant Issuance</h3>
                    <p className="text-sm text-apple-text-muted font-medium leading-relaxed">Our blockchain-verified policy system issues coverage in exactly 120 seconds, directly from the terminal.</p>
                 </div>

                 <div className="space-y-6 group">
                    <div className="w-14 h-14 bg-apple-green/10 rounded-2xl flex items-center justify-center text-apple-green group-hover:scale-110 transition-transform shadow-sm">
                       <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Zero-Deductible</h3>
                    <p className="text-sm text-apple-text-muted font-medium leading-relaxed">Select providers offer full-loss coverage protocols with zero deductible for qualified luxury assets.</p>
                 </div>

                 <div className="space-y-6 group">
                    <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shadow-sm">
                       <Activity className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Smart Tracking</h3>
                    <p className="text-sm text-apple-text-muted font-medium leading-relaxed">Real-time asset telemetry integrated into your Pakizzle dashboard for 24/7 global position monitoring.</p>
                 </div>

                 <div className="space-y-6 group">
                    <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform shadow-sm">
                       <Car className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Concierge Claims</h3>
                    <p className="text-sm text-apple-text-muted font-medium leading-relaxed">Our elite adjusters handle every aspect of your claim, from vehicle pick-up to full professional restoration.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 max-w-7xl mx-auto px-6">
           <div className="glass-panel p-12 md:p-24 rounded-[64px] bg-apple-blue text-white text-center shadow-apple-soft relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                 <ShieldCheck className="w-[120%] h-[120%] -translate-x-1/4 translate-y-1/4 rotate-12" />
              </div>
              <div className="relative z-10 max-w-3xl mx-auto">
                 <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-10">Protect Your <br />Investment.</h2>
                 <p className="text-xl text-white/80 font-medium mb-12 italic-serif">The most optimized insurance rates in the country, verified by AI, secured for you.</p>
                 <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <button className="bg-white text-apple-blue px-12 py-6 rounded-full font-black text-lg hover:bg-apple-gray transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                       Request Individual Quote
                       <ArrowRight className="w-6 h-6" />
                    </button>
                    <button className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 rounded-full font-black text-lg transition-all active:scale-95">
                       Partner Inquiry
                    </button>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer onValuationClick={() => {}} />
    </div>
  );
}

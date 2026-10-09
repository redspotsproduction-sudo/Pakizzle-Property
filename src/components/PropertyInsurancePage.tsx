import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  ChevronDown,
  Activity,
  ArrowRight,
  Home
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import PropertyInsuranceCalculator from './PropertyInsuranceCalculator';

export default function PropertyInsurancePage() {
  return (
    <div className="min-h-screen bg-apple-bg selection:bg-apple-blue/20">
      <Header />
      
      <main className="pt-6 lg:pt-10">
        {/* Main Calculator Entry */}
        <section className="mb-24">
          <PropertyInsuranceCalculator />
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
                    <p className="text-sm text-apple-text-muted font-medium leading-relaxed">Our verified policy system issues property coverage in 120 seconds, directly from the terminal.</p>
                 </div>

                 <div className="space-y-6 group">
                    <div className="w-14 h-14 bg-apple-green/10 rounded-2xl flex items-center justify-center text-apple-green group-hover:scale-110 transition-transform shadow-sm">
                       <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">A+ Rated Underwriters</h3>
                    <p className="text-sm text-apple-text-muted font-medium leading-relaxed">Backed by Pakistan's tier-1 property underwriters with 99.4% claims settlement performance.</p>
                 </div>

                 <div className="space-y-6 group">
                    <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-sm">
                       <Activity className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Direct Claims</h3>
                    <p className="text-sm text-apple-text-muted font-medium leading-relaxed">Report structural or fire damages directly through your mobile dashboard with immediate assessment.</p>
                 </div>

                 <div className="space-y-6 group">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shadow-sm">
                       <Home className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">All Property Types</h3>
                    <p className="text-sm text-apple-text-muted font-medium leading-relaxed">Comprehensive insurance for residential houses, flats, commercial plazas, shops, and warehouses.</p>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

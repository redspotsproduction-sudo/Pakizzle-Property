import React from "react";
import { motion } from "motion/react";
import { 
  Activity, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Smartphone, 
  Laptop,
  Globe,
  Zap,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const performanceData = [
  { name: 'Mon', views: 2400, inquiries: 400 },
  { name: 'Tue', views: 1398, inquiries: 300 },
  { name: 'Wed', views: 9800, inquiries: 2000 },
  { name: 'Thu', views: 3908, inquiries: 278 },
  { name: 'Fri', views: 4800, inquiries: 189 },
  { name: 'Sat', views: 3800, inquiries: 239 },
  { name: 'Sun', views: 4300, inquiries: 349 },
];

const sectorData = [
  { name: 'Karachi Central', value: 400 },
  { name: 'Lahore DHA', value: 300 },
  { name: 'Islamabad Blue Area', value: 300 },
  { name: 'Faisalabad Industrial', value: 200 },
];

const COLORS = ['var(--chart-primary)', 'var(--chart-secondary)', 'var(--chart-tertiary)', 'var(--chart-quaternary)'];

export default function UserAnalytics() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Activity className="w-3.5 h-3.5" />
            Performance & Analytics
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Performance Velocity
          </h1>
          <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Real-time analytical decryption of your automotive marketplace presence and user conversion funnels.
          </p>
        </div>
      </div>

      {/* Main Performance Chart Card */}
      <section className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-primary)] dark:text-white flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-apple-blue" />
              Inventory Engagement
            </h2>
            <p className="text-[11px] text-[var(--text-secondary)] font-normal mt-0.5">Cross-Sector View Metrics (7-Day Cycle)</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-apple-blue" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Impressions</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-apple-green" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Inquiries</span>
             </div>
          </div>
        </div>

        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-tertiary)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--chart-tertiary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-success)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--chart-success)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-chart-grid)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 600 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px', 
                  border: '1px solid rgba(0,0,0,0.05)', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
                  fontSize: '11px',
                  fontWeight: 600
                }}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="var(--chart-tertiary)" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorViews)" 
              />
              <Area 
                type="monotone" 
                dataKey="inquiries" 
                stroke="var(--chart-success)" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorInquiries)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <section className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                 <Globe className="w-4.5 h-4.5 text-apple-blue" />
              </div>
              <div>
                 <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-primary)] dark:text-white">Geographic Resonance</h2>
                 <p className="text-[10px] text-[var(--text-secondary)] font-normal mt-0.5">Lead Origin Mapping</p>
              </div>
           </div>

           <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={sectorData}
                       cx="50%"
                       cy="50%"
                       innerRadius={45}
                       outerRadius={75}
                       paddingAngle={6}
                       dataKey="value"
                    >
                       {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={6} />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-2 gap-3 mt-4">
              {sectorData.map((sector, i) => (
                 <div key={sector.name} className="flex items-center gap-3 p-3 rounded-xl bg-apple-gray dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                    <div className="min-w-0">
                       <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] truncate">{sector.name}</p>
                       <p className="text-sm font-semibold text-[var(--text-primary)] dark:text-white font-mono mt-0.5">{((sector.value / 1200) * 100).toFixed(0)}%</p>
                    </div>
                 </div>
              ))}
           </div>
        </section>

        {/* Device Distribution */}
        <section className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between">
           <div>
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-apple-green/5 dark:bg-apple-green/10 rounded-xl flex items-center justify-center shrink-0">
                   <Smartphone className="w-4.5 h-4.5 text-apple-green" />
                </div>
                <div>
                   <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-primary)] dark:text-white">Access Modalities</h2>
                   <p className="text-[10px] text-[var(--text-secondary)] font-normal mt-0.5">Device-Type Analysis</p>
                </div>
             </div>

             <div className="space-y-4">
                <div className="space-y-2">
                   <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2 text-[var(--text-primary)] dark:text-white">
                         <Smartphone className="w-3.5 h-3.5 text-apple-blue" />
                         <span>Mobile Interface</span>
                      </div>
                      <span className="font-mono text-[var(--text-primary)] dark:text-white">84%</span>
                   </div>
                   <div className="h-2 bg-apple-border dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "84%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-apple-blue rounded-full" 
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2 text-[var(--text-primary)] dark:text-white">
                         <Laptop className="w-3.5 h-3.5 text-[#86868B]" />
                         <span>Desktop Terminal</span>
                      </div>
                      <span className="font-mono text-[var(--text-primary)] dark:text-white">12%</span>
                   </div>
                   <div className="h-2 bg-[#E5E5E7] dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "12%" }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                        className="h-full bg-[#86868B] rounded-full" 
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2 text-[var(--text-primary)] dark:text-white">
                         <Globe className="w-3.5 h-3.5 text-[#86868B]" />
                         <span>Other Entities</span>
                      </div>
                      <span className="font-mono text-[var(--text-primary)] dark:text-white">4%</span>
                   </div>
                   <div className="h-2 bg-[#E5E5E7] dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "4%" }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="h-full bg-black/10 dark:bg-white/20 rounded-full" 
                      />
                   </div>
                </div>
             </div>
           </div>

           <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between gap-4">
              <div className="min-w-0">
                 <p className="text-[9px] font-bold uppercase tracking-wider text-apple-blue mb-0.5">Elite Insight</p>
                 <p className="text-[11px] font-semibold text-[var(--text-primary)] dark:text-white leading-tight">Mobile conversion is 4x higher. Optimize descriptions for vertical scan.</p>
              </div>
              <TrendingUp className="w-6 h-6 text-apple-blue shrink-0" />
           </div>
        </section>
      </div>

      {/* Advanced Market Trajectory Block */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--text-primary)] p-6 sm:p-8 text-white shadow-lg">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,113,227,0.12),transparent)] pointer-events-none" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-8">
            <div className="flex-1 space-y-4">
               <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                  <Zap className="w-3 h-3 text-apple-blue" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-apple-blue">Neural Prediction Engine</span>
               </div>
               <h3 className="text-xl sm:text-2xl font-semibold tracking-tight leading-snug">
                 Anticipate your <span className="text-apple-blue">Market Trajectory</span>.
               </h3>
               <p className="text-white/60 text-xs font-normal leading-relaxed max-w-xl">
                 Our neural engine predicts a 4.2% increase in asset demand for your specific portfolio segments over the next 14 high-frequency cycles.
               </p>
            </div>

            <div className="w-full md:w-80 rounded-xl bg-white/5 border border-white/10 p-5 flex flex-col justify-between gap-4 shrink-0">
               <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-apple-blue rounded-lg flex items-center justify-center shrink-0">
                     <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Reliability Score</p>
                     <p className="text-lg font-bold text-apple-blue font-mono">98.4%</p>
                  </div>
               </div>
               
               <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-white/5 border border-white/5">
                     <p className="text-xs font-medium leading-relaxed">Increase Islamabad sector allocation for Japanese Hybrid variants.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-apple-green text-[10px] font-bold uppercase tracking-wider">
                     <Activity className="w-3.5 h-3.5" />
                     Live Trend Correlation
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}

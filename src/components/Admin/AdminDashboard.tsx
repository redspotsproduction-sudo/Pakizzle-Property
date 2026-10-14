import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Users, 
  Car, 
  Store, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Activity,
  Zap,
  Cpu,
  Globe,
  MoreHorizontal,
  RefreshCw,
  Search,
  Bell,
  Plus,
  ArrowRight,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  MessageSquare,
  PhoneCall,
  Eye,
  MousePointer2,
  MapPin,
  Layers,
  Award,
  Filter,
  Download,
  Share2
} from "lucide-react";
import { 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Line
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "../../lib/utils";
import StaleListingsWidget from "./StaleListingsWidget";

const data = [
  { name: '00:00', leads: 400, views: 3000, revenue: 1200 },
  { name: '04:00', leads: 300, views: 2500, revenue: 900 },
  { name: '08:00', leads: 2000, views: 18000, revenue: 5400 },
  { name: '12:00', leads: 2780, views: 24000, revenue: 7200 },
  { name: '16:00', leads: 1890, views: 16000, revenue: 4800 },
  { name: '20:00', leads: 2390, views: 21000, revenue: 6300 },
  { name: '23:59', leads: 3490, views: 30000, revenue: 9000 },
];

const regionalData = [
  { region: 'Karachi', liquidity: 'High', volume: 'Rs 82M', density: 85 },
  { region: 'Lahore', liquidity: 'Medium', volume: 'Rs 64M', density: 62 },
  { region: 'Islamabad', liquidity: 'Stable', volume: 'Rs 48M', density: 45 },
  { region: 'Peshawar', liquidity: 'Growing', volume: 'Rs 22M', density: 28 },
];

const dealerLeaderboard = [
  { name: 'Premium Motors', leads: 482, conversion: '12.4%', color: 'blue' },
  { name: 'Elite Wheels', leads: 391, conversion: '10.8%', color: 'purple' },
  { name: 'City Drive', leads: 245, conversion: '8.2%', color: 'green' },
  { name: 'Velocity Cars', leads: 198, conversion: '7.5%', color: 'orange' },
];

const liveLeads = [
  { id: 1, user: 'Ahmed R.', action: 'Call requested', car: 'Honda Civic', time: '12s ago' },
  { id: 2, user: 'Sara K.', action: 'WhatsApp Chat', car: 'Toyota Altis', time: '45s ago' },
  { id: 3, user: 'Umar F.', action: 'Offer Submitted', car: 'Audi A4', time: '1m ago' },
];

const stats = [
  { 
    label: 'Total Leads', 
    value: '42,902', 
    change: '+24.5%', 
    icon: MessageSquare, 
    color: 'blue',
    trend: [4, 6, 8, 5, 9, 10, 12],
    description: 'Active enquiries from users'
  },
  { 
    label: 'Market Liquidity', 
    value: 'Rs 248M', 
    change: '+12.2%', 
    icon: DollarSign, 
    color: 'green',
    trend: [5, 5, 6, 7, 8, 8, 9],
    description: 'Closed transaction volume'
  },
  { 
    label: 'VAS Revenue', 
    value: 'Rs 12.4M', 
    change: '+32.0%', 
    icon: Zap, 
    color: 'orange',
    trend: [2, 3, 5, 4, 8, 9, 11],
    description: 'Revenue from featured ads'
  },
  { 
    label: 'Insurance Terminal', 
    value: '1,240', 
    change: '+15.2%', 
    icon: ShieldCheck, 
    color: 'green',
    trend: [8, 8.5, 9, 9.2, 9.8, 10, 11],
    description: 'Active policies & pending quotes'
  },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeMetric, setActiveMetric] = useState('leads');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center / Seller Console layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Activity className="w-3.5 h-3.5" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Ecosystem Pulse
          </h1>
          <p className="text-xs text-apple-text-muted mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Dubizzle-grade classifieds infrastructure orchestrating cross-network car liquidity.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <Button 
            variant="ghost" 
            onClick={handleRefresh}
            className="rounded-xl h-9 w-9 p-0 flex items-center justify-center bg-[#F5F5F7] dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-90"
          >
            <RefreshCw className={cn("w-4 h-4 transition-all duration-700", isRefreshing && "animate-spin text-apple-blue")} />
          </Button>
          <Button variant="outline" className="rounded-xl font-bold text-xs h-9 px-4 border border-black/10 dark:border-white/10 bg-white dark:bg-[#2C2C2E] hover:bg-black/5 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" /> Filters
          </Button>
          <Button className="bg-apple-blue hover:bg-blue-600 text-white font-bold text-xs h-9 px-5 rounded-xl transition-all flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> New Listing
          </Button>
        </div>
      </div>

      {/* High-Velocity Metrics Shard - Sized perfectly like Approval Center bento elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-apple-text">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 flex flex-col justify-between hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 relative group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md",
                stat.color === 'blue' && "bg-apple-blue shadow-apple-blue/10",
                stat.color === 'green' && "bg-apple-green shadow-apple-green/10",
                stat.color === 'orange' && "bg-apple-orange shadow-apple-orange/10",
                stat.color === 'purple' && "bg-[var(--spectrum-plum)] shadow-purple-500/10"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                stat.change.startsWith('+') ? "text-apple-green bg-apple-green/10" : "text-apple-red bg-apple-red/10"
              )}>
                {stat.change}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] dark:text-white font-sans">{stat.value}</h3>
              <p className="text-[10px] text-apple-text-muted font-normal leading-relaxed">{stat.description}</p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/[0.02] dark:border-white/[0.02]">
              <div className="flex items-end gap-1 h-6 flex-1 max-w-[120px]">
                {stat.trend.map((val, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${(val / 12) * 100}%` }}
                    className={cn(
                      "w-full rounded-t-sm transition-all duration-500",
                      stat.color === 'blue' && "bg-apple-blue/30 group-hover:bg-apple-blue",
                      stat.color === 'green' && "bg-apple-green/30 group-hover:bg-apple-green",
                      stat.color === 'orange' && "bg-apple-orange/30 group-hover:bg-apple-orange",
                      stat.color === 'purple' && "bg-purple-500/30 group-hover:bg-purple-500"
                    )}
                  />
                ))}
              </div>
              {stat.label === 'Insurance Terminal' && (
                <Link to="/admin/insurance" className="p-1.5 bg-apple-green/10 text-apple-green rounded-lg hover:bg-apple-green hover:text-white transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Primary Analytics Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Main Performance Node */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 flex flex-col"
        >
          <div className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 mb-6 border-b border-black/[0.04] dark:border-white/[0.04]">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[var(--text-primary)] dark:text-white">Atmospheric Velocity</h3>
                <p className="text-xs text-apple-text-muted">Dynamic throughput of car enquiries & VAS revenue.</p>
              </div>
              <div className="flex bg-[#F5F5F7] dark:bg-white/5 p-1 rounded-xl">
                {['Leads', 'Views', 'Revenue'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveMetric(tab.toLowerCase())}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                      activeMetric === tab.toLowerCase() 
                        ? "bg-white dark:bg-[#2C2C2E] shadow-sm text-[var(--text-primary)] dark:text-white" 
                        : "text-apple-text-muted hover:text-[var(--text-primary)] dark:hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[340px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="metric-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeMetric === 'leads' ? "var(--spectrum-blue)" : activeMetric === 'views' ? "var(--spectrum-plum)" : "var(--spectrum-green)"} stopOpacity={0.25}/>
                      <stop offset="100%" stopColor={activeMetric === 'leads' ? "var(--spectrum-blue)" : activeMetric === 'views' ? "var(--spectrum-plum)" : "var(--spectrum-green)"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="1 10" vertical={false} stroke="rgba(0,0,0,0.06)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-tertiary)' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-tertiary)' }}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'var(--spectrum-blue)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      backdropFilter: 'blur(20px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.08)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontWeight: 700 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={activeMetric} 
                    stroke={activeMetric === 'leads' ? "var(--spectrum-blue)" : activeMetric === 'views' ? "var(--spectrum-plum)" : "var(--spectrum-green)"} 
                    strokeWidth={3} 
                    fill="url(#metric-grad)" 
                    animationDuration={1500}
                  />
                  <Bar 
                    dataKey={activeMetric} 
                    barSize={10} 
                    fill={activeMetric === 'leads' ? "var(--spectrum-blue)" : activeMetric === 'views' ? "var(--spectrum-plum)" : "var(--spectrum-green)"} 
                    opacity={0.06}
                    radius={[6, 6, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Regional Intelligence Shard */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 space-y-6"
        >
          {/* Geo Density */}
          <div className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] dark:text-white flex items-center gap-2 pb-4 mb-4 border-b border-black/[0.04] dark:border-white/[0.04]">
                <MapPin className="w-5 h-5 text-apple-red" />
                Geo Density
              </h3>
              <div className="space-y-4">
                {regionalData.map((data, idx) => (
                  <div key={data.region} className="p-3.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-[var(--text-primary)] dark:text-white">{data.region}</span>
                        <Badge className="bg-apple-green/10 text-apple-green border-none rounded-md font-bold text-[9px] hover:bg-apple-green/10">{data.liquidity}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-1.5 flex-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${data.density}%` }}
                          transition={{ delay: 0.2 + (idx * 0.05), duration: 1 }}
                          className="h-full bg-apple-blue rounded-full"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-[var(--text-primary)] dark:text-white font-mono shrink-0">{data.volume}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* VAS Funnel Shard */}
          <div className="rounded-2xl bg-apple-blue p-6 text-white group flex flex-col justify-between shadow-[0_8px_32px_rgba(0,125,255,0.15)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-wider opacity-60">Elite Shard</p>
                <h5 className="text-sm font-bold">+42% Growth</h5>
              </div>
            </div>
            <div className="space-y-1.5 mb-6">
              <h4 className="text-lg font-bold tracking-tight">Alpha Monetization</h4>
              <p className="text-xs opacity-80 leading-relaxed font-normal">
                Featured Ads and Turbo boosts are driving record-breaking liquidity levels.
              </p>
            </div>
            <Button className="w-full bg-white hover:bg-white/90 text-apple-blue font-bold rounded-xl py-5 text-xs transition-all active:scale-95">
              Analyze VAS Streams <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Listing Freshness & Anti-Stale Inventory Health Widget */}
      <section className="mt-6">
        <StaleListingsWidget />
      </section>

      {/* Live Activity & Dealer Alpha */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Continuous Lead Stream */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-apple-green" />
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] dark:text-white">Atmospheric Pulse</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-apple-green animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted">Live Stream</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {liveLeads.map((lead, i) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 relative group cursor-pointer"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrendingUp className="w-3.5 h-3.5 text-apple-green" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-apple-blue">{lead.action}</span>
                    <span className="text-[9px] font-semibold text-apple-text-muted">{lead.time}</span>
                  </div>
                  <div>
                    <h6 className="font-semibold text-sm text-[var(--text-primary)] dark:text-white truncate"> {lead.user}</h6>
                    <p className="text-[11px] text-apple-text-muted truncate mt-0.5">{lead.car}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Alpha Shard Leaderboard */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-1">
            <Award className="w-6 h-6 text-apple-orange" />
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] dark:text-white">Alpha Shards</h2>
          </div>
          <div className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 flex flex-col justify-between flex-1">
            <div className="space-y-4">
              {dealerLeaderboard.map((dealer, i) => (
                <div key={dealer.name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F5F5F7] dark:bg-white/5 flex items-center justify-center font-bold text-xs group-hover:bg-apple-blue group-hover:text-white transition-all duration-300">
                      #{i+1}
                    </div>
                    <div>
                      <h6 className="font-semibold text-xs tracking-tight text-[var(--text-primary)] dark:text-white group-hover:text-apple-blue transition-colors">{dealer.name}</h6>
                      <span className="text-[9px] font-bold text-apple-text-muted uppercase tracking-wider">{dealer.conversion} CV</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-[var(--text-primary)] dark:text-white font-mono">{dealer.leads}</span>
                    <p className="text-[8px] font-bold text-apple-green uppercase tracking-wider mt-[-2px]">Leads</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full rounded-xl py-4.5 font-bold text-xs uppercase tracking-wider border border-black/10 dark:border-white/10 mt-4 hover:bg-apple-blue hover:text-white hover:border-apple-blue transition-all active:scale-[0.98]">
              View All Alpha Entities
            </Button>
          </div>
        </div>
      </section>

      {/* Global Mastery Horizon */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-black dark:bg-[var(--bg-raised)] text-white p-8 lg:p-12 overflow-hidden relative shadow-lg border border-white/5 mt-6"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-apple-blue/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[var(--spectrum-plum)]/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <span className="inline-block bg-apple-blue/15 text-apple-blue border border-apple-blue/20 py-1 px-4.5 font-bold rounded-full uppercase tracking-widest text-[9px]">
              Sovereign Analytics
            </span>
            <h3 className="text-3xl lg:text-4xl font-semibold tracking-tight leading-tight text-white">
              Dominant visibility.
            </h3>
            <p className="text-xs opacity-70 font-normal leading-relaxed">
              Your ecosystem is now observable from the atomic transaction level up to global liquidity horizons. Orchestrate lead conversion at scale.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Button className="w-full sm:w-auto bg-apple-blue hover:bg-blue-600 text-white font-bold h-10 px-6 rounded-xl transition-all active:scale-95 text-xs flex items-center justify-center gap-2 shadow-md">
              Audit Market <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full sm:w-auto border-white/10 text-white font-bold h-10 px-6 rounded-xl hover:bg-white/10 transition-all active:scale-95 text-xs flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Data Export
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

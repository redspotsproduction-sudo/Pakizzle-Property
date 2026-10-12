import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  Search, 
  MoreVertical, 
  Car, 
  User, 
  ShieldCheck, 
  Clock,
  AlertTriangle,
  FileText,
  ChevronRight,
  Zap,
  CheckCircle2,
  XCircle,
  Flag,
  Activity,
  Ban,
  SlidersHorizontal,
  ExternalLink,
  Layers
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "../../lib/utils";
import { SystemReport } from "../../types";

const mockReports: SystemReport[] = [
  {
    id: 'REP-501',
    reporterId: 'u_77',
    reporterName: 'Saad Ahmed',
    targetId: 'v_101',
    targetType: 'listing',
    category: 'scam',
    description: 'The price is too good to be true and the user is asking for advance deposit before inspection.',
    status: 'open',
    priority: 'critical',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'REP-502',
    reporterId: 'u_88',
    reporterName: 'Fatima Malik',
    targetId: 'u_122',
    targetType: 'user',
    category: 'offensive',
    description: 'Used very abusive language during chat when I offered 50k less than asking price.',
    status: 'investigating',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'REP-503',
    reporterId: 'u_99',
    reporterName: 'Zain Abbas',
    targetId: 'v_202',
    targetType: 'listing',
    category: 'misleading',
    description: 'Listing says 20k driven but internal pics show 150k on odometer. Total fraud.',
    status: 'open',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'REP-504',
    reporterId: 'u_10',
    reporterName: 'Haris Khan',
    targetId: 'v_404',
    targetType: 'listing',
    category: 'spam',
    description: 'Duplicate listing posted 10 times in different cities.',
    status: 'resolved',
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    resolvedBy: 'Admin_Zeeshan',
    adminNotes: 'User warned and duplicate listings cleared.'
  }
];

export default function ReportManagement() {
  const [reports, setReports] = useState<SystemReport[]>(mockReports);
  const [activeTab, setActiveTab] = useState<'all' | 'priority' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<SystemReport | null>(null);
  const [isInvestigateOpen, setIsInvestigateOpen] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState("");

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      // Tab filter
      if (activeTab === 'priority') {
        if (r.priority !== 'high' && r.priority !== 'critical') return false;
        if (r.status === 'resolved') return false;
      } else if (activeTab === 'resolved') {
        if (r.status !== 'resolved') return false;
      }
      
      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q);
        const matchReporter = r.reporterName.toLowerCase().includes(q);
        const matchCategory = r.category.toLowerCase().includes(q);
        const matchTarget = r.targetId.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        return matchId || matchReporter || matchCategory || matchTarget || matchDesc;
      }
      
      return true;
    });
  }, [reports, activeTab, searchQuery]);

  const handleAction = (type: string, data: SystemReport) => {
    if (type === 'investigate') {
      setSelectedReport(data);
      setDecisionNotes(data.adminNotes || "");
      setIsInvestigateOpen(true);
    } else if (type === 'resolve') {
      setReports(prev => prev.map(r => r.id === data.id ? { ...r, status: 'resolved', adminNotes: decisionNotes || 'Resolved after review.' } : r));
      toast.success("Security Incident Resolved", {
        description: `Case ${data.id} closed and protocols updated.`,
        icon: <ShieldCheck className="w-4 h-4 text-apple-green" />
      });
      setIsInvestigateOpen(false);
    } else if (type === 'ban') {
      setReports(prev => prev.filter(r => r.id !== data.id));
      toast.error("Account Terminated", {
        description: `Target identity ${data.targetId} has been restricted and flagged.`,
        icon: <XCircle className="w-4 h-4 text-apple-red" />
      });
      setIsInvestigateOpen(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Signals' },
    { id: 'priority', label: 'High Priority' },
    { id: 'resolved', label: 'Resolved Cases' },
  ] as const;

  const getTabCount = (tabId: 'all' | 'priority' | 'resolved') => {
    return reports.filter(r => {
      if (tabId === 'priority') return (r.priority === 'high' || r.priority === 'critical') && r.status !== 'resolved';
      if (tabId === 'resolved') return r.status === 'resolved';
      return true;
    }).length;
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'critical': return 'text-apple-red bg-apple-red/10';
      case 'high': return 'text-apple-orange bg-apple-orange/10';
      case 'medium': return 'text-apple-blue bg-apple-blue/10';
      default: return 'text-[#86868B] bg-[#F5F5F7] dark:bg-white/5';
    }
  };

  // High-Velocity Metrics Shard - Sized perfectly like Approval Center bento elements
  const stats = [
    { 
      label: 'Total Alerts', 
      value: reports.length.toString(), 
      change: '+8.3%', 
      description: 'Active marketplace signals', 
      icon: Flag, 
      color: 'blue' 
    },
    { 
      label: 'Unresolved Cases', 
      value: reports.filter(r => r.status !== 'resolved').length.toString(), 
      change: '-15.4%', 
      description: 'Immediate response required', 
      icon: ShieldAlert, 
      color: 'orange' 
    },
    { 
      label: 'Mean Resolution', 
      value: '4.2h', 
      change: '-14.0%', 
      description: 'Time to resolve case', 
      icon: Clock, 
      color: 'green' 
    },
    { 
      label: 'Protocol Health', 
      value: '98.2%', 
      change: '+0.5%', 
      description: 'Systemic safety score', 
      icon: Activity, 
      color: 'purple' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center / Seller Console layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-red uppercase tracking-[0.18em]">
            <ShieldAlert className="w-3.5 h-3.5" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Incident Cockpit
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Monitor, moderate, and resolve all community flags and system-critical incidents with advanced forensic scans.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <div className="relative group min-w-[200px] sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search incident logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
            />
          </div>
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
                stat.color === 'orange' && "bg-apple-orange shadow-apple-orange/10",
                stat.color === 'green' && "bg-apple-green shadow-apple-green/10",
                stat.color === 'purple' && "bg-[#AF52DE] shadow-purple-500/10"
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white font-sans">{stat.value}</h3>
              <p className="text-[10px] text-[#86868B] font-normal leading-relaxed">{stat.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs Row - EXACT match with Seller Console style */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        {tabs.map((tab) => {
          const count = getTabCount(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border",
                isActive
                  ? "bg-apple-blue text-white border-apple-blue shadow-sm"
                  : "bg-white dark:bg-[var(--surface-dark)] border-black/[0.04] dark:border-white/[0.04] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              )}
            >
              {tab.label} <span className={cn("ml-1 py-0.5 px-1.5 rounded-full text-[9px] font-bold font-mono", isActive ? "bg-white/25 text-white" : "bg-[#F5F5F7] dark:bg-white/5 text-[#86868B]")}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Signals List - EXACT card format, padding and hover from Seller Console layout */}
      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {filteredReports.length > 0 ? (
            filteredReports.map((report, idx) => {
              const isListing = report.targetType === 'listing';
              const isUser = report.targetType === 'user';

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: idx * 0.02 }}
                  className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-4.5 flex flex-col md:flex-row items-stretch md:items-center gap-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300"
                >
                  {/* Category Shard Icon */}
                  <div className="relative w-full md:w-36 aspect-[4/3] rounded-xl overflow-hidden shrink-0 bg-[#1C1C1E] border border-black/5 dark:border-white/10 group flex items-center justify-center">
                    <div className={cn(
                      "w-full h-full flex items-center justify-center transition-colors",
                      isListing && "bg-apple-blue/5 dark:bg-apple-blue/10 text-apple-blue",
                      isUser && "bg-purple-500/5 dark:bg-purple-500/10 text-purple-500"
                    )}>
                      {isListing ? <Car className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    
                    <div className="absolute top-2.5 left-2.5">
                       <span className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider backdrop-blur-md border",
                        isListing && "bg-apple-blue/15 text-apple-blue border-apple-blue/20",
                        isUser && "bg-purple-500/15 text-purple-500 border-purple-500/20"
                       )}>
                         {isListing ? 'Listing' : 'User'}
                       </span>
                    </div>
                  </div>

                  {/* Report Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#86868B] uppercase tracking-wider mb-1">
                         <ShieldAlert className="w-3 h-3 text-apple-red" />
                         Incident ID #{report.id}
                         <span className="opacity-30">•</span>
                         <span>Reported by {report.reporterName}</span>
                         <span className="opacity-30">•</span>
                         <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <h2 className="text-sm font-semibold text-[#1D1D1F] dark:text-white truncate block">
                        Category: <span className="text-apple-red font-bold capitalize">{report.category}</span>
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#86868B] font-normal">
                         <span className="font-semibold text-apple-blue">Target ID: {report.targetId}</span>
                         <span className="opacity-30">/</span>
                         <span className="truncate max-w-[400px]">{report.description}</span>
                      </div>
                    </div>

                    {/* Bento Micro-Stats box matrix matching Seller Console layout precisely */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5">
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Priority Risk</p>
                          <p className={cn(
                            "text-xs font-bold font-mono mt-0.5 capitalize flex items-center gap-1",
                            report.priority === 'critical' ? 'text-apple-red' : report.priority === 'high' ? 'text-apple-orange' : 'text-apple-blue'
                          )}>
                            {report.priority}
                            <span className="text-[9px] font-semibold font-sans">Alert</span>
                          </p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Operational State</p>
                          <p className={cn(
                            "text-xs font-bold font-mono mt-0.5 capitalize",
                            report.status === 'open' ? 'text-apple-orange' : report.status === 'investigating' ? 'text-apple-blue' : 'text-apple-green'
                          )}>{report.status}</p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02] sm:block hidden">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Decision Matrix</p>
                          <p className="text-xs font-bold text-[#1D1D1F] dark:text-white font-sans mt-0.5">Pending Action</p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02] sm:block hidden">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Platform Security</p>
                          <p className="text-xs font-bold text-apple-green font-mono mt-0.5">SSL Secured</p>
                       </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex md:flex-col justify-end items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-black/[0.04] dark:border-white/[0.04] md:pl-5 shrink-0">
                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      <button 
                        onClick={() => handleAction('investigate', report)}
                        className="px-4.5 py-2 rounded-xl bg-apple-blue hover:bg-blue-600 text-white flex items-center justify-center font-semibold text-xs transition-colors"
                        title="Investigate incident"
                      >
                        Investigate
                      </button>

                      <button
                        onClick={() => handleAction('resolve', report)}
                        className="w-8.5 h-8.5 rounded-lg bg-[#F5F5F7] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-apple-green transition-colors"
                        title="Resolve Instantly"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleAction('ban', report)}
                        className="w-8.5 h-8.5 rounded-lg bg-[#F5F5F7] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-apple-red transition-colors"
                        title="Restrict Instantly"
                      >
                        <Ban className="w-4 h-4" />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(
                          "w-8.5 h-8.5 rounded-lg bg-[#F5F5F7] dark:bg-white/5 flex items-center justify-center transition-all hover:bg-apple-gray dark:hover:bg-white/10 text-apple-text-muted"
                        )}>
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-apple-border/50 backdrop-blur-xl">
                          <DropdownMenuItem 
                            onClick={() => handleAction('resolve', report)}
                            className="font-bold text-xs py-3 px-4 rounded-lg focus:bg-apple-green/10 focus:text-apple-green cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2 text-apple-green" /> Resolve Incident
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleAction('ban', report)}
                            className="font-bold text-xs py-3 px-4 rounded-lg focus:bg-apple-red/10 focus:text-apple-red cursor-pointer"
                          >
                            <Ban className="w-4 h-4 mr-2 text-apple-red" /> Purge & Restrict
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-bold text-xs py-3 px-4 rounded-lg cursor-pointer">
                            <AlertTriangle className="w-4 h-4 mr-2 text-apple-orange" /> Flag for Risk
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center bg-[#F5F5F7]/30 dark:bg-white/[0.005] rounded-2xl border border-dashed border-black/[0.06] dark:border-white/[0.06]"
            >
              <CheckCircle2 className="w-10 h-10 text-apple-green/60 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-1">Incident Queue Clear</h3>
              <p className="text-xs text-[#86868B] max-w-xs mx-auto mb-4 leading-relaxed font-normal">
                All community-submitted reports and platform flags have been handled. Zero threat latency.
              </p>
              <button 
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery("");
                }}
                className="px-3.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold bg-white dark:bg-[#2C2C2E] hover:bg-black/5"
              >
                Reset Protocols
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Control Terminal - MATCHES Seller Console Layout Precisely */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
         <div className="md:col-span-2 rounded-2xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-10 h-10 bg-apple-red rounded-xl flex items-center justify-center shrink-0">
               <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
               <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white mb-0.5">Automated Threat Scans Active</h4>
               <p className="text-[11px] text-[#86868B] font-normal leading-relaxed">
                 All platform flags and reports are dynamically analyzed via cryptographic trust registers, user telemetry records, and pattern matching layers.
               </p>
               <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-apple-red animate-pulse" />
                     <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868B]">Scanning Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
                     <span className="text-[9px] font-bold uppercase tracking-wider text-apple-blue">Secure Firewall</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white dark:bg-[var(--surface-dark)] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-center items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
            <ShieldCheck className="w-6 h-6 text-apple-green mb-2" />
            <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">Safety Index</h4>
            <div className="text-2xl font-bold text-[#1D1D1F] dark:text-white font-mono mt-1 mb-0.5">99.2%</div>
            <p className="text-[9px] font-bold text-apple-green uppercase tracking-widest font-sans">Market Compliance</p>
         </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isInvestigateOpen} onOpenChange={setIsInvestigateOpen}>
        <DialogContent className="max-w-[92vw] lg:max-w-4xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[#1D1D1F] shadow-2xl flex flex-col">
          {selectedReport && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-8 border-b border-apple-border flex items-center justify-between bg-apple-gray/10 dark:bg-white/[0.02]">
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-apple-text">Incident Investigation</DialogTitle>
                  <DialogDescription className="text-xs text-apple-text-muted mt-1 uppercase font-black tracking-widest">Reviewing incident {selectedReport.id}</DialogDescription>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest border",
                  selectedReport.status === 'resolved' ? "bg-apple-green/10 text-apple-green border-apple-green/20" : "bg-apple-orange/10 text-apple-orange border-apple-orange/20"
                )}>
                   {selectedReport.status}
                </span>
              </div>

              <ScrollArea className="flex-1 min-h-0 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {/* Incident Details */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Incident Details</p>
                      <div className="glass-panel p-5 rounded-2xl space-y-3.5 shadow-sm">
                        <div className="flex flex-col gap-1 border-b border-apple-border/30 pb-2.5">
                          <span className="text-[8px] font-black text-apple-text-muted uppercase tracking-widest">Reporter Name</span>
                          <span className="font-bold text-sm tracking-tight text-apple-text">{selectedReport.reporterName}</span>
                        </div>
                        <div className="flex flex-col gap-1 border-b border-apple-border/30 pb-2.5">
                          <span className="text-[8px] font-black text-apple-text-muted uppercase tracking-widest">Reporter ID</span>
                          <span className="font-bold text-sm tracking-tight text-apple-text font-mono">{selectedReport.reporterId}</span>
                        </div>
                        <div className="flex flex-col gap-1 border-b border-apple-border/30 pb-2.5">
                          <span className="text-[8px] font-black text-apple-text-muted uppercase tracking-widest">Target Type</span>
                          <span className="font-bold text-sm tracking-tight text-apple-text capitalize">{selectedReport.targetType}</span>
                        </div>
                        <div className="flex flex-col gap-1 border-b border-apple-border/30 pb-2.5">
                          <span className="text-[8px] font-black text-apple-text-muted uppercase tracking-widest">Target ID</span>
                          <span className="font-bold text-sm tracking-tight text-apple-text font-mono">{selectedReport.targetId}</span>
                        </div>
                        <div className="flex flex-col gap-1 border-b border-apple-border/30 pb-2.5">
                          <span className="text-[8px] font-black text-apple-text-muted uppercase tracking-widest">Category</span>
                          <span className="font-bold text-sm tracking-tight text-apple-text capitalize">{selectedReport.category}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black text-apple-text-muted uppercase tracking-widest">Created At</span>
                          <span className="font-bold text-sm tracking-tight text-apple-text">{new Date(selectedReport.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Community Scan */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Community Scan</p>
                      <div className="p-5 rounded-2xl border border-apple-green/20 bg-apple-green/5 dark:bg-apple-green/10 space-y-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-apple-text">Integrity Index</span>
                          <span className="text-base font-black text-apple-green">98.2%</span>
                        </div>
                        <div className="h-1.5 bg-apple-gray dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-apple-green w-[98.2%]" />
                        </div>
                      </div>
                    </div>

                    {/* Incident Descriptor */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Incident Descriptor</p>
                      <div className="p-5 rounded-2xl bg-apple-gray/50 dark:bg-white/5 border border-apple-border text-sm font-semibold text-apple-text leading-relaxed shadow-inner">
                        "{selectedReport.description}"
                      </div>
                    </div>

                    {/* Decision Comments */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Decision Comments</p>
                      <textarea 
                        className="apple-input w-full py-4 resize-none leading-relaxed h-28"
                        placeholder="Observations, resolution notes..."
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="p-8 border-t border-apple-border bg-apple-gray/30 dark:bg-white/[0.02] flex flex-col md:flex-row gap-4 mt-auto">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-14 rounded-2xl border-2 border-apple-border font-black uppercase tracking-widest text-xs text-apple-red hover:bg-apple-red/10 active:scale-95 transition-all w-full md:w-auto"
                  onClick={() => handleAction('ban', selectedReport)}
                >
                  Purge Entity
                </Button>
                <Button 
                  className="flex-[2] apple-button-primary h-14 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs text-white"
                  onClick={() => handleAction('resolve', selectedReport)}
                >
                  Resolve Case
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

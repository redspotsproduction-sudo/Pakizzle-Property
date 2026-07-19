import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Search, 
  Download, 
  Clock, 
  Shield, 
  ChevronRight,
  Zap,
  ShieldCheck,
  AlertCircle,
  Hash,
  Fingerprint,
  ExternalLink,
  Lock,
  Eye,
  Terminal,
  Server,
  Database,
  History,
  FileSearch,
  CheckCircle2,
  Trash2,
  Ban,
  Share2,
  Cpu,
  Layers,
  ArrowRightLeft,
  User
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "../../lib/utils";
import { AuditLog as AuditLogType } from "../../types";

const mockLogs: AuditLogType[] = [
  {
    id: 'LOG_9012',
    adminId: 'ADM_ZEESHAN',
    action: 'TRUST_SCORE_ADJUSTED',
    targetType: 'User',
    targetId: 'u_112',
    details: 'Adjusted trust score from 85 to 95 after successful verification completion.',
    ipAddress: '110.37.211.54',
    userAgent: 'macOS / Safari 17.4',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'LOG_9011',
    adminId: 'SYS_DAEMON',
    action: 'AUTO_MODERATION',
    targetType: 'Conversation',
    targetId: 'conv_554',
    details: 'System automatically flagged conversation for excessive link sharing.',
    ipAddress: '0.0.0.0',
    userAgent: 'Vercel Serverless / Edge',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'LOG_9010',
    adminId: 'MOD_IRTIZA',
    action: 'IDENTITY_VERIFIED',
    targetType: 'Verification',
    targetId: 'ver_882',
    details: 'Verified Pakistani National ID card for user @hamzakhan.',
    ipAddress: '182.176.4.12',
    userAgent: 'Windows 11 / Chrome 122',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'LOG_9009',
    adminId: 'ADM_ZEESHAN',
    action: 'LISTING_TERMINATED',
    targetType: 'Vehicle',
    targetId: 'v_404',
    details: 'Removed duplicate listing after 3 community reports.',
    ipAddress: '110.37.211.54',
    userAgent: 'macOS / Safari 17.4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'LOG_9008',
    adminId: 'FIN_SARA',
    action: 'PAYOUT_REJECTED',
    targetType: 'Transaction',
    targetId: 'px_772',
    details: 'Rejected payout request due to mismatched IBAN details.',
    ipAddress: '202.163.77.10',
    userAgent: 'iPadOS / Safari Mobile',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  }
];

export default function AuditLog() {
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => {
      // Tab filter
      if (activeTab === 'system') {
        if (!log.adminId.startsWith('SYS_')) return false;
      } else if (activeTab === 'admin') {
        if (log.adminId.startsWith('SYS_')) return false;
      }

      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = log.id.toLowerCase().includes(q);
        const matchAdmin = log.adminId.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchTargetType = log.targetType.toLowerCase().includes(q);
        const matchTargetId = log.targetId.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        return matchId || matchAdmin || matchAction || matchTargetType || matchTargetId || matchDetails;
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  const handleInspect = (log: AuditLogType) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const tabs = [
    { id: 'all', label: 'All Protocols' },
    { id: 'admin', label: 'Admin Logs' },
    { id: 'system', label: 'System Logs' },
  ] as const;

  const getTabCount = (tabId: 'all' | 'system' | 'admin') => {
    return mockLogs.filter(log => {
      if (tabId === 'system') return log.adminId.startsWith('SYS_');
      if (tabId === 'admin') return !log.adminId.startsWith('SYS_');
      return true;
    }).length;
  };

  const stats = [
    { 
      label: 'Oversight Velocity', 
      value: '428', 
      change: '+12.4%', 
      description: 'Actions recorded this week', 
      icon: Activity, 
      color: 'blue' 
    },
    { 
      label: 'Security Shards', 
      value: '12', 
      change: '+5.0%', 
      description: 'High risk flags detected', 
      icon: Shield, 
      color: 'orange' 
    },
    { 
      label: 'Ledger Health', 
      value: '99.9%', 
      change: '+0.1%', 
      description: 'Forensic integrity score', 
      icon: Server, 
      color: 'green' 
    },
    { 
      label: 'Identity Nodes', 
      value: '256', 
      change: '+2.8%', 
      description: 'Authoritative entities', 
      icon: Fingerprint, 
      color: 'purple' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center / Seller Console layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Audit Ledger
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Review cryptographically signed administrative audit trails and systemic integrity diagnostics.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <div className="relative group min-w-[200px] sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search audit logs..."
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
            className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 flex flex-col justify-between hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 relative group"
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
                  : "bg-white dark:bg-[#161617] border-black/[0.04] dark:border-white/[0.04] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              )}
            >
              {tab.label} <span className={cn("ml-1 py-0.5 px-1.5 rounded-full text-[9px] font-bold font-mono", isActive ? "bg-white/25 text-white" : "bg-[#F5F5F7] dark:bg-white/5 text-[#86868B]")}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Logs List - EXACT card format, padding and hover from Seller Console layout */}
      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, idx) => {
              const isSystem = log.adminId.startsWith('SYS_');

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: idx * 0.02 }}
                  className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-4.5 flex flex-col md:flex-row items-stretch md:items-center gap-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300"
                >
                  {/* Category Image / Custom Shard Icon */}
                  <div className="relative w-full md:w-36 aspect-[4/3] rounded-xl overflow-hidden shrink-0 bg-[#1C1C1E] border border-black/5 dark:border-white/10 group flex items-center justify-center">
                    <div className={cn(
                      "w-full h-full flex items-center justify-center transition-colors",
                      isSystem ? "bg-purple-500/5 dark:bg-purple-500/10 text-purple-500" : "bg-apple-blue/5 dark:bg-apple-blue/10 text-apple-blue"
                    )}>
                      {isSystem ? <Terminal className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>
                    
                    <div className="absolute top-2.5 left-2.5">
                       <span className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider backdrop-blur-md border",
                        isSystem ? "bg-purple-500/15 text-purple-500 border-purple-500/20" : "bg-apple-blue/15 text-apple-blue border-apple-blue/20"
                       )}>
                         {isSystem ? 'System' : 'Admin'}
                       </span>
                    </div>
                  </div>

                  {/* Log Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#86868B] uppercase tracking-wider mb-1">
                         <Clock className="w-3 h-3 text-[#86868B]" />
                         Log ID #{log.id}
                         <span className="opacity-30">•</span>
                         <span>Actor: {log.adminId}</span>
                         <span className="opacity-30">•</span>
                         <span>{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                      </div>
                      
                      <h2 className="text-sm font-semibold text-[#1D1D1F] dark:text-white truncate block">
                        Action: <span className="font-bold text-apple-blue font-mono">{log.action.replace(/_/g, ' ')}</span>
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#86868B] font-normal">
                         <span className="font-semibold text-purple-500">Target: {log.targetType} ({log.targetId})</span>
                         <span className="opacity-30">/</span>
                         <span className="truncate max-w-[400px]">{log.details}</span>
                      </div>
                    </div>

                    {/* Bento Micro-Stats box matrix matching Seller Console layout precisely */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5">
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Origin IP</p>
                          <p className="text-xs font-bold text-[#1D1D1F] dark:text-white font-mono mt-0.5">
                            {log.ipAddress || '0.0.0.0'}
                          </p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Device/Client</p>
                          <p className="text-xs font-bold text-apple-blue truncate mt-0.5" title={log.userAgent}>
                            {log.userAgent.split('/')[0] || 'Unknown'}
                          </p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02] sm:block hidden">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Integrity check</p>
                          <p className="text-xs font-bold text-apple-green font-mono mt-0.5">Verified</p>
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
                        onClick={() => handleInspect(log)}
                        className="px-4.5 py-2 rounded-xl bg-apple-blue hover:bg-blue-600 text-white flex items-center justify-center font-semibold text-xs transition-colors"
                        title="Investigate signal"
                      >
                        Investigate
                      </button>

                      <button
                        onClick={() => {
                          toast.success("Log Exported", { description: `Log entry ${log.id} details downloaded successfully.` });
                        }}
                        className="w-8.5 h-8.5 rounded-lg bg-[#F5F5F7] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-apple-blue transition-colors"
                        title="Export Details"
                      >
                        <Download className="w-4 h-4" />
                      </button>
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
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-1">Audit Log Empty</h3>
              <p className="text-xs text-[#86868B] max-w-xs mx-auto mb-4 leading-relaxed font-normal">
                No log messages match your search criteria.
              </p>
              <button 
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery("");
                }}
                className="px-3.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold bg-white dark:bg-[#2C2C2E] hover:bg-black/5"
              >
                Reset Filter
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Control Terminal - MATCHES Seller Console Layout Precisely */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
         <div className="md:col-span-2 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center shrink-0">
               <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
               <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white mb-0.5">Automated Risk Analysis Active</h4>
               <p className="text-[11px] text-[#86868B] font-normal leading-relaxed">
                 All platform actions and admin decisions are dynamically indexed, verified via cryptographic integrity protocols, and securely synchronized in real-time.
               </p>
               <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-apple-green animate-pulse" />
                     <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868B]">Scanning Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
                     <span className="text-[9px] font-bold uppercase tracking-wider text-apple-blue">Secure Tunnel</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-center items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
            <CheckCircle2 className="w-6 h-6 text-apple-green mb-2" />
            <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">Ledger Health</h4>
            <div className="text-2xl font-bold text-[#1D1D1F] dark:text-white font-mono mt-1 mb-0.5">100.0%</div>
            <p className="text-[9px] font-bold text-apple-green uppercase tracking-widest">SLA Targets Met</p>
         </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-[92vw] lg:max-w-2xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[28px] bg-white dark:bg-[#1D1D1F] shadow-2xl flex flex-col">
          {selectedLog && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-apple-border/50 flex items-center justify-between bg-apple-gray/30 dark:bg-white/5">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-[12px] flex items-center justify-center shadow-md text-white",
                    selectedLog.adminId.startsWith('SYS_') ? "bg-purple-500" : "bg-apple-blue"
                  )}>
                    {selectedLog.adminId.startsWith('SYS_') ? <Terminal className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold tracking-tight">Forensic Log Probe</DialogTitle>
                    <DialogDescription className="text-[9px] font-medium opacity-60">Reviewing audit log {selectedLog.id}</DialogDescription>
                  </div>
                </div>
                <span className="bg-apple-green/10 text-apple-green border border-apple-green/20 px-2 py-0.5 rounded-full font-bold text-[7px] uppercase tracking-[0.1em]">
                   Verified Node
                </span>
              </div>

              <ScrollArea className="flex-1 min-h-0 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <section>
                      <h4 className="text-[7px] font-black text-apple-text-muted uppercase tracking-[0.3em] mb-1.5 px-1">Log Metadata</h4>
                      <div className="bg-apple-gray/50 dark:bg-white/5 p-3 rounded-[16px] space-y-2 shadow-inner">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[6px] font-black text-apple-text-muted uppercase tracking-[0.2em]">Log Identifier</span>
                          <span className="font-bold text-[10px] tracking-tight text-apple-text font-mono">{selectedLog.id}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[6px] font-black text-apple-text-muted uppercase tracking-[0.2em]">Authoritative Actor</span>
                          <span className="font-bold text-[10px] tracking-tight text-apple-text font-mono">{selectedLog.adminId}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[6px] font-black text-apple-text-muted uppercase tracking-[0.2em]">Protocol Action</span>
                          <span className="font-bold text-[10px] tracking-tight text-apple-text uppercase font-mono text-apple-blue">{selectedLog.action.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[6px] font-black text-apple-text-muted uppercase tracking-[0.2em]">Target Type</span>
                          <span className="font-bold text-[10px] tracking-tight text-apple-text">{selectedLog.targetType}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[6px] font-black text-apple-text-muted uppercase tracking-[0.2em]">Target Identifier</span>
                          <span className="font-bold text-[10px] tracking-tight text-apple-text font-mono">{selectedLog.targetId}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[6px] font-black text-apple-text-muted uppercase tracking-[0.2em]">Timestamp</span>
                          <span className="font-bold text-[10px] tracking-tight text-apple-text">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-4">
                    <section>
                      <h4 className="text-[7px] font-black text-apple-text-muted uppercase tracking-[0.3em] mb-1.5 px-1">Integrity Context</h4>
                      <div className="p-3 rounded-[16px] border border-apple-green/20 bg-apple-green/5 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-apple-text">Integrity Score</span>
                          <span className="text-sm font-black text-apple-green">100.0%</span>
                        </div>
                        <div className="h-1 bg-apple-gray dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-apple-green w-full" />
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[7px] font-black text-apple-text-muted uppercase tracking-[0.3em] mb-1.5 px-1">Network Signature</h4>
                      <div className="bg-apple-gray/50 dark:bg-white/5 p-3 rounded-[16px] space-y-2 shadow-inner">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[6px] font-black text-apple-text-muted uppercase tracking-[0.2em]">Origin IP</span>
                          <span className="font-bold text-[10px] tracking-tight text-apple-text font-mono">{selectedLog.ipAddress}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[6px] font-black text-apple-text-muted uppercase tracking-[0.2em]">User Agent</span>
                          <span className="font-bold text-[10px] tracking-tight text-apple-text truncate" title={selectedLog.userAgent}>{selectedLog.userAgent}</span>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[7px] font-black text-apple-text-muted uppercase tracking-[0.3em] mb-1.5 px-1">Log Description</h4>
                      <div className="p-3 rounded-[16px] bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] text-[10px] font-semibold text-apple-text leading-relaxed">
                        "{selectedLog.details}"
                      </div>
                    </section>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="p-4 border-t border-apple-border/50 bg-apple-gray/30 dark:bg-white/5 flex flex-col md:flex-row gap-2">
                <Button 
                  variant="ghost" 
                  className="rounded-xl h-10 px-4 font-black text-[8px] uppercase tracking-widest text-apple-red hover:bg-apple-red/10 active:scale-95 transition-all w-full md:w-auto"
                  onClick={() => {
                    toast.error("Signal Flagged", { description: "Signal has been flagged for deep forensic scan." });
                    setIsDetailOpen(false);
                  }}
                >
                  Flag Signal
                </Button>
                <Button 
                  className="apple-button-primary rounded-xl h-10 px-6 font-black text-[8px] uppercase tracking-widest active:scale-90 transition-all border-none w-full md:flex-1 text-white"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Acknowledge Log
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

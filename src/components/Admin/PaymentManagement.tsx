import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Wallet,
  Building,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Calendar,
  Layers,
  FileText,
  RefreshCw,
  Zap,
  Activity,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Transaction, PayoutRequest } from "@/types";

const mockTransactions: Transaction[] = [
  {
    id: 'TXN_9201',
    userId: 'u1',
    userName: 'Khurram Shehzad',
    amount: 15000,
    currency: 'PKR',
    status: 'completed',
    type: 'featured_listing',
    paymentMethod: { type: 'card', details: '**** 4242' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TXN_9202',
    userId: 'u2',
    userName: 'Luxury Motors LHR',
    amount: 45000,
    currency: 'PKR',
    status: 'pending',
    type: 'subscription',
    paymentMethod: { type: 'bank_transfer', details: 'HBL - 0019...' },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'TXN_9203',
    userId: 'u3',
    userName: 'Hamza Malik',
    amount: 2500,
    currency: 'PKR',
    status: 'completed',
    type: 'verification_fee',
    paymentMethod: { type: 'jazzcash', details: '0321****90' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'TXN_9204',
    userId: 'u4',
    userName: 'Asif Autos',
    amount: 150000,
    currency: 'PKR',
    status: 'failed',
    type: 'auction_deposit',
    paymentMethod: { type: 'card', details: '**** 9012' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  }
];

const mockPayouts: PayoutRequest[] = [
  {
    id: 'PAY_101',
    dealerId: 'd1',
    dealerName: 'Islamabad Motors',
    amount: 285000,
    status: 'pending',
    bankDetails: {
      bankName: 'Meezan Bank',
      accountTitle: 'Islamabad Motors PVT LTD',
      accountNumber: '01020304050607',
      iban: 'PK89MEZN01020304050607'
    },
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'PAY_102',
    dealerId: 'd2',
    dealerName: 'Karachi Wheelers',
    amount: 142000,
    status: 'paid',
    bankDetails: {
      bankName: 'Alfalah Bank',
      accountTitle: 'Karachi Wheelers',
      accountNumber: '9988776655',
    },
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  }
];

export default function PaymentManagement() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts'>('transactions');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredTxns = mockTransactions.filter(t => 
    t.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAction = (type: string, data: any) => {
    switch(type) {
      case 'view_details':
        setSelectedTxn(data);
        setIsDetailsOpen(true);
        break;
      case 'process_payout':
        toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
          loading: 'Initiating bank bridge transfer...',
          success: 'Funds dispatched successfully',
          error: 'Counter-party bank rejected transfer'
        });
        break;
      case 'refund':
        toast.info("Refund Protocol Initiated", {
          description: `Processing reversal for transaction ${data.id}.`
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center / Financing layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Financial Ledger
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Enterprise-grade secure clearing, transaction audits, and settlement system registers.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          {/* Segment controls */}
          <div className="flex p-0.5 bg-[#F5F5F7] dark:bg-white/5 rounded-xl border border-black/[0.04] dark:border-white/[0.04] self-start">
            <button
              onClick={() => setActiveTab('transactions')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === 'transactions'
                  ? "bg-white dark:bg-[#1C1C1E] shadow-sm text-[#1D1D1F] dark:text-white"
                  : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              )}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === 'payouts'
                  ? "bg-white dark:bg-[#1C1C1E] shadow-sm text-[#1D1D1F] dark:text-white"
                  : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              )}
            >
              Payouts
            </button>
          </div>

          <button
            onClick={() => toast.success("Ledger Exported", { description: "Q2 Reconciliation report generated in CSV." })}
            className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white hover:bg-apple-gray dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold px-4 h-9 shadow-sm transition-all flex items-center justify-center"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Financial Audit
          </button>
        </div>
      </div>

      {/* Fiscal Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross Volume', value: '₨ 4.2M', sub: '+12.5% vs Prev', icon: TrendingUp, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
          { label: 'Pending Payouts', value: '₨ 712k', sub: '9 Requests Idle', icon: Clock, color: 'text-apple-orange', bg: 'bg-apple-orange/10' },
          { label: 'Net Profit', value: '₨ 924k', sub: 'After Tax & Fees', icon: DollarSign, color: 'text-apple-green', bg: 'bg-apple-green/10' },
          { label: 'System Health', value: '99.98%', sub: 'SLA Compliant', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className={cn("p-3 rounded-xl group-hover:scale-105 transition-transform duration-500", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                Fiscal YTD
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-none">{stat.value}</div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider mt-1.5">{stat.label} — <span className="text-apple-green font-semibold">{stat.sub}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Hud with Search */}
      <div className="flex items-center justify-between gap-4 mt-6">
        <div className="relative group min-w-[200px] sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
          <input 
            type="text"
            placeholder="Query TXN ID, Entity or Method..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
        <div className="overflow-x-auto custom-scrollbar">
          {activeTab === 'transactions' ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-apple-border/10">
                  <TableHead className="py-10 pl-10 text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted">Transmission Log</TableHead>
                  <TableHead className="py-10 text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted">Clearing Entity</TableHead>
                  <TableHead className="py-10 text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted">Fiscal Value</TableHead>
                  <TableHead className="py-10 text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted">Status Engine</TableHead>
                  <TableHead className="py-10 text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted text-right pr-10">Protocols</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredTxns.map((txn, idx) => (
                    <motion.tr 
                      key={txn.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleAction('view_details', txn)}
                      className="group cursor-pointer hover:bg-apple-gray/40 dark:hover:bg-white/[0.03] border-apple-border/5 transition-all h-24"
                    >
                      <TableCell className="pl-10">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg",
                            txn.status === 'completed' ? "bg-apple-green/10 text-apple-green" : 
                            txn.status === 'failed' ? "bg-apple-red/10 text-apple-red" : "bg-apple-orange/10 text-apple-orange shadow-apple-orange/20"
                          )}>
                            {txn.status === 'completed' ? <ArrowDownLeft className="w-6 h-6" /> : 
                             txn.status === 'failed' ? <AlertCircle className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
                          </div>
                          <div>
                            <div className="font-black text-sm tracking-tight font-mono">{txn.id}</div>
                            <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mt-1">
                              {new Date(txn.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="font-bold text-sm tracking-tight">{txn.userName}</div>
                          <div className="text-[10px] font-medium text-apple-text-muted flex items-center gap-1">
                            <Layers className="w-3 h-3" /> {txn.type.replace('_', ' ')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-black text-lg tracking-tighter">{formatCurrency(txn.amount)}</div>
                        <div className="text-[10px] font-bold text-apple-blue uppercase tracking-widest">
                          via {txn.paymentMethod.type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-[0.1em] border-none shadow-sm",
                          txn.status === 'completed' ? "bg-apple-green text-white" : 
                          txn.status === 'pending' ? "bg-apple-orange text-white" : "bg-apple-red text-white"
                        )}>
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-10 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-apple-gray group/btn active:scale-90 transition-all">
                              <MoreVertical className="w-5 h-5 text-apple-text-muted group-hover/btn:text-apple-text" />
                            </Button>
                          } />
                          <DropdownMenuContent align="end" className="w-64 rounded-2xl border-apple-border/10 p-2.5 backdrop-blur-2xl bg-white/95 dark:bg-[#1D1D1F]/95 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
                            <DropdownMenuItem onClick={() => handleAction('view_details', txn)} className="rounded-xl py-3.5 px-4 font-bold text-xs cursor-pointer">
                               <FileText className="w-4 h-4 mr-3 text-apple-blue" /> View Fiscal Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl py-3.5 px-4 font-bold text-xs cursor-pointer">
                               <RefreshCw className="w-4 h-4 mr-3 text-purple-500" /> Re-verify clearing
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2 bg-apple-border/10" />
                            <DropdownMenuItem onClick={() => handleAction('refund', txn)} className="rounded-xl py-3.5 px-4 font-bold text-xs cursor-pointer text-apple-red focus:bg-apple-red/10 focus:text-apple-red">
                               <Banknote className="w-4 h-4 mr-3" /> Execute Reversal
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-apple-border/10">
                  <TableHead className="py-10 pl-10 text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted">Settlement ID</TableHead>
                  <TableHead className="py-10 text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted">Merchant Destination</TableHead>
                  <TableHead className="py-10 text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted">Gross Amount</TableHead>
                  <TableHead className="py-10 text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted">Routing Status</TableHead>
                  <TableHead className="py-10 text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted text-right pr-10">Commands</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayouts.map((payout, i) => (
                  <TableRow key={payout.id} className="h-24 hover:bg-apple-gray/40 dark:hover:bg-white/[0.03] cursor-default border-apple-border/5">
                    <TableCell className="pl-10">
                       <div className="font-black text-sm tracking-tight font-mono">{payout.id}</div>
                       <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mt-1">
                         REQ: {new Date(payout.requestedAt).toLocaleDateString()}
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                         <div className="h-10 w-10 bg-apple-blue/10 rounded-xl flex items-center justify-center text-apple-blue">
                           <Building className="w-5 h-5" />
                         </div>
                         <div>
                            <div className="font-bold text-sm tracking-tight">{payout.dealerName}</div>
                            <div className="text-[9px] font-black text-apple-text-muted uppercase tracking-[0.2em]">{payout.bankDetails.bankName}</div>
                         </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="font-black text-lg tracking-tighter">{formatCurrency(payout.amount)}</div>
                       <div className="text-[10px] font-bold text-apple-green uppercase tracking-widest">Instant Clearing Available</div>
                    </TableCell>
                    <TableCell>
                       <Badge className={cn(
                          "px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-[0.1em] border-none shadow-sm",
                          payout.status === 'paid' ? "bg-apple-green text-white" : "bg-apple-orange text-white"
                        )}>
                          {payout.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="pr-10 text-right">
                       <Button 
                         variant={payout.status === 'pending' ? 'default' : 'outline'} 
                         className={cn(
                           "rounded-xl font-bold text-[10px] h-9 uppercase tracking-widest transition-all",
                           payout.status === 'pending' ? "apple-button-primary" : "border-apple-border/20 text-apple-text-muted"
                         )}
                         onClick={() => payout.status === 'pending' && handleAction('process_payout', payout)}
                       >
                         {payout.status === 'pending' ? <><CreditCard className="w-3.5 h-3.5 mr-2" /> Dispatch Funds</> : 'Archived'}
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Transaction Precision Shard */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-4xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[#1D1D1F] shadow-2xl flex flex-col">
          {selectedTxn && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Status Header Shard */}
              <header className="p-8 lg:p-12 border-b border-apple-border/10 bg-apple-gray/40 dark:bg-white/[0.02] flex flex-col items-center text-center relative overflow-hidden shrink-0">
                 <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/5 to-purple-500/5 opacity-50" />
                 
                 <div className="relative z-10 space-y-6">
                    <div className="flex justify-center">
                       <div className="relative group">
                          <div className="absolute inset-0 bg-apple-blue/20 rounded-[32px] blur-2xl group-hover:blur-3xl transition-all duration-700" />
                          <div className="relative h-20 w-20 bg-white dark:bg-[#1D1D1F] rounded-[24px] border border-apple-border/10 flex items-center justify-center shadow-2xl">
                             <ShieldCheck className="w-10 h-10 text-apple-blue" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <h3 className="text-3xl font-black tracking-tight text-apple-text">Transaction Cleared</h3>
                       <div className="flex items-center justify-center gap-2">
                          <Badge className="bg-apple-blue/10 text-apple-blue border-none text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                             TXN: {selectedTxn.id.slice(0, 12)}
                          </Badge>
                          <Badge className="bg-apple-green/10 text-apple-green border-none text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                             {selectedTxn.status}
                          </Badge>
                       </div>
                    </div>
                 </div>
              </header>

              {/* Data Matrix Shard Area */}
              <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar bg-transparent flex flex-col gap-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-[28px] bg-apple-gray dark:bg-white/[0.03] border border-apple-border/5 group shadow-inner">
                       <div className="text-[10px] font-black text-apple-text-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                          <Activity className="w-3 h-3" /> Volume Matrix
                       </div>
                       <div className="text-5xl font-black tracking-tighter text-apple-text">
                          {formatCurrency(selectedTxn.amount)}
                       </div>
                    </div>

                    <div className="p-8 rounded-[28px] bg-apple-gray dark:bg-white/[0.03] border border-apple-border/5 group shadow-inner">
                       <div className="text-[10px] font-black text-apple-text-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                          <CreditCard className="w-3 h-3" /> Clearing Protocol
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="h-14 w-14 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-xl">
                             <Layers className="w-7 h-7 text-purple-500" />
                          </div>
                          <div className="min-w-0">
                             <div className="text-xl font-black tracking-tight text-apple-text capitalize truncate">{selectedTxn.paymentMethod.type}</div>
                             <div className="text-[10px] font-bold text-apple-text-muted">Network Confirmed</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <section className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted px-1 flex items-center gap-2">
                       <Info className="w-3 h-3" /> Ecosystem Analysis
                    </h4>
                    <div className="p-8 rounded-[32px] bg-white/70 dark:bg-white/5 border border-apple-border/10 space-y-6 backdrop-blur-3xl shadow-sm">
                       {[
                         { label: 'Origin Identity', value: selectedTxn.userName, sub: 'Verified Ecosystem Member' },
                         { label: 'Asset Logic', value: selectedTxn.type.replace('_', ' '), sub: 'Functional Shard Mutation' },
                         { label: 'Temporal Signature', value: new Date(selectedTxn.createdAt).toLocaleString(), sub: 'Node Consensus Timestamp' },
                       ].map((item, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-apple-border/5 last:border-none last:pb-0 font-serif italic">
                             <div>
                                <div className="text-[9px] font-black text-apple-text-muted uppercase tracking-[0.2em] mb-0.5">{item.label}</div>
                                <div className="text-base font-black text-apple-text capitalize tracking-tight">{item.value}</div>
                             </div>
                             <div className="text-right hidden sm:block">
                                <span className="text-[9px] font-black text-apple-blue uppercase tracking-widest">{item.sub}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </section>

                 <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <Button 
                      variant="outline" 
                      className="w-full sm:flex-1 h-12 rounded-2xl border border-apple-border/20 font-black text-[9px] uppercase tracking-[0.2em] active:scale-95 transition-all outline-none"
                      onClick={() => setIsDetailsOpen(false)}
                    >
                       Export Ledger
                    </Button>
                    <Button 
                      className="w-full sm:flex-1 h-12 rounded-2xl apple-button-primary font-black text-[9px] uppercase tracking-[0.2em] shadow-2xl active:scale-90 transition-all border-none outline-none"
                      onClick={() => setIsDetailsOpen(false)}
                    >
                       Confirm Logic
                    </Button>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldAlert, 
  UserX, 
  Flag, 
  Car,
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Download,
  Trash2,
  Ban,
  Slash,
  Eye,
  MessageCircle,
  Users,
  ShieldCheck,
  Zap,
  Activity,
  ArrowUpRight,
  ChevronRight,
  Info,
  Lock,
  Mail,
  MoreHorizontal
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "../../lib/utils";
import { Conversation, Message } from "../../types";

const mockModerationData = [
  {
    id: 'conv_1',
    participants: [
      { uid: 'u1', name: 'John Doe', photoURL: 'https://i.pravatar.cc/150?u=u1', email: 'john@example.com' },
      { uid: 'u2', name: 'Luxury Motors', photoURL: 'https://i.pravatar.cc/150?u=u2', email: 'sales@luxury.pk' }
    ],
    lastMessage: { text: "Is the price negotiable?", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    status: 'active',
    riskLevel: 'low',
    flagCount: 0,
    vehicleId: 'v_101',
    vehicleName: 'Toyota Land Cruiser 2023'
  },
  {
    id: 'conv_2',
    participants: [
      { uid: 'u3', name: 'Suspect User', photoURL: 'https://i.pravatar.cc/150?u=u3', email: 'spam@gmail.com' },
      { uid: 'u4', name: 'Common Victim', photoURL: 'https://i.pravatar.cc/150?u=u4', email: 'victim@outlook.com' }
    ],
    lastMessage: { text: "Send me your WhatsApp number for payment details. Click this link: bit.ly/spam-link", timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    status: 'flagged',
    riskLevel: 'high',
    flagCount: 3,
    vehicleId: 'v_202',
    vehicleName: 'Honda Civic RS'
  },
  {
    id: 'conv_3',
    participants: [
      { uid: 'u5', name: 'Angry Seller', photoURL: 'https://i.pravatar.cc/150?u=u5', email: 'angry@mail.com' },
      { uid: 'u6', name: 'Lowballer', photoURL: 'https://i.pravatar.cc/150?u=u6', email: 'buyer@mail.com' }
    ],
    lastMessage: { text: "Learn how to offer properly you idiot!!!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    status: 'moderated',
    riskLevel: 'medium',
    flagCount: 1,
    vehicleId: 'v_303',
    vehicleName: 'Tesla Model Y'
  }
];

const mockChatHistory: Message[] = [
  { id: 'm1', senderId: 'u3', text: "Hello, is the car still available?", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), type: 'text' },
  { id: 'm2', senderId: 'u4', text: "Yes it is. Are you interested?", timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), type: 'text' },
  { id: 'm3', senderId: 'u3', text: "Actually I want to buy it immediately. Can we move to WhatsApp?", timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(), type: 'text' },
  { id: 'm4', senderId: 'u3', text: "Click this link for quick deposit: bit.ly/spam-link", timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), type: 'text' },
];

export default function Moderation() {
  const [conversations, setConversations] = useState(mockModerationData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedConv, setSelectedConv] = useState<typeof mockModerationData[0] | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWarnOpen, setIsWarnOpen] = useState(false);

  const filtered = conversations.filter(c => {
    const names = c.participants.map(p => p.name).join(" ").toLowerCase();
    const matchesSearch = names.includes(searchQuery.toLowerCase()) || c.id.includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (type: string, conv: typeof mockModerationData[0]) => {
    setSelectedConv(conv);
    switch (type) {
      case 'inspect':
        setIsHistoryOpen(true);
        break;
      case 'warn':
        setIsWarnOpen(true);
        break;
      case 'block':
        toast.error("User Globally Restricted", {
          description: `User ${conv.participants[0].name} has been banned from the ecosystem.`
        });
        break;
      case 'resolve':
        toast.success("Moderation Resolved", {
          description: "This conversation has been cleared of all flags."
        });
        setConversations(prev => prev.map(p => p.id === conv.id ? { ...p, status: 'active', flagCount: 0, riskLevel: 'low' } : p));
        break;
    }
  };

  const sendWarning = () => {
    toast.success("Formal Warning Issued", {
      description: `A security notification has been sent to both participants.`
    });
    setIsWarnOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Flag className="w-3.5 h-3.5" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Moderation Engine
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Protecting the ecosystem from spam, fraudulent links, safety violations, and compliance incidents.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <div className="relative group min-w-[200px] sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search participant, ID or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
            />
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[var(--surface-dark)] h-9 px-4 text-xs font-bold shadow-sm hover:bg-[#F5F5F7] dark:hover:bg-white/5 text-[#1D1D1F] dark:text-white"
            onClick={() => toast.success("Transcript Exported", { description: "Current flagged reports have been archived." })}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Logs
          </Button>
          <Button 
            className="apple-button-primary bg-apple-blue text-white rounded-xl h-9 px-4 text-xs font-bold shadow-sm border-none"
            onClick={() => toast.info("Advanced Filters", { description: "Opening the AI-powered behavioral detection dashboard." })}
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> AI Oversight
          </Button>
        </div>
      </div>

      {/* Stats - EXACT match with Approval Center card format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Channels', value: '1,284', change: '+14%', icon: MessageSquare, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
          { label: 'Flagged Content', value: '42', change: '8 Critical', icon: Flag, color: 'text-apple-orange', bg: 'bg-apple-orange/10' },
          { label: 'Spam Prevented', value: '892', change: '99.9% Catch', icon: ShieldCheck, color: 'text-apple-green', bg: 'bg-apple-green/10' },
          { label: 'Banned Entities', value: '156', change: '+3 Today', icon: UserX, color: 'text-apple-red', bg: 'bg-apple-red/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className={cn("p-3 rounded-xl group-hover:scale-105 transition-transform duration-500", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className="text-[10px] font-bold text-apple-green bg-apple-green/10 px-2 py-0.5 rounded-full">
                 {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-none">{stat.value}</div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider mt-1.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter HUD - EXACT match with Approval Center tabs style */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        {['all', 'active', 'flagged', 'moderated'].map((status) => {
          const count = status === 'all' 
            ? conversations.length 
            : conversations.filter(c => c.status === status).length;
          const isActive = filterStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border",
                isActive
                  ? "bg-apple-blue text-white border-apple-blue shadow-sm"
                  : "bg-white dark:bg-[var(--surface-dark)] border-black/[0.04] dark:border-white/[0.04] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} <span className={cn("ml-1 py-0.5 px-1.5 rounded-full text-[9px] font-bold font-mono", isActive ? "bg-white/25 text-white" : "bg-[#F5F5F7] dark:bg-white/5 text-[#86868B]")}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table List - EXACT border, background and hover transition as Approval Center card */}
      <div className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-black/[0.04] dark:border-white/[0.04]">
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] pl-6">Channel Identities</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Last Transmission</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Risk Analysis</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Safety Flags</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] text-right pr-6">Command</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
              <AnimatePresence mode="popLayout">
                {filtered.map((conv, idx) => (
                  <TableRow 
                    key={conv.id}
                    onClick={() => handleAction('inspect', conv)}
                    className="group border-b border-black/[0.03] dark:border-white/[0.03] last:border-b-0 hover:bg-[#F5F5F7]/40 dark:hover:bg-white/[0.01] transition-all cursor-pointer"
                  >
                    <TableCell className="px-6 py-4 pl-6">
                      <div className="flex items-center gap-5">
                        <div className="flex -space-x-4">
                          <Avatar className="h-10 w-10 rounded-xl border-2 border-white dark:border-[var(--surface-dark)] shadow-sm group-hover:scale-105 transition-transform">
                            <AvatarImage src={conv.participants[0].photoURL} />
                            <AvatarFallback>{conv.participants[0].name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <Avatar className="h-10 w-10 rounded-xl border-2 border-white dark:border-[var(--surface-dark)] shadow-sm group-hover:scale-105 transition-transform">
                            <AvatarImage src={conv.participants[1].photoURL} />
                            <AvatarFallback>{conv.participants[1].name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <div className="font-semibold text-sm tracking-tight text-[#1D1D1F] dark:text-white">
                            {conv.participants[0].name} ↔ {conv.participants[1].name}
                          </div>
                          <div className="text-[10px] font-bold text-apple-blue uppercase tracking-wider mt-0.5">
                            Listing: {conv.vehicleName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                       <div className="max-w-[250px]">
                          <div className="text-sm font-medium text-[#1D1D1F] dark:text-white line-clamp-1">{conv.lastMessage.text}</div>
                          <div className="text-[10px] font-semibold text-[#86868B] mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                       <div className="flex flex-col gap-1.5">
                         <Badge className={cn(
                            "w-fit px-2 py-0.5 rounded-lg font-bold text-[9px] uppercase tracking-wider border-none shadow-none text-white",
                            conv.riskLevel === 'high' ? "bg-apple-red" : 
                            conv.riskLevel === 'medium' ? "bg-apple-orange" : "bg-apple-green"
                          )}>
                            {conv.riskLevel} Risk
                          </Badge>
                       </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            conv.flagCount > 0 ? "bg-apple-red animate-pulse" : "bg-[#86868B]/30"
                          )} />
                          <span className="font-semibold text-xs text-[#1D1D1F] dark:text-white">{conv.flagCount} Incident Reports</span>
                       </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <button className={cn(
                            "h-9 w-9 rounded-xl flex items-center justify-center transition-all hover:bg-[#F5F5F7] dark:hover:bg-white/10 text-[#86868B] active:scale-95"
                          )}>
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        } />
                        <DropdownMenuContent align="end" className="w-64 rounded-2xl border-black/[0.04] dark:border-white/[0.04] p-2 bg-white/95 dark:bg-[var(--surface-dark)]/95 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
                          <DropdownMenuItem onClick={() => handleAction('inspect', conv)} className="rounded-xl py-2 px-3 font-semibold text-xs cursor-pointer">
                             <Eye className="w-4 h-4 mr-3 text-apple-blue" /> Full Transcript Access
                          </DropdownMenuItem>
                          {conv.status === 'flagged' && (
                             <DropdownMenuItem onClick={() => handleAction('resolve', conv)} className="rounded-xl py-2 px-3 font-semibold text-xs cursor-pointer text-apple-green focus:bg-apple-green/10">
                                <ShieldCheck className="w-4 h-4 mr-3" /> Dismiss Safety Flags
                             </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleAction('warn', conv)} className="rounded-xl py-2 px-3 font-semibold text-xs cursor-pointer">
                             <ShieldAlert className="w-4 h-4 mr-3 text-apple-orange" /> Formal Compliance Warning
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1.5 bg-black/[0.04] dark:bg-white/[0.04]" />
                          <DropdownMenuItem className="rounded-xl py-2 px-3 font-semibold text-xs cursor-pointer">
                             <Lock className="w-4 h-4 mr-3 text-purple-500" /> Administrative Mute
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('block', conv)} className="rounded-xl py-2 px-3 font-semibold text-xs cursor-pointer text-apple-red focus:bg-apple-red/10 focus:text-apple-red">
                             <UserX className="w-4 h-4 mr-3" /> Terminal Restriction
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>      {/* Transcript Inspection Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-5xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[#1D1D1F] shadow-2xl flex flex-col">
          {selectedConv && (
            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              {/* Participant Info Sidebar */}
              <div className="w-full lg:w-[320px] border-r border-apple-border/10 flex flex-col bg-apple-gray/30 dark:bg-white/[0.02] shrink-0">
                 <div className="p-7 lg:p-9 space-y-8">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted">Entity Context</h4>
                       <div className="space-y-4">
                          {selectedConv.participants.map((p, i) => (
                             <div key={p.uid} className="flex items-center gap-3.5">
                                <Avatar className="h-11 w-11 rounded-[14px] ring-2 ring-apple-blue/10">
                                   <AvatarImage src={p.photoURL} />
                                   <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                   <div className="font-bold text-sm tracking-tight truncate">{p.name}</div>
                                   <div className="text-[9px] font-bold text-apple-text-muted truncate uppercase tracking-wider">{p.email}</div>
                                </div>
                                <div className={cn("ml-auto w-1.5 h-1.5 rounded-full shrink-0", i === 0 ? "bg-apple-blue" : "bg-purple-500")} />
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="p-5 rounded-[22px] bg-white dark:bg-white/5 border border-apple-border/10 space-y-3.5 shadow-sm">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Asset</span>
                          <Car className="w-4 h-4 text-apple-blue" />
                       </div>
                       <div className="font-bold text-xs leading-tight line-clamp-2">{selectedConv.vehicleName}</div>
                    </div>

                    <div className={cn(
                       "p-5 rounded-[22px] border flex gap-3.5 shadow-sm",
                       selectedConv.riskLevel === 'high' ? "bg-apple-red/5 border-apple-red/10" : "bg-apple-green/5 border-apple-green/10"
                    )}>
                       <div className={cn(
                          "p-2 rounded-xl shrink-0 h-fit shadow-lg",
                          selectedConv.riskLevel === 'high' ? "bg-apple-red text-white shadow-apple-red/10" : "bg-apple-green text-white shadow-apple-green/10"
                       )}>
                          <ShieldAlert className="w-4 h-4" />
                       </div>
                       <div className="space-y-1 min-w-0">
                          <div className={cn("font-bold text-[10px] uppercase tracking-wider", selectedConv.riskLevel === 'high' ? "text-apple-red" : "text-apple-green")}>
                             {selectedConv.riskLevel} Risk
                          </div>
                          <div className="text-[8px] font-medium text-apple-text-muted leading-tight">Identity verified node flagging systemic anomalies.</div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Chat Transcript Area */}
              <div className="flex-1 flex flex-col min-w-0 h-full max-h-[85vh]">
                 <header className="p-6 lg:p-8 border-b border-apple-border/10 flex items-center justify-between shrink-0 bg-white/40 dark:bg-white/5 backdrop-blur-xl">
                    <div>
                       <DialogTitle className="text-2xl font-black tracking-tight italic-serif font-serif italic">Transcript</DialogTitle>
                       <div className="text-[9px] font-bold text-apple-text-muted uppercase tracking-[0.2em] mt-1 shadow-sm">Sync Active - Shard 102</div>
                    </div>
                 </header>

                 <div className="flex-1 overflow-hidden min-h-0">
                    <ScrollArea className="h-full">
                       <div className="p-7 lg:p-10 space-y-7">
                          {mockChatHistory.map((m, i) => {
                             const isSender0 = m.senderId === selectedConv.participants[0].uid;
                             return (
                                <div key={m.id} className={cn(
                                   "flex flex-col max-w-[85%] space-y-2",
                                   isSender0 ? "mr-auto" : "ml-auto items-end"
                                )}>
                                   <div className="flex items-center gap-2 px-1">
                                      <span className="text-[8px] font-black uppercase tracking-wider text-apple-text-muted">
                                         {isSender0 ? selectedConv.participants[0].name.split(' ')[0] : selectedConv.participants[1].name.split(' ')[0]}
                                      </span>
                                      <span className="text-[8px] font-bold text-apple-text-muted opacity-40">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                   </div>
                                   <div className={cn(
                                      "px-4 py-3 rounded-[20px] text-[13px] font-medium shadow-sm transition-all hover:scale-[1.01] cursor-default leading-relaxed",
                                      isSender0 ? "bg-apple-blue/10 text-apple-text rounded-tl-sm border border-apple-blue/10" : "bg-plum-500/10 dark:bg-apple-purple/10 text-apple-text rounded-tr-sm border border-apple-purple/10",
                                      m.text.includes("bit.ly") && "bg-apple-red/10 text-apple-red border-apple-red/20 animate-pulse"
                                   )}>
                                      {m.text}
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                    </ScrollArea>
                 </div>

                 <footer className="p-6 border-t border-apple-border/10 bg-apple-gray/10 dark:bg-white/[0.02] grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                    <Button 
                      variant="outline" 
                      className="rounded-xl h-12 border-apple-border/20 font-black text-[9px] uppercase tracking-[0.2em] bg-white dark:bg-white/5 active:scale-95 transition-all text-apple-orange hover:bg-apple-orange/5 border-none outline-none" 
                      onClick={() => handleAction('warn', selectedConv)}
                    >
                       Warning
                    </Button>
                    <Button 
                      variant="outline" 
                      className="rounded-xl h-12 border-apple-border/20 font-black text-[9px] uppercase tracking-[0.2em] bg-white dark:bg-white/5 active:scale-95 transition-all text-apple-red hover:bg-apple-red/5 border-none outline-none" 
                      onClick={() => handleAction('block', selectedConv)}
                    >
                       Restrict
                    </Button>
                    <Button 
                      className="apple-button-primary rounded-xl h-12 font-black text-[9px] uppercase tracking-[0.2em] shadow-2xl active:scale-90 transition-all border-none text-white outline-none" 
                      onClick={() => handleAction('resolve', selectedConv)}
                    >
                       Clear
                    </Button>
                 </footer>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Warning Dialog */}
      <Dialog open={isWarnOpen} onOpenChange={setIsWarnOpen}>
        <DialogContent className="max-w-[320px] rounded-[32px] border-apple-border/20 bg-white dark:bg-[#1D1D1F] p-8 overflow-hidden">
          <div className="text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-apple-orange/10 flex items-center justify-center mx-auto mb-6">
               <ShieldAlert className="w-8 h-8 text-apple-orange" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight mb-3 text-apple-orange">Intervention</DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-apple-text-muted mb-8 leading-relaxed">
               Issue formal warning to participants of channel <span className="text-apple-text font-bold">{selectedConv?.id}</span>. Entry is permanent.
            </DialogDescription>
            <div className="grid grid-cols-1 gap-3">
               <Button className="rounded-xl h-12 bg-apple-orange text-white font-bold text-sm hover:bg-apple-orange/90 shadow-lg border-none active:scale-95 transition-all" onClick={sendWarning}>
                  Confirm Warning
               </Button>
               <Button variant="ghost" className="rounded-xl h-10 font-bold text-xs text-apple-text-muted active:scale-95 transition-all" onClick={() => setIsWarnOpen(false)}>
                  Cancel Operation
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

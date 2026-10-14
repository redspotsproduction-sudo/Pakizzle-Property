import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../../context/ThemeContext";
import { 
  Settings, 
  ShieldCheck, 
  Bell, 
  Globe, 
  Lock, 
  Save, 
  RotateCcw,
  Search,
  Monitor,
  Moon,
  Sun,
  Key,
  Mail,
  Smartphone,
  Cpu,
  Sliders,
  Sparkles,
  Activity,
  Terminal,
  Phone,
  Database,
  Ban,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const Label = ({ children, className, ...props }: any) => (
  <label className={cn("text-[10px] font-bold uppercase tracking-wider text-apple-text-muted mb-1.5 block", className)} {...props}>
    {children}
  </label>
);

export default function AdminSettings() {
  const { themeMode, setThemeMode } = useTheme();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Configuration Synced", {
        description: "Global system parameters have been updated across all nodes.",
        icon: <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
      });
    }, 1500);
  };

  const navItems = [
    { id: 'general', label: 'Governance', icon: Sliders },
    { id: 'security', label: 'Protocol', icon: ShieldCheck },
    { id: 'notifications', label: 'Relays', icon: Bell },
    { id: 'interface', label: 'Sensory', icon: Monitor },
    { id: 'infrastructure', label: 'Nodes', icon: Cpu },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Unified Admin Header - MATCHES financing capital header exactly */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Settings className="w-3.5 h-3.5 text-apple-blue" />
            Governance & System Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            System Settings
          </h1>
          <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Configure high-level system orchestration, security protocols, and visual sensory archetypes.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <Button variant="ghost" className="rounded-xl font-bold text-xs uppercase tracking-widest px-6 h-10 hover:bg-black/[0.04] dark:hover:bg-white/5 transition-all flex items-center gap-2" onClick={() => toast.info("System Check Initiated")}>
            <Activity className="w-4 h-4" /> Diagnostic
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-bold text-xs uppercase tracking-widest px-8 h-10 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" /> Syncing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Config
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Navigation Panel */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-apple-blue transition-colors duration-300" />
            <input 
              placeholder="Search sections..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-inset)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
            />
          </div>

          <nav className="p-1.5 bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex lg:flex-col overflow-x-auto no-scrollbar gap-1">
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl lg:w-full text-left py-2.5 px-4 transition-all duration-300 shrink-0 text-xs font-semibold uppercase tracking-wider",
                  activeTab === item.id 
                    ? "bg-white dark:bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm" 
                    : "text-apple-text-muted hover:text-apple-text dark:hover:text-apple-gray"
                )}
              >
                <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-[var(--accent)]" : "text-apple-text-muted")} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[var(--bg-surface)] space-y-4 hidden lg:block">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-apple-text-muted">System Stability</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              All system nodes are operating within optimal latency parameters. Sync status: 100%
            </p>
            <div className="h-1 w-full bg-apple-gray dark:bg-apple-surface rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="h-full bg-[var(--success)]" 
              />
            </div>
          </div>
        </aside>

        {/* Right Main Content Configuration Panel */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-8 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300"
            >
              {/* Governance Section */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] dark:text-apple-gray">Platform Governance</h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Define platform identity parameters and default currencies.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1.5">
                      <Label>Platform Global Alias</Label>
                      <input 
                        type="text"
                        defaultValue="AutoHedge Pakistan" 
                        className="w-full h-10 px-4 bg-[var(--bg-inset)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-semibold focus:ring-0 outline-none transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Sovereign Base Currency</Label>
                      <Select defaultValue="pkr">
                        <SelectTrigger className="h-10 rounded-xl bg-[var(--bg-inset)] dark:bg-white/5 border-transparent text-xs font-semibold">
                          <SelectValue placeholder="Select Base Currency" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-black/[0.04] bg-white dark:bg-[var(--bg-surface)]">
                          <SelectItem value="pkr" className="text-xs py-2">PKR (Pakistani Rupee)</SelectItem>
                          <SelectItem value="usd" className="text-xs py-2">USD (United States Dollar)</SelectItem>
                          <SelectItem value="aed" className="text-xs py-2">AED (UAE Dirham)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-apple-surface dark:bg-apple-text border border-black/[0.02] dark:border-white/[0.02] flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[var(--accent)]/10 rounded-xl text-[var(--accent)]">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--text-primary)] dark:text-apple-gray">Maintenance Protocol</h4>
                        <p className="text-[10px] text-apple-text-muted mt-0.5">Broadcast platform updates and restrict general public access.</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Sovereign Support Endpoint</Label>
                    <input 
                      type="email"
                      defaultValue="governance@autohedge.pk" 
                      className="w-full h-10 px-4 bg-[var(--bg-inset)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-semibold focus:ring-0 outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Protocol Section */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] dark:text-apple-gray">Hardened Security Protocols</h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Configure advanced authorization gates and multi-factor validation.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {[
                      { title: 'Global Multi-Factor Protocol', desc: 'Require biometric or hardware token keys for administrator console login.', icon: Key, enabled: true },
                      { title: 'Temporal Session Hardening', desc: 'Auto-expire admin sessions after 4 hours of idle operations.', icon: Lock, enabled: true },
                      { title: 'Regional Geo-Fencing', desc: 'Strictly white-list designated geographic subnets for backend execution.', icon: Globe, enabled: false },
                    ].map((item, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-apple-surface dark:bg-apple-text border border-black/[0.02] dark:border-white/[0.02] flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-apple-border/50 dark:bg-apple-surface rounded-xl text-apple-text-muted dark:text-apple-border">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-[var(--text-primary)] dark:text-apple-gray">{item.title}</h4>
                            <p className="text-[10px] text-apple-text-muted mt-0.5 max-w-md leading-normal">{item.desc}</p>
                          </div>
                        </div>
                        <Switch defaultChecked={item.enabled} />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-wider border-apple-border dark:border-apple-surface hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/10 transition-all">
                      Reset Credentials
                    </Button>
                    <Button className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white h-10 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all">
                      Rotate Master Tokens
                    </Button>
                  </div>
                </div>
              )}

              {/* Interface Section */}
              {activeTab === 'interface' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] dark:text-apple-gray">Sensory Archetypes</h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Configure user interface preferences and graphic acceleration systems.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {[
                      { id: 'light' as const, label: 'Luminous', desc: 'Light Cream (#FAF3E6)', icon: Sun, color: 'bg-white text-apple-text border-apple-border dark:bg-apple-surface dark:text-white dark:border-white/10' },
                      { id: 'dark' as const, label: 'Nocturnal', desc: 'True Black (#000000)', icon: Moon, color: 'bg-black text-white border-white/20' },
                      { id: 'system' as const, label: 'Adaptive', desc: 'System OS Sync', icon: Monitor, color: 'bg-gradient-to-br from-white to-[var(--bg-inset)] text-apple-text border-apple-border dark:border-white/10' },
                    ].map((theme) => {
                      const isSelected = themeMode === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            setThemeMode(theme.id);
                            toast.success(`Theme switched to ${theme.label} (${theme.id})`);
                          }}
                          className={cn(
                            "h-28 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden group cursor-pointer",
                            theme.color,
                            isSelected 
                              ? "ring-2 ring-[var(--accent)] border-transparent scale-[1.02] shadow-md" 
                              : "hover:scale-[1.01] opacity-75 hover:opacity-100 duration-300 shadow-sm"
                          )}
                        >
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                          )}
                          <theme.icon className="w-5 h-5 relative z-10" />
                          <div className="text-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider block relative z-10">{theme.label}</span>
                            <span className="text-[9px] text-apple-text-muted font-medium block">{theme.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between p-4 bg-apple-surface dark:bg-apple-text rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                          <RotateCcw className="w-5 h-5 animate-spin duration-1000" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-[var(--text-primary)] dark:text-apple-gray">Dynamic Motion</h4>
                          <p className="text-[10px] text-apple-text-muted mt-0.5">Toggle fluid transitions and state change visualizers globally.</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-apple-surface dark:bg-apple-text rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--accent)]/10 rounded-xl text-[var(--accent)]">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-[var(--text-primary)] dark:text-apple-gray">Crystalline Layering</h4>
                          <p className="text-[10px] text-apple-text-muted mt-0.5">Activate delicate glassmorphism backdrops on overlays and drawers.</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              )}

              {/* Infrastructure Section */}
              {activeTab === 'infrastructure' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] dark:text-apple-gray">System Nodes & Edge Engines</h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Review active database and high-performance cloud storage instances.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {[
                      { label: 'Compute Shard', value: 'GCP Cloud Run', sub: 'Autoscaling [ON]', icon: Terminal },
                      { label: 'Primary Datastore', value: 'Firestore Global', sub: 'Active sync replication', icon: Database },
                      { label: 'Network Edge', value: 'CDN [64 Clusters]', sub: '7ms global latency', icon: Globe },
                      { label: 'AI Cognition Core', value: 'Gemini Sovereign 1.5', sub: 'Models responding', icon: Sparkles },
                    ].map((node, i) => (
                      <div 
                        key={i} 
                        className="p-5 rounded-2xl bg-apple-surface dark:bg-apple-text border border-black/[0.02] dark:border-white/[0.02] flex items-center gap-4"
                      >
                        <div className="p-3.5 bg-white dark:bg-apple-surface rounded-xl text-apple-text-muted dark:text-apple-border shadow-sm shrink-0">
                          <node.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-apple-text-muted uppercase tracking-wider mb-0.5">{node.label}</div>
                          <div className="font-semibold text-xs text-[var(--text-primary)] dark:text-white">{node.value}</div>
                          <div className="text-[9px] font-bold text-[var(--success)] flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                            {node.sub}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] scale-150 rotate-12 group-hover:scale-[1.8] group-hover:rotate-[-5deg] transition-all duration-1000 pointer-events-none">
                      <Ban className="w-32 h-32 text-red-500" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
                        <h4 className="text-[9px] font-bold uppercase tracking-wider text-red-500">Danger Shard Purge</h4>
                      </div>
                      <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Atomic Shard Purge Protocol</h3>
                      <p className="text-xs text-apple-text-muted leading-normal max-w-xl">
                        Executing this command will instantly flush all temporary records, logs, and sandbox testing instances back to genesis defaults. This is a non-reversible action.
                      </p>
                      <Button variant="outline" className="h-9 px-6 rounded-xl border-red-500/20 text-red-500 font-bold text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all duration-500">
                        Initiate Purge Sequence
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Relays Section */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] dark:text-apple-gray">Relay Systems & Alert Dispatch</h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Coordinate how critical operational alerts are routed to your staff.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {[
                      { title: 'Slack Intelligence Relay', desc: 'Route high-impact server health events to the #operations channel.', status: 'Connected', icon: Terminal },
                      { title: 'Daily Digest Broadcasts', desc: 'Send daily performance snapshots to the administration email group.', status: 'Authorized', icon: Mail },
                      { title: 'System Push Relays', desc: 'Direct secure system warnings via Apple Push Notifications.', status: 'Active', icon: Smartphone },
                      { title: 'SMS Failover Service', desc: 'Direct emergency notification channel via cellular fallback.', status: 'Standby', icon: Phone },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-apple-surface dark:bg-apple-text border border-black/[0.02] dark:border-white/[0.02] group hover:border-black/[0.06] dark:hover:border-white/[0.06] transition-all duration-500">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-apple-surface flex items-center justify-center text-apple-text-muted group-hover:text-apple-blue transition-all shadow-sm">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-[var(--text-primary)] dark:text-apple-gray">{item.title}</h4>
                            <p className="text-[10px] text-apple-text-muted mt-0.5 max-w-sm leading-normal">{item.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-apple-blue/10 text-apple-blue border-none text-[8px] font-bold uppercase tracking-wider px-3 h-6 rounded-full flex items-center justify-center">{item.status}</Badge>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

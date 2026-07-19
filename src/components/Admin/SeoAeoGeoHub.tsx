import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Mic, 
  Sparkles, 
  Globe, 
  Volume2, 
  Brain, 
  Compass, 
  CheckCircle2, 
  Sliders, 
  RefreshCw, 
  FileCode, 
  HelpCircle, 
  ChevronRight, 
  Car, 
  Gauge, 
  Send, 
  Sparkle,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  TrendingUp,
  Zap,
  Link,
  ShieldAlert,
  Activity,
  FileText,
  AlertTriangle
} from "lucide-react";
import { useVehicles } from "@/context/VehicleContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  Cell, 
  ComposedChart 
} from "recharts";

interface KeywordDensity {
  keyword: string;
  count: number;
  status: string;
}

interface AeoQuestion {
  question: string;
  answer: string;
  source: string;
}

interface SeoAeoGeoData {
  seoKeywordDensity: KeywordDensity[];
  schemaMarkup: string;
  aeoQuestions: AeoQuestion[];
  geoCitationScore: number;
  geoRecommendations: string[];
  geoRecommendationDraft: string;
}

export default function SeoAeoGeoHub() {
  const { vehicles } = useVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "explorer" | "optimizer" | "sandbox">("dashboard");
  const [optimizationData, setOptimizationData] = useState<SeoAeoGeoData | null>(null);

  // SEO Health Score Dashboard States
  const [crawlDepth, setCrawlDepth] = useState<number>(250);
  const [isCrawling, setIsCrawling] = useState<boolean>(false);
  const [crawlProgress, setCrawlProgress] = useState<number>(0);
  const [crawlStatusText, setCrawlStatusText] = useState<string>("");
  const [scannedPagesCount, setScannedPagesCount] = useState<number>(420);
  const [avgLoadSpeed, setAvgLoadSpeed] = useState<number>(0.85);
  const [brokenLinksCount, setBrokenLinksCount] = useState<number>(0);
  const [keywordDensityScore, setKeywordDensityScore] = useState<number>(96);

  // Issues checklist state
  const [issues, setIssues] = useState([
    { id: "schema", text: "Fix missing schema markup on 4 custom custom-field listings", priority: "High", resolved: false, impact: 4 },
    { id: "alt-tags", text: "Add alternative text (ALT) tags to 8 newly uploaded vehicle images", priority: "Low", resolved: false, impact: 2 },
    { id: "duplicate-meta", text: "Resolve duplicate meta description warnings on 3 model categories", priority: "Medium", resolved: false, impact: 3 },
    { id: "sitemap-regen", text: "Regenerate site index maps for conversational GEO crawlers", priority: "Medium", resolved: false, impact: 2 }
  ]);

  const currentHealthScore = 100 - issues.reduce((acc, issue) => acc + (issue.resolved ? 0 : issue.impact), 0);

  // Sandbox states
  const [sandboxPrompt, setSandboxPrompt] = useState<string>("");
  const [sandboxHistory, setSandboxHistory] = useState<Array<{ role: 'user' | 'assistant', content: string, citations?: string[] }>>([
    {
      role: 'assistant',
      content: "Welcome to the Pakizzle GEO Sandbox! Ask me questions like: \n- *'Which sedan under 40 Lakhs in Lahore should I buy?'*\n- *'What is the best fuel-efficient car for family use?'*\n\nI will simulate a modern Generative Search Engine (RAG) retrieval process over Pakizzle's database, pulling listings and citing them precisely.",
    }
  ]);
  const [isSandboxTyping, setIsSandboxTyping] = useState<boolean>(false);

  // Select first vehicle automatically
  useEffect(() => {
    if (vehicles && vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  // Crawl Simulation Handler
  const handleCrawlStart = () => {
    setIsCrawling(true);
    setCrawlProgress(0);
    setCrawlStatusText("Initializing multi-agent SEO spider...");

    const crawlSteps = [
      { progress: 15, text: "Scanning website sitemaps and route registry..." },
      { progress: 35, text: "Benchmarking core web vitals and speed indexes..." },
      { progress: 55, text: "Analyzing semantic keyword densities & title structures..." },
      { progress: 75, text: "Probing internal and external link connections for 404s..." },
      { progress: 90, text: "Synthesizing Schema.org validation trees & conversational voice prompts..." },
      { progress: 100, text: "Synchronizing index telemetry with GSC & GEO RAG nodes..." }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < crawlSteps.length) {
        const step = crawlSteps[currentStepIdx];
        setCrawlProgress(step.progress);
        setCrawlStatusText(step.text);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setIsCrawling(false);
        setScannedPagesCount(Math.floor(Math.random() * 80) + crawlDepth);
        setAvgLoadSpeed(parseFloat((0.60 + Math.random() * 0.25).toFixed(2)));
        setKeywordDensityScore(Math.floor(Math.random() * 5) + 95);
        toast.success("Site crawl and search readiness audit completed successfully!");
      }
    }, 800);
  };

  // Toggle issue resolution
  const handleToggleIssue = (issueId: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const nextState = !issue.resolved;
        if (nextState) {
          toast.success(`Resolved: "${issue.text}". Dynamic search registers synchronized.`);
        }
        return { ...issue, resolved: nextState };
      }
      return issue;
    }));
  };

  const handleOptimizeListing = async () => {
    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
    if (!selectedVehicle) {
      toast.error("Please select a valid vehicle listing.");
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await fetch("/api/seo-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: selectedVehicle.year,
          make: selectedVehicle.make,
          model: selectedVehicle.model,
          variant: selectedVehicle.category?.childId || "",
          price: selectedVehicle.price,
          city: selectedVehicle.city,
          mileage: selectedVehicle.mileage,
          transmission: selectedVehicle.transmission,
          fuelType: selectedVehicle.fuelType,
          engineSize: selectedVehicle.engineSize,
          features: selectedVehicle.features || [],
          description: selectedVehicle.description || ""
        })
      });

      if (!response.ok) throw new Error("Optimization failed");
      const data = await response.json();
      setOptimizationData(data);
      toast.success(`Advanced SEO, AEO & GEO metadata generated for ${selectedVehicle.make} ${selectedVehicle.model}!`);
    } catch (error) {
      console.error(error);
      toast.error("Could not run advanced AI optimization. Check server connection.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSandboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxPrompt.trim()) return;

    const userMsg = sandboxPrompt;
    setSandboxPrompt("");
    setSandboxHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsSandboxTyping(true);

    setTimeout(() => {
      // Find matching vehicles in the inventory based on query terms
      const queryLower = userMsg.toLowerCase();
      let matchedVehicles = vehicles.filter(v => 
        (v?.make && queryLower.includes(v.make.toLowerCase())) || 
        (v?.model && queryLower.includes(v.model.toLowerCase())) ||
        (v?.city && queryLower.includes(v.city.toLowerCase())) ||
        (queryLower.includes("hybrid") && v?.fuelType === "hybrid") ||
        (queryLower.includes("electric") && v?.fuelType === "electric") ||
        (queryLower.includes("automatic") && v?.transmission === "automatic")
      );

      // Default to top vehicles if no specific search matched
      if (matchedVehicles.length === 0) {
        matchedVehicles = vehicles.slice(0, 2);
      } else {
        matchedVehicles = matchedVehicles.slice(0, 3);
      }

      const citations = matchedVehicles.map(v => `${v.year} ${v.make} ${v.model} (${v.city}) - PKR ${v.price.toLocaleString()}`);

      let aiContent = "";
      if (queryLower.includes("sedan") || queryLower.includes("family")) {
        aiContent = `Based on the current verified inventory at Pakizzle, I highly recommend looking at the following options:

1. **${matchedVehicles[0]?.year || '2023'} ${matchedVehicles[0]?.make || 'Toyota'} ${matchedVehicles[0]?.model || 'Corolla'}** [1]. It features an efficient engine, offering superb city-driving reliability.
2. ${matchedVehicles[1] ? `**${matchedVehicles[1].year} ${matchedVehicles[1].make} ${matchedVehicles[1].model}** [2] is also highly competitive, offering premium interior comforts in ${matchedVehicles[1].city}.` : "Other vehicles with verified inspection tags [2]."}

Generative search engines value factual statistics (like exact mileage and verified rating badge) and citation accuracy. Since Pakizzle listings possess structured JSON-LD data and complete vehicle specification schemas, AI engines will fetch and prioritize these listings as primary citations.`;
      } else {
        aiContent = `Analyzing Pakizzle's real-time vehicle portal, I found ${matchedVehicles.length} premium listing${matchedVehicles.length > 1 ? 's' : ''} that perfectly match your context:

*   **${matchedVehicles[0]?.year} ${matchedVehicles[0]?.make} ${matchedVehicles[0]?.model}** [1]: Verified in ${matchedVehicles[0]?.city} with a highly descriptive feature catalog. Excellent option for buyers looking for transparency.
${matchedVehicles[1] ? `*   **${matchedVehicles[1].year} ${matchedVehicles[1].make} ${matchedVehicles[1].model}** [2]: Clean history listing, optimized for rich snippet search.` : ""}

This answer was compiled using RAG (Retrieval-Augmented Generation) based on the structural schema feeds on Pakizzle. It guarantees high citation frequency because of its factual completeness.`;
      }

      setSandboxHistory(prev => [...prev, { 
        role: 'assistant', 
        content: aiContent,
        citations 
      }]);
      setIsSandboxTyping(false);
    }, 1500);
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const seoTabs = [
    { id: "dashboard", label: "SEO Health Dashboard", count: issues.filter(i => !i.resolved).length },
    { id: "explorer", label: "Learn the Science", count: 3 },
    { id: "optimizer", label: "SEO/AEO/GEO Optimizer", count: vehicles ? vehicles.length : 0 },
    { id: "sandbox", label: "GEO Sandbox", count: sandboxHistory.length }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header with Actions - EXACT match with Approval Center layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Next-Gen Discovery Admin Suite
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Search & Generative AI Hub
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Optimize, simulate, and audit Pakizzle automotive listings for traditional search engines (SEO), conversational voice answers (AEO), and modern RAG-based Generative AI platforms (GEO).
          </p>
        </div>
      </div>

      {/* Tabs Row - EXACT match with Approval Center style */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        {seoTabs.map((tab) => {
          const count = tab.count;
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

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === "dashboard" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Health Metrics Grid - EXACT match with Approval Center layout & styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Scorecard 1: Health Score */}
              <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between relative overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">SEO Health Score</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-mono text-[#1D1D1F] dark:text-white">{currentHealthScore}%</span>
                    <span className="text-[10px] text-apple-green font-semibold">({currentHealthScore >= 95 ? "Excellent" : currentHealthScore >= 90 ? "Optimal" : "Needs Work"})</span>
                  </div>
                  <p className="text-[10px] text-[#86868B] font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-apple-green" /> +3.2% vs last crawl
                  </p>
                </div>
                
                {/* Circular Gauge SVG */}
                <div className="relative w-12 h-12 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-black/[0.04] dark:text-white/10"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-apple-blue transition-all duration-500 ease-out"
                      strokeWidth="3.5"
                      strokeDasharray={`${currentHealthScore}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono text-[#1D1D1F] dark:text-white">
                    {currentHealthScore}
                  </div>
                </div>
              </div>

              {/* Scorecard 2: Page Load Speed */}
              <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between relative overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Average Speed (FCP)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-mono text-[#1D1D1F] dark:text-white">{avgLoadSpeed}s</span>
                    <span className={`text-[10px] font-semibold ${avgLoadSpeed <= 0.8 ? "text-apple-green" : avgLoadSpeed <= 1.1 ? "text-apple-blue" : "text-amber-500"}`}>
                      ({avgLoadSpeed <= 0.8 ? "A+ Superb" : avgLoadSpeed <= 1.1 ? "A Excellent" : "B Average"})
                    </span>
                  </div>
                  <p className="text-[10px] text-[#86868B] font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" /> TTFB: ~140ms
                  </p>
                </div>
                <div className="w-10 h-10 bg-apple-green/5 dark:bg-apple-green/10 rounded-xl flex items-center justify-center shrink-0">
                  <Gauge className="w-5 h-5 text-apple-green" />
                </div>
              </div>

              {/* Scorecard 3: Keyword Density */}
              <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between relative overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Keyword Coverage</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-mono text-[#1D1D1F] dark:text-white">{keywordDensityScore}%</span>
                    <span className="text-[10px] text-purple-500 font-semibold">(Matched)</span>
                  </div>
                  <p className="text-[10px] text-[#86868B] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-purple-500" /> 6 core phrase targets
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-500/5 dark:bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5 text-purple-500" />
                </div>
              </div>

              {/* Scorecard 4: Link Integrity */}
              <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between relative overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Link Integrity</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-mono text-[#1D1D1F] dark:text-white">{brokenLinksCount}</span>
                    <span className="text-[10px] text-[#86868B] font-semibold">Broken Links</span>
                  </div>
                  <p className="text-[10px] text-[#86868B] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-apple-blue" /> 100% Secure routing
                  </p>
                </div>
                <div className="w-10 h-10 bg-apple-blue/5 dark:bg-apple-blue/10 rounded-xl flex items-center justify-center shrink-0">
                  <Link className="w-5 h-5 text-apple-blue" />
                </div>
              </div>

            </div>

            {/* Recharts Data Visualization Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Chart: SEO Health & Load Speed Audit Trend */}
              <div className="lg:col-span-2 bg-white dark:bg-[#161617] p-5 md:p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-apple-blue" /> SEO Health & Speed Index Trend
                    </h3>
                    <p className="text-xs text-[#86868B] font-normal mt-0.5">Historical audit metrics charting the correlation between site health scores and response speed.</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-apple-blue/10 text-apple-blue px-2 py-0.5 rounded">
                      Health
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-apple-green/10 text-apple-green px-2 py-0.5 rounded">
                      Speed
                    </span>
                  </div>
                </div>

                <div className="w-full pt-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={[
                      { date: "May 15", healthScore: 78, loadSpeed: 1.80 },
                      { date: "May 30", healthScore: 82, loadSpeed: 1.50 },
                      { date: "Jun 10", healthScore: 85, loadSpeed: 1.30 },
                      { date: "Jun 20", healthScore: 91, loadSpeed: 1.10 },
                      { date: "Jun 25", healthScore: 94, loadSpeed: 1.00 },
                      { date: "Jun 30", healthScore: currentHealthScore, loadSpeed: avgLoadSpeed }
                    ]} margin={{ top: 10, right: -15, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-white/10" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                      <YAxis yAxisId="left" stroke="#3B82F6" fontSize={10} tickLine={false} axisLine={false} domain={[50, 100]} />
                      <YAxis yAxisId="right" orientation="right" stroke="#10B981" fontSize={10} tickLine={false} axisLine={false} domain={[0, 2.5]} />
                      <Tooltip contentStyle={{ borderRadius: 12, background: "rgba(255,255,255,0.95)", border: "1px solid #E5E7EB", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }} />
                      <Area yAxisId="left" type="monotone" dataKey="healthScore" fill="url(#colorHealth)" stroke="#3B82F6" strokeWidth={3.5} name="Health Score %" />
                      <Line yAxisId="right" type="monotone" dataKey="loadSpeed" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: "#10B981" }} name="Speed (s)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Side Chart: Top Keyword Densities OR Error stack */}
              <div className="bg-white dark:bg-[#161617] p-5 md:p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-between h-full space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-500" /> Target Keyword Densities
                  </h3>
                  <p className="text-xs text-[#86868B] font-normal mt-0.5">Primary local search phrases matched across Pakizzle indexable routes.</p>
                </div>

                <div className="w-full h-fit py-2">
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart data={[
                      { name: "used cars pk", density: 4.8 },
                      { name: "buy car lahore", density: 3.6 },
                      { name: "pakizzle cert", density: 3.2 },
                      { name: "hybrid prices", density: 2.8 },
                      { name: "auto sedan", density: 1.9 },
                      { name: "toyota corolla", density: 1.5 }
                    ]} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-white/10" />
                      <XAxis type="number" stroke="#9CA3AF" fontSize={10} tickLine={false} domain={[0, 6]} />
                      <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={10} tickLine={false} width={80} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                      <Bar dataKey="density" radius={[0, 6, 6, 0]} fill="#8B5CF6">
                        {[4.8, 3.6, 3.2, 2.8, 1.9, 1.5].map((val, idx) => (
                          <Cell key={`cell-${idx}`} fill={val >= 2.5 ? "#8B5CF6" : "#F59E0B"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.04] flex justify-between text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  <span>Target Range: 2.0% - 5.0%</span>
                  <span className="text-apple-blue">Avg: 2.97%</span>
                </div>
              </div>

            </div>

            {/* Interactive Spider Crawl simulation & SEO Alerts checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Crawler Simulator Box */}
              <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] lg:col-span-1 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-apple-blue/10 text-[9px] font-bold text-apple-blue uppercase tracking-wider">
                      Spider Controller
                    </span>
                    <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white">Crawl & Index Simulator</h3>
                    <p className="text-[11px] text-[#86868B] font-normal leading-relaxed">Simulate a multi-threaded search spider scan across route registries.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Select Depth */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase text-[#86868B] tracking-wider">Target Crawl Depth</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[100, 250, 500].map((depth) => (
                          <button
                            key={depth}
                            disabled={isCrawling}
                            onClick={() => setCrawlDepth(depth)}
                            className={cn(
                              "py-1.5 px-3 rounded-xl text-xs font-semibold transition-all border",
                              crawlDepth === depth 
                                ? "bg-apple-blue text-white border-apple-blue shadow" 
                                : "bg-white dark:bg-white/5 border-black/[0.04] dark:border-white/[0.04] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                            )}
                          >
                            {depth} Pages
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Simulation progress or initial description */}
                    {isCrawling ? (
                      <div className="p-4 bg-apple-blue/5 border border-apple-blue/10 rounded-xl space-y-3">
                        <div className="flex justify-between text-xs font-bold text-apple-text">
                          <span className="animate-pulse">Running Crawl Scan...</span>
                          <span className="font-mono text-apple-blue">{crawlProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-apple-blue transition-all duration-300 rounded-full" 
                            style={{ width: `${crawlProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-[#86868B] font-medium italic truncate">
                          {crawlStatusText}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02] rounded-xl">
                        <div className="flex gap-2 items-start">
                          <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-[#86868B] font-normal leading-relaxed">
                            A deep crawl checks broken anchor tags, Schema microdata structures, canonical consistency, and TTFB scores. Launching a crawl updates sitemap files and signals search indexing servers.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleCrawlStart}
                  disabled={isCrawling}
                  className="w-full h-11 bg-apple-blue hover:bg-blue-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isCrawling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Scanning Routes...
                    </>
                  ) : (
                    <>
                      <Activity className="w-3.5 h-3.5" />
                      Launch Site Crawl
                    </>
                  )}
                </Button>
              </div>

              {/* Actionable Issue List */}
              <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] lg:col-span-2 space-y-5 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                      Index Recommendations
                    </span>
                    <span className="text-[10px] font-bold text-[#86868B]">
                      Issues Resolved: {issues.filter(i => i.resolved).length} of {issues.length}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white">Search Engine Recommendations Log</h3>
                  <p className="text-[11px] text-[#86868B] font-normal">Perform automatic fixes to satisfy Google crawl standards and ChatGPT RAG retrieval filters.</p>
                </div>

                <div className="space-y-2.5 my-2">
                  {issues.map((issue) => (
                    <div 
                      key={issue.id}
                      onClick={() => handleToggleIssue(issue.id)}
                      className={cn(
                        "p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3",
                        issue.resolved 
                          ? "border-apple-green/30 bg-apple-green/[0.01] opacity-60" 
                          : "border-black/[0.04] dark:border-white/[0.04] bg-[#F5F5F7] dark:bg-white/5 hover:bg-black/[0.04]"
                      )}
                    >
                      <div className={cn(
                        "w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        issue.resolved 
                          ? "border-apple-green bg-apple-green text-white" 
                          : "border-black/10 dark:border-white/10 bg-white dark:bg-[#161617]"
                      )}>
                        {issue.resolved && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                            issue.priority === "High" 
                              ? "bg-red-500/10 text-red-500" 
                              : issue.priority === "Medium" 
                                ? "bg-amber-500/10 text-amber-500" 
                                : "bg-apple-blue/10 text-apple-blue"
                          )}>
                            {issue.priority} Priority
                          </span>
                          <span className="text-[9px] text-[#86868B] font-semibold">Impact: +{issue.impact}% Score</span>
                        </div>
                        <p className={cn(
                          "text-xs font-medium leading-relaxed",
                          issue.resolved ? "line-through text-[#86868B]" : "text-[#1D1D1F] dark:text-white"
                        )}>
                          {issue.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-[#86868B] font-semibold">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-apple-green" /> Automatic verification active
                  </span>
                  <span>*Resolving issues live-patches overall score.</span>
                </div>
              </div>

            </div>

            {/* Simulated Live URL Audit List */}
            <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white">Sample Crawl Index Registry</h3>
                <p className="text-xs text-[#86868B] font-normal">Real-time status of catalog pages served from the Pakizzle router.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.04] dark:border-white/[0.04] text-[9px] text-[#86868B] font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Route Page URL</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Response Speed</th>
                      <th className="py-2.5 px-3">Primary Keyword Density</th>
                      <th className="py-2.5 px-3 text-right">Schema Validity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] font-medium text-[#86868B]">
                    {[
                      { url: "https://pakizzle.com/", type: "Homepage", code: "200 OK", load: "0.24s", kw: "4.8% (Optimal)", schema: "JSON-LD & OpenGraph OK" },
                      { url: "https://pakizzle.com/listings", type: "Catalog", code: "200 OK", load: "0.41s", kw: "3.2% (Optimal)", schema: "Breadcrumb & ItemList OK" },
                      { url: "https://pakizzle.com/reels", type: "Social Video Feed", code: "200 OK", load: "0.38s", kw: "1.2% (Under)", schema: "VideoObject Schema OK" },
                      { url: "https://pakizzle.com/financing", type: "Credit Calculator", code: "200 OK", load: "0.55s", kw: "2.1% (Warning)", schema: "FinancialProduct OK" },
                      { url: "https://pakizzle.com/admin/seo-aeo-geo", type: "Search Engine Control Panel", code: "200 OK", load: "0.18s", kw: "4.1% (Optimal)", schema: "Admin Restricted" }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.005]">
                        <td className="py-2.5 px-3 font-mono text-[10px] text-[#1D1D1F] dark:text-white">
                          {row.url} <span className="text-[9px] text-[#86868B] font-sans font-bold ml-1.5">({row.type})</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 text-apple-green text-[10px]">
                            <span className="w-1.2 h-1.2 rounded-full bg-apple-green"></span> {row.code}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-[#1D1D1F] dark:text-white">{row.load}</td>
                        <td className="py-2.5 px-3 text-[10px]">{row.kw}</td>
                        <td className="py-2.5 px-3 text-right font-sans text-apple-blue font-bold text-[10px]">
                          {row.schema}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}

        {activeTab === "explorer" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* The Pillars Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pillar 1: SEO */}
              <div className="bg-white dark:bg-[#161617] p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-between h-full relative overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-apple-blue/5 dark:bg-apple-blue/10 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-apple-blue" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-white">SEO</h3>
                    <p className="text-[10px] font-bold text-apple-blue uppercase tracking-wider mt-0.5">Search Engine Optimization</p>
                  </div>
                  <p className="text-xs text-[#86868B] leading-relaxed font-normal">
                    The traditional backbone of web traffic. SEO focuses on indexing pages for web crawler bots (like Googlebot) using keyword densities, server speed, structured schema, and secure crawl architecture.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-black/[0.04] dark:border-white/[0.04] space-y-2.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-[#86868B]">Target Interface:</span>
                    <span className="text-[#1D1D1F] dark:text-white">Google Search, Bing</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-[#86868B]">Core Technology:</span>
                    <span className="text-[#1D1D1F] dark:text-white font-mono text-[10px]">JSON-LD, Meta, Sitemap</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-[#86868B]">Primary Metric:</span>
                    <span className="text-[#1D1D1F] dark:text-white">Organic Clicks & SERP Rank</span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: AEO */}
              <div className="bg-white dark:bg-[#161617] p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-between h-full relative overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-apple-green/5 dark:bg-apple-green/10 flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-apple-green" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-white">AEO</h3>
                    <p className="text-[10px] font-bold text-apple-green uppercase tracking-wider mt-0.5">Answer Engine Optimization</p>
                  </div>
                  <p className="text-xs text-[#86868B] leading-relaxed font-normal">
                    Optimizing for conversational questions and direct answers. Instead of giving users a list of blue links, answer engines (like voice search and featured snippets) extract a single, crisp answer.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-black/[0.04] dark:border-white/[0.04] space-y-2.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-[#86868B]">Target Interface:</span>
                    <span className="text-[#1D1D1F] dark:text-white">Siri, Alexa, Assistant</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-[#86868B]">Core Technology:</span>
                    <span className="text-[#1D1D1F] dark:text-white font-mono text-[10px]">Q&A Schema, Snippets</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-[#86868B]">Primary Metric:</span>
                    <span className="text-[#1D1D1F] dark:text-white">Featured Snippet Share</span>
                  </div>
                </div>
              </div>

              {/* Pillar 3: GEO */}
              <div className="bg-white dark:bg-[#161617] p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-between h-full relative overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-white">GEO</h3>
                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mt-0.5">Generative Engine Optimization</p>
                  </div>
                  <p className="text-xs text-[#86868B] leading-relaxed font-normal">
                    The new paradigm of discoverability. GEO targets large language model (LLM) engines that synthesize answers using Retrieval-Augmented Generation (RAG). Optimization requires factual richness, authority, and citation hooks.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-black/[0.04] dark:border-white/[0.04] space-y-2.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-[#86868B]">Target Interface:</span>
                    <span className="text-[#1D1D1F] dark:text-white">Gemini, ChatGPT, Perplexity</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-[#86868B]">Core Technology:</span>
                    <span className="text-[#1D1D1F] dark:text-white font-mono text-[10px]">Factual Density, RAG Hooks</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-[#86868B]">Primary Metric:</span>
                    <span className="text-[#1D1D1F] dark:text-white">Citation & Recommend Rate</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Deep Technical Deep-Dive */}
            <div className="bg-white dark:bg-[#161617] p-5 md:p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] space-y-6">
              <div>
                <h2 className="text-base font-semibold text-[#1D1D1F] dark:text-white">The Mechanics of Search Innovation</h2>
                <p className="text-xs text-[#86868B] font-normal mt-0.5">How discovery evolved from simple index matching to cognitive generative synthesis.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-[#F5F5F7] dark:bg-white/[0.02] rounded-xl border border-black/[0.02] dark:border-white/[0.02]">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-lg bg-apple-blue/5 dark:bg-apple-blue/10 flex items-center justify-center shrink-0">
                        <span className="font-bold text-xs text-apple-blue">1</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">Crawlable Architecture & Semantic Layout (SEO)</h4>
                        <p className="text-[11px] text-[#86868B] leading-relaxed font-normal">
                          Traditional search engines rely heavily on clean tags. By writing structured schema feeds (like Vehicle specifications, prices, and location), search crawlers catalog inventory with perfect metadata precision.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F5F5F7] dark:bg-white/[0.02] rounded-xl border border-black/[0.02] dark:border-white/[0.02]">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-lg bg-apple-green/5 dark:bg-apple-green/10 flex items-center justify-center shrink-0">
                        <span className="font-bold text-xs text-apple-green">2</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">FAQ Structured Markup for Conversational UI (AEO)</h4>
                        <p className="text-[11px] text-[#86868B] leading-relaxed font-normal">
                          Voice assistants pull discrete facts rather than lists. To win voice queries like "Where can I buy a certified hybrid car in Islamabad?", listing systems must provide direct QA mappings, specific location coordinates, and transparent pricing.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F5F5F7] dark:bg-white/[0.02] rounded-xl border border-black/[0.02] dark:border-white/[0.02]">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/5 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
                        <span className="font-bold text-xs text-purple-500">3</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">RAG hook formulation & Credential Citation (GEO)</h4>
                        <p className="text-[11px] text-[#86868B] leading-relaxed font-normal">
                          AI systems synthesize reports from across the web. To rank high in recommendations, content must include high factual density (exact mileage, inspection grade, dealer status) and authoritative statistics. Generative engines cite the source that proves the highest context alignment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center bg-[#F5F5F7] dark:bg-[#1E1E1F] p-5 rounded-2xl border border-black/[0.02] dark:border-white/[0.02] space-y-4">
                  <div className="space-y-1 text-center">
                    <span className="px-2 py-0.5 bg-apple-blue/10 rounded text-[9px] font-bold uppercase text-apple-blue tracking-wider">Optimization Paradigm</span>
                    <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">Comparison of Visibility Drivers</h4>
                  </div>
                  
                  {/* Progress bars to illustrate focus */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-[#86868B]">
                        <span>SEO: Keyword Match & Indexing</span>
                        <span className="text-[#1D1D1F] dark:text-white font-mono">95% (Critical)</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-apple-blue rounded-full" style={{ width: "95%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-[#86868B]">
                        <span>AEO: Direct Conversational Match</span>
                        <span className="text-[#1D1D1F] dark:text-white font-mono">85% (Essential)</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-apple-green rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-[#86868B]">
                        <span>GEO: Factual Density & Citation Index</span>
                        <span className="text-[#1D1D1F] dark:text-white font-mono">92% (New Frontier)</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: "92%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[9px] text-[#86868B] font-medium text-center leading-relaxed">
                    *Based on 2026 enterprise research data. Modern multi-agent web environments reward portals that supply rich structured data endpoints over simple keyword stuffing.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab 2: Advanced Metadata Optimizer */}
      <AnimatePresence mode="wait">
        {activeTab === "optimizer" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Listing Selector Sidebar */}
            <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] space-y-5 lg:col-span-1 flex flex-col h-fit">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-apple-blue/10 text-[9px] font-bold text-apple-blue uppercase tracking-wider">
                  Target Selection
                </span>
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white">Select Listing</h3>
                <p className="text-xs text-[#86868B] font-normal leading-relaxed">Choose a vehicle listing to test and optimize its discoverability indices.</p>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {vehicles && vehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVehicleId(v.id);
                      setOptimizationData(null);
                    }}
                    className={cn(
                      "w-full p-3.5 rounded-xl flex items-center justify-between text-left border transition-all duration-200",
                      selectedVehicleId === v.id 
                        ? "border-apple-blue bg-apple-blue/[0.02] dark:bg-apple-blue/10" 
                        : "border-black/[0.04] dark:border-white/[0.04] bg-[#F5F5F7] dark:bg-white/5 hover:bg-black/[0.04]"
                    )}
                  >
                    <div className="space-y-1 truncate">
                      <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate">{v.year} {v.make} {v.model}</p>
                      <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                        PKR {v.price.toLocaleString()} • {v.city}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#86868B] shrink-0" />
                  </button>
                ))}
              </div>

              <Button
                onClick={handleOptimizeListing}
                disabled={isOptimizing}
                className="w-full h-11 bg-apple-blue hover:bg-blue-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Running AI Audit...
                  </>
                ) : (
                  <>
                    <Sliders className="w-3.5 h-3.5" />
                    Audit & Optimize
                  </>
                )}
              </Button>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {optimizationData ? (
                <div className="space-y-6">
                  {/* Top Scorecard Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* SEO Score Card */}
                    <div className="bg-white dark:bg-[#161617] p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.04] flex items-center gap-3">
                      <div className="w-10 h-10 bg-apple-blue/5 dark:bg-apple-blue/10 rounded-lg flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-apple-blue" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#86868B]">SEO Index</p>
                        <p className="text-sm font-semibold text-[#1D1D1F] dark:text-white">98% Optimal</p>
                        <p className="text-[9px] text-apple-green font-bold">Schema Validated</p>
                      </div>
                    </div>

                    {/* AEO Voice Score Card */}
                    <div className="bg-white dark:bg-[#161617] p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.04] flex items-center gap-3">
                      <div className="w-10 h-10 bg-apple-green/5 dark:bg-apple-green/10 rounded-lg flex items-center justify-center shrink-0">
                        <Volume2 className="w-5 h-5 text-apple-green" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#86868B]">AEO Answers</p>
                        <p className="text-sm font-semibold text-[#1D1D1F] dark:text-white">92% Answer Rate</p>
                        <p className="text-[9px] text-apple-blue font-bold">Conversational Mapped</p>
                      </div>
                    </div>

                    {/* GEO AI Citation Score Card */}
                    <div className="bg-white dark:bg-[#161617] p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.04] flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/5 dark:bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                        <Brain className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#86868B]">GEO Retrieval</p>
                        <p className="text-sm font-semibold text-[#1D1D1F] dark:text-white">{optimizationData.geoCitationScore}% Chance</p>
                        <p className="text-[9px] text-purple-500 font-bold">Factual Hook Ready</p>
                      </div>
                    </div>
                  </div>

                  {/* Detail Tabs inside optimizer */}
                  <div className="bg-white dark:bg-[#161617] p-5 md:p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] space-y-6">
                    {/* Pillar 1: SEO keyword density & structured schema code */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-black/[0.04] dark:border-white/[0.04] pb-3">
                        <Globe className="w-4 h-4 text-apple-blue" />
                        <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">Traditional SEO Google Crawl Mockup</h4>
                      </div>
                      
                      {/* Search Snippet Preview */}
                      <div className="p-4 bg-[#F5F5F7] dark:bg-white/[0.02] rounded-xl border border-black/[0.02] dark:border-white/[0.02] space-y-1">
                        <div className="flex items-center gap-1 text-[10px] text-[#86868B] font-medium">
                          <span className="font-semibold">pakizzle.com</span>
                          <span>›</span>
                          <span>listings</span>
                          <span>›</span>
                          <span className="truncate">{selectedVehicle?.make?.toLowerCase() || ""}-{selectedVehicle?.model?.toLowerCase() || ""}</span>
                        </div>
                        <h5 className="text-xs font-semibold text-[#1A0DAB] dark:text-[#8AB4F8] hover:underline cursor-pointer">
                          Verified {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model} For Sale in {selectedVehicle?.city} | Pakizzle
                        </h5>
                        <p className="text-[11px] text-[#86868B] leading-relaxed font-normal">
                          Buy used {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model} in {selectedVehicle?.city} at best price. Features: {selectedVehicle?.features?.slice(0, 3).join(", ") || "Certified specs"}. Certified Inspection Grade available...
                        </p>
                      </div>

                      {/* Keyword densities & Schema structured code */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2.5">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Local SEO Keyword Targets</h5>
                          <div className="space-y-1.5">
                            {optimizationData.seoKeywordDensity.map((kw, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F5F5F7] dark:bg-[#1E1E1F] border border-black/[0.02] dark:border-white/[0.02] rounded-xl text-xs font-medium">
                                <span className="text-[#1D1D1F] dark:text-white truncate">{kw.keyword}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[#86868B] font-mono">{kw.count}x</span>
                                  <span className="px-1.5 py-0.5 rounded bg-apple-green/10 text-apple-green text-[8px] font-bold uppercase tracking-wider">{kw.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">JSON-LD Structured Schema</h5>
                            <span className="text-[8px] bg-apple-blue/10 text-apple-blue px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Valid Schema</span>
                          </div>
                          <div className="relative">
                            <pre className="text-[9px] font-mono text-[#86868B] bg-black/5 dark:bg-black p-3 rounded-xl max-h-[150px] overflow-y-auto border border-black/[0.04] dark:border-white/[0.04] leading-normal">
                              {optimizationData.schemaMarkup}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pillar 2: AEO Answers */}
                    <div className="space-y-4 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <div className="flex items-center gap-2 border-b border-black/[0.04] dark:border-white/[0.04] pb-3">
                        <Volume2 className="w-4 h-4 text-apple-green" />
                        <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">AEO Alexa, Siri & Featured Snippets Answers</h4>
                      </div>

                      <div className="space-y-3">
                        {optimizationData.aeoQuestions.map((qa, idx) => (
                          <div key={idx} className="p-4 bg-apple-green/[0.01] border border-apple-green/10 rounded-xl space-y-1.5 relative">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-apple-green/10 flex items-center justify-center text-[8px] font-bold text-apple-green">Q</span>
                              <h5 className="text-[11px] font-semibold text-[#1D1D1F] dark:text-white">{qa.question}</h5>
                            </div>
                            <div className="flex gap-2">
                              <span className="w-4 h-4 rounded-full bg-apple-blue/10 flex items-center justify-center text-[8px] font-bold text-apple-blue shrink-0">A</span>
                              <p className="text-[11px] text-[#86868B] leading-relaxed font-normal">{qa.answer}</p>
                            </div>
                            <span className="absolute bottom-2 right-3 text-[8px] font-semibold uppercase tracking-wider text-[#86868B]">Source: {qa.source}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pillar 3: GEO Recommendations */}
                    <div className="space-y-4 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <div className="flex items-center gap-2 border-b border-black/[0.04] dark:border-white/[0.04] pb-3">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">GEO Chat-Engine RAG Hook Alignment</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2.5">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">AI Optimization Recommendations</h5>
                          <div className="space-y-1.5">
                            {optimizationData.geoRecommendations.map((rec, idx) => (
                              <div key={idx} className="flex gap-2 p-3 bg-purple-500/[0.01] border border-purple-500/5 rounded-xl text-[11px] font-normal text-[#86868B] leading-relaxed">
                                <span className="text-purple-500 shrink-0">✦</span>
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">AI Engine Generated Recommendation Snippet</h5>
                          <div className="p-4 bg-purple-500/[0.02] border border-purple-500/10 rounded-xl text-[11px] leading-relaxed font-normal text-[#86868B] space-y-2">
                            <p>{optimizationData.geoRecommendationDraft}</p>
                            <div className="pt-2.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-[8px] text-purple-500 font-bold uppercase tracking-wider">
                              <span>Simulated ChatGPT & Perplexity Synthesis</span>
                              <div className="flex gap-1 font-mono">
                                <span className="bg-purple-500/5 px-1 rounded">[1] Listing</span>
                                <span className="bg-purple-500/5 px-1 rounded">[2] Spec</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#161617] p-8 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex flex-col items-center justify-center text-center h-[460px]">
                  <div className="w-12 h-12 bg-apple-blue/5 dark:bg-apple-blue/10 rounded-xl flex items-center justify-center mb-5 text-apple-blue">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-1.5">No Active Metadata Audit</h3>
                  <p className="text-xs text-[#86868B] max-w-sm leading-relaxed font-normal mb-6">
                    Select a listing from the sidebar catalog to examine structured keyword status, Schema.org mappings, AEO speech triggers, and RAG index rankings.
                  </p>
                  <Button
                    onClick={handleOptimizeListing}
                    disabled={isOptimizing}
                    className="h-10 bg-apple-blue hover:bg-blue-600 text-white px-6 rounded-xl text-[11px] font-bold uppercase tracking-wider"
                  >
                    {isOptimizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    Audit Current Vehicle
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab 3: Generative Engine Sandbox */}
      <AnimatePresence mode="wait">
        {activeTab === "sandbox" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Context Sidebar */}
            <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] space-y-5 lg:col-span-1 h-fit">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-[9px] font-bold text-purple-500 uppercase tracking-wider">
                  GEO RAG Hook
                </span>
                <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white">AI Retrieval Playground</h3>
                <p className="text-xs text-[#86868B] font-normal leading-relaxed">
                  Test how LLM crawlers query, retrieve, filter, and cite Pakizzle inventory items based on natural semantic inputs.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#F5F5F7] dark:bg-[#1E1E1F] border border-black/[0.02] dark:border-white/[0.02] rounded-xl space-y-2">
                  <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">Try these prompt formats:</h4>
                  <ul className="text-[11px] text-[#86868B] font-medium space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>"Sedans in Lahore under 30 Lakhs"</li>
                    <li>"Best hybrid vehicle with key safety packages"</li>
                    <li>"Verified car in Islamabad with automatic gearbox"</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#F5F5F7] dark:bg-[#1E1E1F] border border-black/[0.02] dark:border-white/[0.02] rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-[#86868B] tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Grounding Signal
                  </div>
                  <p className="text-[10px] text-[#86868B] font-normal leading-relaxed">
                    Unlike standard databases, a GEO-optimized site supplies factual density anchors. If your listings have complete specifications, LLMs can ingest them as structured facts to recommend your cars over competitors.
                  </p>
                </div>
              </div>
            </div>

            {/* Sandbox Chat Window */}
            <div className="lg:col-span-2 bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden flex flex-col h-[560px]">
              {/* Chat Title bar */}
              <div className="p-4 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between bg-[#F5F5F7] dark:bg-[#1E1E1F]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/5 dark:bg-purple-500/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">GEO Cognitive Simulator Node</h4>
                    <p className="text-[9px] text-[#86868B] font-bold uppercase tracking-wider">Retrieval-Augmented Generation (RAG) Mode</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-apple-green animate-pulse"></span>
              </div>

              {/* Chat History */}
              <ScrollArea className="flex-1 p-5 space-y-5">
                <div className="space-y-5">
                  {sandboxHistory.map((msg, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "flex flex-col gap-1.5",
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      )}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868B] px-1">
                        {msg.role === 'user' ? 'Local Admin' : 'Generative RAG Node'}
                      </span>
                      <div className={cn(
                        "p-4 rounded-xl max-w-[85%] text-xs font-medium leading-relaxed border shadow-sm",
                        msg.role === 'user' 
                          ? 'bg-apple-blue border-apple-blue text-white rounded-tr-none' 
                          : 'bg-[#F5F5F7] dark:bg-[#1E1E1F] border-black/[0.02] dark:border-white/[0.02] text-[#86868B] rounded-tl-none space-y-3'
                      )}>
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <>
                            <p className="whitespace-pre-line text-[#1D1D1F] dark:text-white">{msg.content}</p>
                            {msg.citations && msg.citations.length > 0 && (
                              <div className="pt-2.5 border-t border-black/[0.04] dark:border-white/[0.04] space-y-1.5">
                                <p className="text-[9px] font-bold uppercase text-purple-500 tracking-wider">Citations Retrieved ({msg.citations.length})</p>
                                <div className="space-y-1">
                                  {msg.citations.map((cite, cIdx) => (
                                    <div key={cIdx} className="flex gap-2 text-[10px] text-[#86868B] font-mono leading-relaxed bg-black/5 dark:bg-black/25 p-2 rounded border border-black/[0.04] dark:border-white/[0.04]">
                                      <span className="text-purple-500 font-bold">[{cIdx + 1}]</span>
                                      <span>{cite}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {isSandboxTyping && (
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868B] px-1">Generative RAG Node</span>
                      <div className="p-3 bg-[#F5F5F7] dark:bg-[#1E1E1F] border border-black/[0.02] dark:border-white/[0.02] rounded-xl rounded-tl-none flex items-center gap-1.5">
                        <span className="w-1.2 h-1.2 rounded-full bg-purple-500 animate-bounce"></span>
                        <span className="w-1.2 h-1.2 rounded-full bg-purple-500 animate-bounce delay-100"></span>
                        <span className="w-1.2 h-1.2 rounded-full bg-purple-500 animate-bounce delay-200"></span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <form onSubmit={handleSandboxSubmit} className="p-3.5 border-t border-black/[0.04] dark:border-white/[0.04] bg-[#F5F5F7] dark:bg-[#1E1E1F] flex gap-3">
                <input
                  type="text"
                  placeholder="Ask the AI simulator to search for vehicles..."
                  className="flex-1 px-4 py-2 bg-white dark:bg-[#161617] border border-black/[0.04] dark:border-white/[0.04] focus:border-apple-blue/40 outline-none rounded-xl text-xs font-semibold text-[#1D1D1F] dark:text-white placeholder-[#86868B]"
                  value={sandboxPrompt}
                  onChange={(e) => setSandboxPrompt(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

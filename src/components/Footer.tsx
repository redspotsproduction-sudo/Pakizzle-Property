import React from 'react';
import { motion } from 'motion/react';
import { 
  Car, 
  Shield, 
  CreditCard, 
  Search, 
  PlusCircle, 
  Heart, 
  HelpCircle, 
  Mail, 
  Phone, 
  Instagram, 
  Twitter, 
  Facebook,
  ChevronRight,
  Zap,
  Globe,
  Settings,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Footer({ onValuationClick }: { onValuationClick: () => void }) {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Navigation",
      links: [
        { name: "Marketplace", path: "/marketplace" },
        { name: "Used Cars", path: "/marketplace?condition=used" },
        { name: "New Cars", path: "/marketplace?condition=new" },
        { name: "Auction Verification", path: "/auction-verification" },
        { name: "Valuation Hub", action: onValuationClick },
        { name: "Dubizzle Clone Blueprint", path: "/clone" },
      ]
    },
    {
      title: "Solutions",
      links: [
        { name: "Car Inspection", path: "/inspection" },
        { name: "Insurance Center", path: "/insurance" },
        { name: "Smart Financing", path: "/financing" },
        { name: "Roadside Assist", path: "/services" },
        { name: "Auto Parts Shop", path: "#" },
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Help Center", path: "#" },
        { name: "Safety Guidelines", path: "#" },
        { name: "Community Forum", path: "#" },
        { name: "Pakizzle Blog", path: "#" },
        { name: "Pricing Plans", path: "#" },
      ]
    },
    {
      title: "Corporate",
      links: [
        { name: "About Pakizzle", path: "#" },
        { name: "Newsroom", path: "#" },
        { name: "Investor Relations", path: "#" },
        { name: "Careers", path: "#" },
        { name: "Contact Hub", path: "#" },
      ]
    }
  ];

  return (
    <footer className="relative bg-apple-bg pt-24 pb-12 overflow-hidden border-t border-apple-border">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-apple-blue/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-apple-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top Section: Brand & Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-20">
          <div className="space-y-6 max-w-sm">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-apple-blue rounded-2xl flex items-center justify-center shadow-lg shadow-apple-blue/20 transition-transform group-hover:scale-110 duration-[600ms] ease-[0.16,1,0.3,1]">
                <Car className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-semibold tracking-tight block">Pakizzle</span>
                <span className="text-[10px] font-medium text-apple-text-muted uppercase tracking-[0.2em] -mt-1 block">The Standard for Mobility</span>
              </div>
            </Link>
            <p className="text-base text-apple-text-muted leading-relaxed font-medium">
              We're building the future of automotive commerce in Pakistan. Precision, transparency, and intelligence at every turn.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            <div className="glass-panel p-2 rounded-[28px] flex items-center gap-2 max-w-md w-full focus-within:ring-4 focus-within:ring-apple-blue/10 transition-all duration-500">
              <div className="pl-4">
                <Mail className="w-5 h-5 text-apple-text-muted" />
              </div>
              <input 
                type="email" 
                placeholder="Stay ahead with our newsletter" 
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium h-12 placeholder:text-apple-text-muted/50"
              />
              <button className="h-12 px-6 rounded-2xl bg-apple-text text-apple-bg font-semibold text-[11px] uppercase tracking-widest hover:bg-apple-blue hover:text-white transition-all duration-500 active:scale-95 shrink-0">
                Join Us
              </button>
            </div>
            <div className="flex items-center gap-4 mt-4 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-apple-green animate-pulse" />
              <p className="text-[10px] font-medium text-apple-text-muted uppercase tracking-widest leading-none">Intelligence Engine: Operational 24/7</p>
            </div>
          </div>
        </div>

        {/* Middle Section: Grid Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-8 gap-y-12 mb-24">
          {footerSections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-apple-text">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    {link.action ? (
                      <button 
                        onClick={link.action}
                        className="group flex items-center gap-1.5 text-sm font-medium text-apple-text-muted hover:text-apple-blue transition-all duration-300"
                      >
                        {link.name}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                      </button>
                    ) : (
                      <Link 
                        to={link.path || "#"}
                        className="group flex items-center gap-1.5 text-sm font-medium text-apple-text-muted hover:text-apple-blue transition-all duration-300"
                      >
                        {link.name}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section: Legal & Social */}
        <div className="pt-12 border-t border-apple-border flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <p className="text-[11px] font-medium text-apple-text-muted uppercase tracking-widest">
              © {currentYear} Pakizzle Pakistan. Engineering Excellence.
            </p>
            <div className="flex items-center gap-6">
              <Link to="#" className="text-[10px] font-semibold uppercase tracking-widest text-apple-text-muted hover:text-apple-text transition-colors">Privacy</Link>
              <Link to="#" className="text-[10px] font-semibold uppercase tracking-widest text-apple-text-muted hover:text-apple-text transition-colors">Terms</Link>
              <Link to="#" className="text-[10px] font-semibold uppercase tracking-widest text-apple-text-muted hover:text-apple-text transition-colors">Cookies</Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {[
              { icon: Twitter, color: 'hover:bg-sky-500' },
              { icon: Instagram, color: 'hover:bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600' },
              { icon: Facebook, color: 'hover:bg-blue-600' }
            ].map((social, sIdx) => (
              <Link 
                key={sIdx} 
                to="#" 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center bg-apple-gray dark:bg-white/5 text-apple-text-muted hover:text-white transition-all duration-500 active:scale-90 shadow-sm hover:shadow-lg",
                  social.color
                )}
              >
                <social.icon className="w-4 h-4" />
              </Link>
            ))}
            <div className="h-6 w-px bg-apple-border mx-2" />
            <button className="p-2.5 rounded-full bg-apple-gray dark:bg-white/5 text-apple-text-muted hover:text-apple-text transition-all group">
              <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>

        {/* Native Floating Dock Hint (Mobile View) */}
        <div className="lg:hidden mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-2">
                <p className="text-[9px] font-semibold text-apple-text-muted/40 uppercase tracking-[0.4em]">Designed & Engineered in Lahore</p>
                <div className="w-12 h-1.5 bg-apple-border/20 rounded-full" />
            </div>
        </div>
      </div>

      {/* Extreme Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-apple-blue/[0.03] to-transparent pointer-events-none" />
    </footer>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
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
  ArrowUpRight, 
  Building2, 
  Map, 
  Calculator 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import PakizzleLogo from './PakizzleLogo';

export default function Footer({ onValuationClick }: { onValuationClick?: () => void }) {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Properties",
      links: [
        { name: "All Properties", path: "/marketplace" },
        { name: "Luxury Villas", path: "/marketplace?make=House" },
        { name: "Apartments & Flats", path: "/marketplace?make=Apartment" },
        { name: "Penthouses", path: "/marketplace?make=Penthouse" },
        { name: "Plots & Land", path: "/marketplace?make=Plot" },
        { name: "Commercial Plazas", path: "/marketplace?make=Commercial" },
      ]
    },
    {
      title: "Solutions",
      links: [
        { name: "AI Property Valuation", action: onValuationClick },
        { name: "Shanakht™ Title Verification", path: "/auction-verification" },
        { name: "Islamic Home Financing", path: "/financing" },
        { name: "FBR Property Tax Engine", path: "/marketplace" },
        { name: "Sector Plot Finder", path: "/marketplace" },
        { name: "Property Insurance", path: "/insurance" },
      ]
    },
    {
      title: "Cities & Societies",
      links: [
        { name: "DHA Lahore (Phases 1-9)", path: "/marketplace?city=Lahore&q=DHA" },
        { name: "Clifton & Defence Karachi", path: "/marketplace?city=Karachi&q=Clifton" },
        { name: "Islamabad Sectors F-7 & E-11", path: "/marketplace?city=Islamabad" },
        { name: "Bahria Town Karachi", path: "/marketplace?city=Karachi&q=Bahria" },
        { name: "Gulberg Lahore", path: "/marketplace?city=Lahore&q=Gulberg" },
      ]
    },
    {
      title: "Corporate",
      links: [
        { name: "About Pakizzle", path: "#" },
        { name: "Why We Beat Zameen", path: "#" },
        { name: "Verified Agency Network", path: "#" },
        { name: "Admin Portal", path: "/admin/login" },
        { name: "Seller Dashboard", path: "/dashboard" },
      ]
    }
  ];

  return (
    <footer className="relative bg-[#0A0A0A] text-[#F5F5F7] pt-24 pb-12 overflow-hidden border-t border-white/10">
      {/* Background Decorative Gold Accent Hairline */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#5B2A86]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top Section: Brand & Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-20">
          <div className="space-y-6 max-w-sm">
            <Link to="/" className="inline-block group" title="Pakizzle - Elite Real Estate Portal">
              <PakizzleLogo variant="white" size="lg" />
            </Link>
            <p className="text-sm text-[#8E8E93] leading-relaxed font-normal">
              Pakistan's premier property ecosystem. Cryptographic title verification, interactive masterplan plot finders, and complete tax transparency. Zero banner spam.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            <div className="p-2 rounded-[28px] bg-white/5 border border-white/10 flex items-center gap-2 max-w-md w-full focus-within:ring-4 focus-within:ring-[#5B2A86]/20 transition-all duration-500 backdrop-blur-md">
              <div className="pl-4">
                <Mail className="w-5 h-5 text-[#B8ACC7]" />
              </div>
              <input 
                type="email" 
                placeholder="Stay ahead with verified listings" 
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium h-12 text-[#FAF3E6] placeholder:text-[#B8ACC7]/60"
              />
              <button className="h-12 px-6 rounded-full pakizzle-button-primary text-xs font-bold shrink-0">
                Join
              </button>
            </div>
            <div className="flex items-center gap-3 mt-4 px-2">
              <span className="w-2 h-2 rounded-full bg-[#5FA84C] animate-pulse" />
              <p className="text-[10px] font-semibold text-[#B8ACC7] uppercase tracking-wider leading-none">Verified Property Engine: Operational 24/7</p>
            </div>
          </div>
        </div>

        {/* Middle Section: Grid Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-8 gap-y-12 mb-24">
          {footerSections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C9A227]">{section.title}</h4>
              <ul className="space-y-3.5">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    {link.action ? (
                      <button 
                        onClick={link.action}
                        className="group flex items-center gap-1.5 text-sm font-normal text-[#B8ACC7] hover:text-[#FAF3E6] transition-all duration-300 text-left"
                      >
                        <span>{link.name}</span>
                        <ArrowUpRight className="w-3 h-3 text-[#C9A227] opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                      </button>
                    ) : (
                      <Link 
                        to={link.path || "#"}
                        className="group flex items-center gap-1.5 text-sm font-normal text-[#B8ACC7] hover:text-[#FAF3E6] transition-all duration-300"
                      >
                        <span>{link.name}</span>
                        <ArrowUpRight className="w-3 h-3 text-[#C9A227] opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section: Legal & Social */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <p className="text-[11px] font-medium text-[#B8ACC7] uppercase tracking-widest">
              © {currentYear} Pakizzle Pakistan. Elite Real Estate Portal.
            </p>
            <div className="flex items-center gap-6">
              <Link to="#" className="text-[10px] font-semibold uppercase tracking-widest text-[#B8ACC7] hover:text-[#FAF3E6] transition-colors">Privacy</Link>
              <Link to="#" className="text-[10px] font-semibold uppercase tracking-widest text-[#B8ACC7] hover:text-[#FAF3E6] transition-colors">Terms</Link>
              <Link to="#" className="text-[10px] font-semibold uppercase tracking-widest text-[#B8ACC7] hover:text-[#FAF3E6] transition-colors">Cookies</Link>
              <Link to="/admin/login" className="text-[10px] font-semibold uppercase tracking-widest text-[#C9A227] hover:underline transition-colors flex items-center gap-1">Admin Portal</Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {[
              { icon: Twitter, color: 'hover:bg-[#4A90D2]' },
              { icon: Instagram, color: 'hover:bg-[#7A1E5E]' },
              { icon: Facebook, color: 'hover:bg-[#4B2C82]' }
            ].map((social, sIdx) => (
              <Link 
                key={sIdx} 
                to="#" 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-[#B8ACC7] hover:text-white transition-all duration-500 active:scale-90 shadow-sm border border-white/10",
                  social.color
                )}
              >
                <social.icon className="w-4 h-4" />
              </Link>
            ))}
            <div className="h-6 w-px bg-white/10 mx-2" />
            <button className="p-2.5 rounded-full bg-white/5 text-[#B8ACC7] hover:text-white border border-white/10 transition-all group">
              <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>

        {/* Native Floating Dock Hint (Mobile View) */}
        <div className="lg:hidden mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-2">
                <p className="text-[9px] font-semibold text-[#B8ACC7]/60 uppercase tracking-[0.4em]">Designed & Engineered for Pakistan</p>
                <div className="w-12 h-1.5 bg-[#C9A227]/30 rounded-full" />
            </div>
        </div>
      </div>
    </footer>
  );
}

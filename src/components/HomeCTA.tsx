import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function HomeCTA() {
  return (
    <section className="py-12 bg-apple-gray/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <Link to="/marketplace" className="apple-button-primary !h-14 md:!h-16 !px-4 text-sm md:text-base shadow-2xl shadow-apple-blue/30 group w-full">
            <span className="flex items-center justify-center gap-3">
              Explore Marketplace
              <motion.span 
                animate={{ x: [0, 5, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </span>
          </Link>
          <Link to="/auction-verification" className="apple-button-secondary !h-14 md:!h-16 !px-4 text-sm md:text-base group bg-apple-card-bg w-full">
            <span className="flex items-center justify-center gap-3">
              Verify Auction Sheet
              <ShieldCheck className="w-5 h-5 text-apple-blue group-hover:scale-110 transition-transform" />
            </span>
          </Link>
          <Link to="/insurance" className="apple-button-secondary !h-14 md:!h-16 !px-4 text-sm md:text-base group bg-white border-apple-blue/20 text-apple-blue hover:bg-apple-blue/5 w-full">
            <span className="flex items-center justify-center gap-3">
              Get Car Insurance
              <motion.span 
                animate={{ rotate: [0, 10, 0] }} 
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🛡️
              </motion.span>
            </span>
          </Link>
          <Link to="/financing" className="apple-button-secondary !h-14 md:!h-16 !px-4 text-sm md:text-base group bg-white border-purple-500/20 text-purple-600 hover:bg-purple-500/5 w-full">
            <span className="flex items-center justify-center gap-3">
              Car Financing
              <motion.span 
                animate={{ y: [0, -5, 0] }} 
                transition={{ repeat: Infinity, duration: 2 }}
              >
                💰
              </motion.span>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

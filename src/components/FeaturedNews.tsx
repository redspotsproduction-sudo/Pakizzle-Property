import { motion } from "motion/react";

const NEWS = [
  {
    id: "1",
    title: "The Rise of EVs in Pakistan: What to Expect in 2026",
    category: "Industry News",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
    date: "Oct 12, 2025",
  },
  {
    id: "2",
    title: "Top 5 Luxury SUVs for the Northern Areas",
    category: "Guides",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
    date: "Oct 10, 2025",
  },
  {
    id: "3",
    title: "Audi e-tron GT: A Masterclass in Electric Performance",
    category: "Reviews",
    image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80&w=800",
    date: "Oct 08, 2025",
  },
];

export default function FeaturedNews() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="flex justify-between items-end mb-10 md:mb-12">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Automotive Insights</h2>
          <p className="text-sm md:text-base text-apple-text-muted">Stay updated with the latest trends and reviews.</p>
        </div>
        <button className="hidden md:block text-apple-blue font-semibold hover:underline">View All News</button>
      </div>

      <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto pb-6 md:pb-0 scrollbar-hide snap-x snap-mandatory -mx-6 px-6 scroll-pl-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        {NEWS.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group cursor-pointer min-w-[280px] md:min-w-0 snap-start"
          >
            <div className="relative aspect-[16/10] rounded-apple-2xl overflow-hidden mb-5 shadow-apple-soft">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute top-4 left-4">
                <span className="glass-panel px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-apple-blue transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-apple-text-muted font-medium uppercase tracking-widest">
              {item.date}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

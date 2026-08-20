import { BookOpen, Search } from "lucide-react";
import { motion } from "motion/react";

interface BlogHeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function BlogHero({ searchQuery, onSearchChange }: BlogHeroProps) {
  return (
    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <motion.div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#3FA9F5]/20 to-[#1F6FEB]/10 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#1F6FEB]/15 to-[#3FA9F5]/10 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.1, 1], rotate: [0, -8, 0] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#3FA9F5]/10 text-[#3FA9F5] rounded-full text-base font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Our Blog
          </span>
        </motion.div>

        <motion.h1
          className="text-6xl md:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          Dental Health{" "}
          <span className="bg-gradient-to-r from-[#3FA9F5] to-[#1F6FEB] bg-clip-text text-transparent">
            Insights
          </span>
        </motion.h1>

        <motion.p
          className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Expert articles, tips, and the latest in AI-powered dental care — all
          in one place.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          className="max-w-xl mx-auto relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-50" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-md shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3FA9F5]/40 focus:border-[#3FA9F5] transition-all text-gray-700"
          />
        </motion.div>
      </div>
    </section>
  );
}

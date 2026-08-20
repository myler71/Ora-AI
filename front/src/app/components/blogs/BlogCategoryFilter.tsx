import { motion, stagger } from "motion/react";

interface BlogCategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function BlogCategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: BlogCategoryFilterProps) {
  return (
    <section className="px-6 pb-12">
      <motion.div
        className="max-w-5xl mx-auto flex flex-wrap gap-3 justify-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{
          delayChildren: stagger(0.06),
        }}
      >
        {categories.map((cat) => (
          <motion.button
            key={cat}
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0 },
            }}
            onClick={() => onCategoryChange(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
              activeCategory === cat
                ? "bg-gradient-to-r from-[#3FA9F5] to-[#1F6FEB] text-white shadow-lg shadow-[#3FA9F5]/30"
                : "bg-white text-gray-600 border border-gray-200 hover:border-[#3FA9F5] hover:text-[#3FA9F5]"
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}

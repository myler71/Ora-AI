import { type Variants, motion } from "motion/react";
import { Button } from "../Button";
import { Card } from "../Card";

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function BlogNewsletter() {
  return (
    <section className="py-20 px-6">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        <Card
          variant="glass"
          className="text-center bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] text-white relative overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10" />

          <div className="relative z-10">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Stay Updated
            </motion.h2>
            <motion.p
              className="text-xl mb-8 opacity-90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
            >
              Get the latest dental health insights delivered straight to your
              inbox.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
              <Button variant="glass" size="md">
                Subscribe
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

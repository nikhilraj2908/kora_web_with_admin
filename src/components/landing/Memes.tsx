import { motion } from "framer-motion";

const memes = [
  { emoji: "😩", caption: "When mom says wash your own clothes.", vibe: "from-electric/40 to-primary/30" },
  { emoji: "🤢", caption: "When your favorite shirt smells like yesterday's gym.", vibe: "from-sunset/40 to-primary/30" },
  { emoji: "😱", caption: "When guests arrive and your laundry is everywhere.", vibe: "from-mint/40 to-bubble/30" },
];

export function Memes() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl md:text-5xl font-black mb-4"
        >
          We've all <span className="gradient-text">been there.</span>
        </motion.h2>
        <p className="text-center text-muted-foreground mb-14">Real situations. Real trauma. Real solutions.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {memes.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, rotate: i % 2 ? -3 : 3 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? -2 : 2 }}
              whileHover={{ rotate: 0, scale: 1.03 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="glass rounded-3xl p-8 relative overflow-hidden"
            >
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${m.vibe} opacity-50`} />
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                className="text-8xl mb-4"
              >
                {m.emoji}
              </motion.div>
              <p className="font-display text-xl font-bold leading-snug">"{m.caption}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

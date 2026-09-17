import { motion } from "framer-motion";

const roles = [
  { emoji: "🧑‍💻", title: "Customer", desc: "Book laundry in seconds. Get on with your life.", cta: "Order now", vibe: "from-electric/30 to-primary/20" },
  { emoji: "🛵", title: "Rider", desc: "Earn by collecting and delivering clothes on your schedule.", cta: "Become a Rider", vibe: "from-sunset/30 to-primary/20" },
  { emoji: "🧺", title: "Washer", desc: "Receive nearby orders and grow your laundry business.", cta: "Become a Washer", vibe: "from-mint/30 to-bubble/20" },
];

export function Roles() {
  return (
    <section id="roles" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl md:text-5xl font-black mb-14"
        >
          One app, <span className="gradient-text">three superheroes.</span>
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass rounded-3xl p-8 relative overflow-hidden text-center"
            >
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${r.vibe}`} />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                className="text-7xl mb-4"
              >
                {r.emoji}
              </motion.div>
              <h3 className="font-display text-2xl font-bold mb-2">{r.title}</h3>
              <p className="text-muted-foreground mb-6">{r.desc}</p>
              <a href="#cta" className="inline-block glass rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-foreground/10 transition">{r.cta} →</a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

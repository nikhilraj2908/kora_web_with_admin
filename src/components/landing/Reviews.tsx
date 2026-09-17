import { motion } from "framer-motion";

const reviews = [
  { name: "Aisha K.", role: "Designer · Bangalore", text: "I came for convenience. Stayed because my weekends returned.", emoji: "🧘‍♀️" },
  { name: "Rohan M.", role: "Founder · Mumbai", text: "My clothes came back looking richer than me. Suspicious. Continuing.", emoji: "🤵" },
  { name: "Sneha P.", role: "Student · Pune", text: "Used to cry-fold every Sunday. Now I just… watch shows. Wild.", emoji: "📺" },
  { name: "Devansh R.", role: "PM · Delhi", text: "The rider is faster than my Swiggy guy and twice as polite.", emoji: "🛵" },
  { name: "Priya S.", role: "Doctor · Hyd", text: "Steam ironed my scrubs to oblivion. 10/10 will outsource forever.", emoji: "🩺" },
  { name: "Karan V.", role: "DJ · Goa", text: "My white shirt is finally white again. Therapy unlocked.", emoji: "🎧" },
];

export function Reviews() {
  return (
    <section id="reviews" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-coral">Chapter 11 · Receipts</div>
            <h2 className="font-display text-4xl md:text-6xl font-black mt-2 leading-[1]">
              People talk. <span className="gradient-text">A lot.</span>
            </h2>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-black">4.9★</div>
            <div className="text-xs text-muted-foreground">across 12,000+ reviews</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl soft-card p-6"
            >
              <div className="text-3xl mb-3">{r.emoji}</div>
              <p className="font-display text-lg leading-snug">“{r.text}”</p>
              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
                <div className="text-marigold text-sm">★★★★★</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

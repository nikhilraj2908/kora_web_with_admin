import { motion } from "framer-motion";
import { Shirt, Sparkles, Wind, Zap } from "lucide-react";

const services = [
  { icon: Shirt, name: "Wash & Fold", price: "₹89", unit: "/kg", desc: "Everyday clothes. Cleaned, dried, folded like origami.", tint: "bg-coral/15" },
  { icon: Sparkles, name: "Dry Cleaning", price: "₹149", unit: "/piece", desc: "Suits, sarees, that one delicate thing you’re scared of.", tint: "bg-marigold/20" },
  { icon: Wind, name: "Steam Iron", price: "₹15", unit: "/piece", desc: "Crisp, wrinkle-free, ready-for-Zoom finish.", tint: "bg-mint/25" },
  { icon: Zap, name: "Express Laundry", price: "₹199", unit: "/kg", desc: "Same-day. Because tomorrow is a vibe, not a plan.", tint: "bg-bubble/40" },
];

export function Services() {
  return (
    <section id="services" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-coral">Chapter 08 · What is your need tell us?</div>
            <h2 className="font-display text-4xl md:text-6xl font-black mt-2 leading-[1]">
              Services that <span className="gradient-text">slap.</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm">
            Pick a service. We do the rest. There is no rest for us, but there’s plenty for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => {
            const Ic = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8 }}
                className={`relative rounded-3xl soft-card p-6 ${s.tint} overflow-hidden`}
              >
                <div className="size-12 rounded-2xl gradient-hero grid place-items-center">
                  <Ic className="size-5 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold mt-5">{s.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-black">{s.price}</span>
                  <span className="text-muted-foreground text-sm">{s.unit}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Bike, WashingMachine, Apple, Smartphone } from "lucide-react";

export function FinalCTA() {
  return (
    <section id="cta" className="py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 size-[500px] rounded-full bg-coral/30 blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 size-[500px] rounded-full bg-marigold/30 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
      </div>
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-[3rem] gradient-hero p-10 md:p-16 text-white overflow-hidden text-center">
          <div className="absolute -top-10 -left-10 text-7xl rotate-12 opacity-30">🧺</div>
          <div className="absolute -bottom-8 -right-6 text-7xl -rotate-12 opacity-30">✨</div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-6xl font-black leading-[1.02]"
          >
            Schedule a pickup. <br /> Reclaim your Sunday.
          </motion.h2>
          <p className="mt-5 text-white/85 max-w-xl mx-auto">
            Join thousands who outsourced laundry and got their weekends back. No subscription required.
          </p>

          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <a href="#" className="bg-white text-foreground font-semibold px-6 py-3.5 rounded-full inline-flex items-center gap-2 hover:scale-105 transition-transform">
              <Apple className="size-4" /> Download iOS
            </a>
            <a href="#" className="bg-white text-foreground font-semibold px-6 py-3.5 rounded-full inline-flex items-center gap-2 hover:scale-105 transition-transform">
              <Smartphone className="size-4" /> Download Android
            </a>
            <a href="#" className="bg-white/15 border border-white/30 backdrop-blur font-semibold px-6 py-3.5 rounded-full inline-flex items-center gap-2 hover:bg-white/25 transition">
              <Bike className="size-4" /> Become a Rider
            </a>
            <a href="#" className="bg-white/15 border border-white/30 backdrop-blur font-semibold px-6 py-3.5 rounded-full inline-flex items-center gap-2 hover:bg-white/25 transition">
              <WashingMachine className="size-4" /> Become a Washer
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

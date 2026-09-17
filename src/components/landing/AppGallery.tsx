import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { X, ImagePlus } from "lucide-react";

const screens = [
  { title: "Splash Screen", desc: "First impression. Pure vibes." },
  { title: "Role Selection", desc: "Customer, Rider, or Washer — pick your fighter." },
  { title: "Customer Dashboard", desc: "Your laundry HQ." },
  { title: "Service Selection", desc: "Wash, iron, dry clean — buffet style." },
  { title: "Cart", desc: "Pile your clothes (digitally)." },
  { title: "Payment", desc: "Secure checkout in 3 taps." },
  { title: "Order Tracking", desc: "Live updates from pickup to drop-off." },
  { title: "Rider Dashboard", desc: "Routes, earnings, and beasts mode." },
  { title: "Washer Dashboard", desc: "Manage incoming orders effortlessly." },
  { title: "Route Optimization", desc: "Smart routing magic visualized." },
];

export function AppGallery() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black">A peek inside the <span className="gradient-text">Kora app.</span></h2>
          <p className="text-muted-foreground mt-3">Tap any screen for a closer look.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {screens.map((s, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => setOpen(i)}
              className="glass rounded-3xl p-3 text-left group"
            >
              <div className="aspect-[9/19] rounded-2xl bg-gradient-to-br from-electric/30 via-primary/30 to-sunset/30 grid place-items-center mb-3 overflow-hidden relative">
                <ImagePlus className="size-8 text-foreground/40" />
                <div className="absolute bottom-2 right-2 text-xs glass rounded-full px-2 py-0.5">Soon</div>
              </div>
              <div className="px-1 pb-1">
                <div className="text-sm font-semibold truncate">{s.title}</div>
                <div className="text-xs text-muted-foreground truncate">{s.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl grid place-items-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 max-w-sm w-full relative"
            >
              <button onClick={() => setOpen(null)} className="absolute top-4 right-4 size-9 rounded-full glass grid place-items-center">
                <X className="size-4" />
              </button>
              <div className="aspect-[9/19] rounded-2xl bg-gradient-to-br from-electric/30 via-primary/30 to-sunset/30 grid place-items-center mb-4">
                <ImagePlus className="size-10 text-foreground/40" />
              </div>
              <h3 className="font-display text-2xl font-bold">{screens[open].title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{screens[open].desc}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

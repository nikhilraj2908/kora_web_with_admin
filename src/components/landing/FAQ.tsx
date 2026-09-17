import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  { q: "How fast is pickup?", a: "Within 60 minutes in most cities. We batch nearby orders so your rider is basically already on the way." },
  { q: "What if my clothes get damaged?", a: "Every order is insured up to ₹5,000. Plus our washers are vetted harder than your situationship." },
  { q: "Can I schedule recurring pickups?", a: "Yes. Set it once and laundry becomes someone else’s problem forever." },
  { q: "Do you handle delicate fabrics?", a: "Silk, wool, that linen shirt you overpaid for — all handled with fabric-specific cycles." },
  { q: "What areas do you serve?", a: "Bangalore, Mumbai, Delhi, Hyderabad, Pune. More cities dropping every month." },
  { q: "Is there a minimum order?", a: "Nope. Pick up one shirt if you want. We won’t judge (out loud)." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-coral">Chapter 10 · FAQ</div>
          <h2 className="font-display text-4xl md:text-6xl font-black mt-2">
            Questions you’d ask <span className="gradient-text">your mom first.</span>
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="soft-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-display font-bold text-lg">{f.q}</span>
                <motion.div animate={{ rotate: open === i ? 45 : 0 }} className="size-9 rounded-full gradient-hero grid place-items-center text-white shrink-0">
                  <Plus className="size-4" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-muted-foreground">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

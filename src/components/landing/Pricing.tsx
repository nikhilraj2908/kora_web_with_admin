import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const tiers = [
  {
    name: "Solo",
    price: "₹399",
    period: "/month",
    desc: "For one human and a small pile of regret.",
    features: ["1 pickup / week", "Up to 5 kg per order", "48hr delivery", "Free folding"],
    cta: "Start solo",
    highlight: false,
  },
  {
    name: "Roomies",
    price: "₹799",
    period: "/month",
    desc: "Most loved. Splits beautifully with a flatmate.",
    features: ["2 pickups / week", "Up to 10 kg per order", "24hr delivery", "Free steam iron", "Priority support"],
    cta: "Become a roomie",
    highlight: true,
  },
  {
    name: "Family",
    price: "₹1,499",
    period: "/month",
    desc: "Your mom can finally relax. (She won’t. But she could.)",
    features: ["Unlimited pickups", "Up to 25 kg per order", "Same-day option", "Premium fabric care", "Dedicated washer"],
    cta: "Save the family",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-coral">Chapter 09 · Package</div>
          <h2 className="font-display text-4xl md:text-6xl font-black mt-2">
            Cheaper than your <span className="gradient-text">Sunday brunch.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Transparent plans. No hidden detergent fees. Cancel anytime — but you won’t.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-[2rem] p-7 flex flex-col ${
                t.highlight
                  ? "bg-foreground text-background"
                  : "soft-card"
              }`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-7 inline-flex items-center gap-1 gradient-hero text-white px-3 py-1 rounded-full text-[11px] font-bold">
                  <Sparkles className="size-3" /> Most loved
                </div>
              )}
              <h3 className="font-display text-2xl font-bold">{t.name}</h3>
              <p className={`text-sm mt-2 ${t.highlight ? "text-background/70" : "text-muted-foreground"}`}>{t.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-black">{t.price}</span>
                <span className={t.highlight ? "text-background/60" : "text-muted-foreground"}>{t.period}</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`size-4 mt-0.5 ${t.highlight ? "text-marigold" : "text-coral"}`} /> {f}
                  </li>
                ))}
              </ul>
              <a
                href="#cta"
                className={`mt-7 text-center font-semibold py-3 rounded-full ${
                  t.highlight
                    ? "bg-background text-foreground hover:scale-[1.02]"
                    : "gradient-hero text-white hover:scale-[1.02]"
                } transition-transform`}
              >
                {t.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

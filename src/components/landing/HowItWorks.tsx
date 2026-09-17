import { motion } from "framer-motion";
import { Smartphone, CreditCard, Users, Route, Bike, WashingMachine, MapPin, Heart } from "lucide-react";

const steps = [
  { icon: Smartphone, title: "Pick your service", desc: "Wash, Wash + Iron, or Dry Clean. Tap, done." },
  { icon: CreditCard, title: "Pay online", desc: "Secure checkout. No fumbling for cash at the door." },
  { icon: Users, title: "Verified washers", desc: "Order goes to trusted laundry partners nearby." },
  { icon: Route, title: "Smart rider grouping", desc: "Kora batches nearby pickups, calculates the shortest route, saves fuel and time." },
  { icon: Bike, title: "Rider pickup", desc: "Your clothes get a glow-up taxi to the washer." },
  { icon: WashingMachine, title: "Wash & iron", desc: "From crusty to crisp. Cinematic transformation." },
  { icon: MapPin, title: "Optimized delivery route", desc: "Another smart route is generated for return trips." },
  { icon: Heart, title: "Fresh clothes, happy you", desc: "“My clothes came back looking richer than me.”" },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex glass rounded-full px-4 py-1.5 text-xs font-medium mb-4">How Kora works</div>
          <h2 className="text-4xl md:text-5xl font-black">From <span className="gradient-text">pile of regret</span> to folded glory</h2>
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-electric via-primary to-sunset opacity-40 -translate-x-1/2" />

          <div className="space-y-10">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: left ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                  className={`md:grid md:grid-cols-2 md:gap-12 items-center ${left ? "" : "md:[&>*:first-child]:order-2"}`}
                >
                  <div className={`glass rounded-3xl p-7 ${left ? "md:text-right" : ""}`}>
                    <div className="text-xs font-mono text-muted-foreground">STEP {String(i + 1).padStart(2, "0")}</div>
                    <h3 className="text-2xl font-bold mt-1 mb-2">{s.title}</h3>
                    <p className="text-muted-foreground">{s.desc}</p>
                  </div>
                  <div className="hidden md:flex justify-center">
                    <motion.div
                      whileInView={{ scale: [0.6, 1.15, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7 }}
                      className="size-20 rounded-2xl gradient-hero grid place-items-center glow-primary relative z-10"
                    >
                      <Icon className="size-9 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Route map mini illustration */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-mono text-muted-foreground">SMART ROUTE OPTIMIZATION</div>
              <h3 className="font-display text-2xl font-bold">5 pickups · 1 rider · 0 wasted km</h3>
            </div>
            <div className="text-3xl">🛵💨</div>
          </div>
          <svg viewBox="0 0 600 160" className="w-full h-32">
            <motion.path
              d="M20,120 C100,40 200,140 300,80 S500,30 580,90"
              fill="none"
              stroke="url(#g)"
              strokeWidth="3"
              strokeDasharray="6 6"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2 }}
            />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0%" stopColor="oklch(0.7 0.25 290)" />
                <stop offset="100%" stopColor="oklch(0.78 0.2 50)" />
              </linearGradient>
            </defs>
            {[80, 180, 300, 420, 540].map((cx, i) => (
              <motion.circle
                key={i}
                cx={cx}
                cy={i % 2 ? 60 : 110}
                r="8"
                fill="oklch(0.72 0.22 330)"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15 }}
              />
            ))}
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

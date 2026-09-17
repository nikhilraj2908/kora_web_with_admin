import { motion } from "framer-motion";
import { Route, PackageCheck, ShieldCheck, MapPinned, Wallet, Zap } from "lucide-react";

const features = [
  { icon: Route, title: "Smart Route Optimization", desc: "Automatically creates the shortest routes for riders." },
  { icon: PackageCheck, title: "Bulk Pickup Scheduling", desc: "Groups orders together to slash delivery costs." },
  { icon: ShieldCheck, title: "Verified Washers", desc: "Hand-picked, trusted laundry partners only." },
  { icon: MapPinned, title: "Real-Time Tracking", desc: "Watch your socks travel like they're on tour." },
  { icon: Wallet, title: "Digital Payments", desc: "Secure online checkout. No awkward change." },
  { icon: Zap, title: "Faster Deliveries", desc: "Optimized ops mean fewer “where are my pants” moments." },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-black">Built like a <span className="gradient-text">tech company</span>, smells like fresh linen.</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="glass rounded-3xl p-7 group"
              >
                <div className="size-12 rounded-2xl gradient-hero grid place-items-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="size-6 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

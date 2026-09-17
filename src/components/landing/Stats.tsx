import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString() + suffix);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration: 2, ease: "easeOut" });
      return () => controls.stop();
    }
  }, [inView, to, count]);

  useEffect(() => rounded.on("change", (v) => { if (ref.current) ref.current.textContent = v; }), [rounded]);

  return <span ref={ref}>0{suffix}</span>;
}

const stats = [
  { value: 120000, suffix: "+", label: "Orders Delivered" },
  { value: 2400, suffix: "+", label: "Active Riders" },
  { value: 850, suffix: "+", label: "Partner Washers" },
  { value: 98, suffix: "%", label: "Happy Customers" },
];

export function Stats() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto glass rounded-3xl p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl md:text-5xl font-black gradient-text">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-muted-foreground mt-2">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

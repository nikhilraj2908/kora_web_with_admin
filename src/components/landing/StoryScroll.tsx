import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";
import { Sparkles, Smartphone, Bike, WashingMachine, PackageCheck, Heart } from "lucide-react";
import chapter1img  from "../../assets/chapter1-img.png";
/* ---------------- Story Scaffold ---------------- */

function Scene({
  id,
  index,
  chapter,
  title,
  description,
  children,
}: {
  id?: string;
  index: number;
  chapter: string;
  title: React.ReactNode;
  description: React.ReactNode;
  children: (p: MotionValue<number>) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  
  const isAlt = index % 2 === 0;
  return (
    <section
      id={id}
      ref={ref}
      className={`relative min-h-[80vh] py-12 md:py-20 px-6 md:px-8 overflow-hidden ${
        isAlt
          ? "bg-gradient-to-br from-mint/10 via-transparent to-coral/10"
          : "bg-gradient-to-bl from-marigold/10 via-transparent to-primary/5"
      }`}
    >
      {/* soft divider glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      <div
        className={`pointer-events-none absolute -z-10 blur-3xl opacity-60 ${
          isAlt ? "left-[-10%] top-10 size-[380px] bg-mint/25" : "right-[-10%] bottom-10 size-[380px] bg-coral/20"
        } rounded-full`}
      />
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-10 md:gap-16 items-start">
        <div className="lg:sticky lg:top-32 self-start">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-coral mb-3 md:mb-4">
            <span className="size-1.5 rounded-full bg-coral" /> Chapter {String(index).padStart(2, "0")} · {chapter}
          </div>
          <div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.02]">{title}</h2>
            <p className="mt-4 md:mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div className="relative h-[440px] sm:h-[500px] md:h-[530px]">{children(scrollYProgress)}</div>
      </div>
    </section>
  );
}

/* ---------------- Scene: Discovery ---------------- */
function StepRow({ step, index, icon, title }: { step: MotionValue<number>; index: number; icon: string; title: string }) {
  const active = useTransform(step, (v) => (v >= index ? 1 : 0.35));
  const tint = index === 0 ? "bg-coral/10" : index === 1 ? "bg-marigold/15" : "bg-mint/20";
  return (
    <motion.div style={{ opacity: active }} className={`flex items-center gap-3 rounded-2xl border border-border p-3 ${tint}`}>
      <div className="size-10 rounded-xl bg-background grid place-items-center text-xl">{icon}</div>
      <div>
        <div className="text-[10px] font-mono text-muted-foreground">Step 0{index + 1}</div>
        <div className="font-bold text-sm">{title}</div>
      </div>
    </motion.div>
  );
}
function PhoneDiscovery() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 20%"] });
  const phoneScale = useTransform(scrollYProgress, [0, 0.5], [0.7, 1]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const glow = useTransform(scrollYProgress, [0, 0.5], [0.2, 1]);
  const step = useTransform(scrollYProgress, [0.2, 0.45, 0.7, 1], [0, 1, 2, 2]);

  const steps = [
    { t: "Choose service", icon: "🧺" },
    { t: "Pick pickup time", icon: "⏰" },
    { t: "Confirm & relax", icon: "✅" },
  ];

  return (
    <div ref={ref} className="relative h-full grid place-items-center">
      <motion.div style={{ opacity: glow }} className="absolute size-[420px] rounded-full bg-coral/30 blur-3xl" />
      <motion.div style={{ opacity: glow }} className="absolute size-[260px] rounded-full bg-marigold/40 blur-3xl" />
      <motion.div
        style={{ scale: phoneScale, y: phoneY }}
        className="relative w-[240px] sm:w-[280px] h-[480px] sm:h-[560px] rounded-[44px] soft-card p-3 bg-foreground"
      >
        <div className="w-full h-full rounded-[34px] bg-background overflow-hidden flex flex-col">
          <div className="h-8 flex items-center justify-center">
            <div className="w-20 h-4 rounded-b-2xl bg-foreground" />
          </div>
          <div className="px-5 pt-2 pb-5 flex-1 flex flex-col">
            <div className="text-[10px] font-mono text-muted-foreground">KORA</div>
            <div className="font-display font-black text-lg mt-1">Hey 👋 What today?</div>
            <div className="mt-4 space-y-3">
              {steps.map((s, i) => (
                <StepRow key={i} step={step} index={i} icon={s.icon} title={s.t} />
              ))}
            </div>
            <div className="mt-auto rounded-2xl gradient-hero text-white text-center font-bold py-3 text-sm">
              Book pickup · ₹0 fee
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- Scene: Rider pickup ---------------- */
function RiderPickup({ p }: { p: MotionValue<number> }) {
  // rider scoots from "YOU" (left) toward the facility (right)
  const riderX = useTransform(p, [0.15, 0.85], ["18%", "68%"]);
  const wheelRot = useTransform(p, [0, 1], [0, 1440]);
  const wheelRotStr = useTransform(wheelRot, (v) => `rotate(${v}deg)`);
  // dashed live-tracking path draw
  const dash = useTransform(p, [0.1, 0.9], [1, 0]);
  // progress track dots
  const dot2 = useTransform(p, [0.35, 0.55], [0.3, 1]);
  const dot3 = useTransform(p, [0.75, 0.95], [0.3, 1]);
  const trackW = useTransform(p, [0.15, 0.9], ["10%", "100%"]);

  return (
    <div className="relative h-full rounded-3xl overflow-hidden bg-gradient-to-b from-mint/15 via-bubble/30 to-background border border-border">
      {/* Skyline silhouette */}
      <div className="absolute inset-x-0 top-10 bottom-32 flex items-end gap-1.5 px-4 opacity-[0.12] pointer-events-none">
        {[60, 110, 80, 140, 95, 125, 70, 150, 90, 115, 75, 130].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-lg bg-foreground" style={{ height: h }} />
        ))}
      </div>
      {/* Clouds */}
      <div className="absolute top-6 left-1/3 text-2xl opacity-40">☁️</div>
      <div className="absolute top-10 right-1/4 text-xl opacity-40">☁️</div>

      {/* Top pills */}
      <div className="absolute top-4 left-4 soft-card rounded-full px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5">
        📍 Pick-up · <span className="text-mint">ETA 2 min</span>
      </div>
      <div className="absolute top-4 right-4 soft-card rounded-full px-3 py-1.5 text-[11px] font-bold">
        We pick up from your doorstep ✨
      </div>

      {/* Dashed live-tracking arc */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="none">
        <motion.path
          d="M 80 260 C 140 120, 280 120, 340 240"
          fill="none"
          stroke="hsl(var(--mint, 172 66% 40%) / 1)"
          strokeWidth="2"
          strokeDasharray="6 6"
          style={{ pathLength: useTransform(p, [0.1, 0.85], [0, 1]), strokeDashoffset: dash }}
          className="text-mint"
        />
      </svg>

      {/* Live tracking chip on the arc */}
      <div className="absolute top-[32%] left-1/2 -translate-x-1/2 soft-card rounded-full px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-mint animate-pulse" /> Live tracking
      </div>

      {/* Ground line */}
      <div className="absolute inset-x-6 bottom-28 h-px bg-foreground/20" />

      {/* YOU at doorstep (left) */}
      <div className="absolute bottom-28 left-4 flex flex-col items-center">
        <div className="relative">
          <div className="text-5xl leading-none">🏠</div>
          <div className="text-3xl absolute -right-4 bottom-0">🧍‍♂️</div>
        </div>
        <div className="mt-2 bg-foreground text-background text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-widest">YOU</div>
        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">Pickup Point</div>
      </div>

      {/* Rider (middle, animated) */}
      <motion.div style={{ left: riderX }} className="absolute bottom-28 -translate-x-1/2 flex flex-col items-center">
        <div className="relative text-6xl leading-none">
          🛵
          <motion.span style={{ transform: wheelRotStr }} className="absolute -bottom-0.5 left-2 size-2.5 rounded-full border-2 border-foreground/50" />
          <motion.span style={{ transform: wheelRotStr }} className="absolute -bottom-0.5 right-3 size-2.5 rounded-full border-2 border-foreground/50" />
          <div className="absolute -top-1 left-4 text-lg">🧺</div>
        </div>
        <div className="mt-2 bg-mint text-white text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-widest">RIDER RAJ</div>
        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">On the way</div>
      </motion.div>

      {/* Care facility (right) */}
      <div className="absolute bottom-28 right-4 flex flex-col items-center">
        <div className="relative">
          <div className="text-5xl leading-none">🏢</div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-mint text-white text-[8px] font-black px-1.5 py-0.5 rounded">KORA</div>
        </div>
        <div className="mt-2 bg-foreground/70 text-background text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-widest">CARE FACILITY</div>
        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">In Progress</div>
      </div>

      {/* Progress track */}
      <div className="absolute bottom-10 inset-x-8">
        <div className="relative h-1 rounded-full bg-foreground/10">
          <motion.div style={{ width: trackW }} className="absolute inset-y-0 left-0 rounded-full bg-mint" />
          <div className="absolute -top-1 left-0 size-3 rounded-full bg-mint" />
          <motion.div style={{ opacity: dot2 }} className="absolute -top-1 left-1/2 -translate-x-1/2 size-3 rounded-full bg-mint" />
          <motion.div style={{ opacity: dot3 }} className="absolute -top-1 right-0 size-3 rounded-full bg-mint" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Scene: Magic factory ---------------- */
function MagicFactory({ p }: { p: MotionValue<number> }) {
  const rot = useTransform(p, [0, 1], [0, 720]);
  const bubbles = Array.from({ length: 12 });
  const labels = [
    { t: "Deep Clean", x: "5%", y: "8%" },
    { t: "Premium Detergent", x: "60%", y: "4%" },
    { t: "Fabric Care", x: "72%", y: "40%" },
    { t: "Steam Iron", x: "2%", y: "48%" },
    { t: "Fresh Packaging", x: "55%", y: "82%" },
  ];

  return (
    <div className="relative h-full rounded-3xl overflow-hidden bg-gradient-to-br from-coral/15 via-marigold/15 to-mint/20 border border-border">
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative size-56 sm:size-72 rounded-[2.5rem] soft-card p-5">
          <div className="text-[10px] font-mono text-muted-foreground">KORA WASH · CYCLE PREMIUM</div>
          <div className="mt-3 size-40 sm:size-56 mx-auto rounded-full bg-bubble grid place-items-center">
            <motion.div style={{ rotate: rot }} className="size-32 sm:size-48 rounded-full bg-cream border-[10px] border-foreground/10 grid place-items-center">
              <div className="text-4xl sm:text-5xl">👕</div>
            </motion.div>
          </div>
        </div>
      </div>

      {bubbles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: -400, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.4 }}
          className="absolute rounded-full bg-white/70 border border-white"
          style={{
            left: `${5 + (i * 8) % 90}%`,
            bottom: 0,
            width: 14 + (i % 5) * 6,
            height: 14 + (i % 5) * 6,
          }}
        />
      ))}

      {labels.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15 }}
          className="absolute soft-card rounded-full px-3 py-1.5 text-[11px] font-bold"
          style={{ left: l.x, top: l.y }}
        >
          ✦ {l.t}
        </motion.div>
      ))}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs font-mono text-muted-foreground whitespace-nowrap">
        from dirty chaos → fresh perfection
      </div>
    </div>
  );
}

/* ---------------- Scene: Delivery (redesigned) ---------------- */
function Delivery({ p }: { p: MotionValue<number> }) {
  // Delivery scooter drives in from the left
  const scooterX = useTransform(p, [0.1, 0.5], ["-60%", "0%"]);
  const scooterOp = useTransform(p, [0.05, 0.2, 0.55, 0.7], [0, 1, 1, 0]);
  // Door opens & bag reveals
  const bagScale = useTransform(p, [0.55, 0.8], [0, 1]);
  const bagOp = useTransform(p, [0.55, 0.7], [0, 1]);
  const sparkleOp = useTransform(p, [0.65, 0.9], [0, 1]);
  const smileOp = useTransform(p, [0.75, 0.95], [0, 1]);

  return (
    <div className="relative h-full rounded-3xl overflow-hidden bg-gradient-to-b from-mint/25 via-bubble/40 to-marigold/15 border border-border">
      {/* Glow */}
      <motion.div
        style={{ opacity: sparkleOp }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[380px] rounded-full bg-marigold/40 blur-3xl"
      />

      {/* Status pill */}
      <div className="absolute top-6 left-6 soft-card rounded-2xl px-3 py-2 text-xs font-bold flex items-center gap-2">
        <span className="size-2 rounded-full bg-mint animate-pulse" />
        Out for delivery
      </div>

      {/* Timeline chips */}
      <div className="absolute top-6 right-6 hidden sm:flex flex-col gap-1.5 text-[10px] font-mono">
        <div className="soft-card rounded-full px-3 py-1">✓ Washed</div>
        <div className="soft-card rounded-full px-3 py-1">✓ Ironed</div>
        <div className="soft-card rounded-full px-3 py-1 bg-mint/30">→ At your door</div>
      </div>

      {/* Road */}
      <div className="absolute inset-x-0 bottom-24 h-px bg-foreground/25" />
      <div className="absolute inset-x-0 bottom-20 h-1 bg-foreground/10" />

      {/* Scooter driving in */}
      <motion.div
        style={{ x: scooterX, opacity: scooterOp }}
        className="absolute bottom-24 left-6 text-6xl sm:text-7xl"
      >
        🛵
      </motion.div>

      {/* Doorway / delivered bag */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <motion.div
          style={{ scale: bagScale, opacity: bagOp }}
          className="relative w-56 sm:w-64 h-56 sm:h-64 rounded-[2rem] soft-card grid place-items-center"
        >
          <div className="text-[100px] sm:text-[120px] leading-none">🛍️</div>

          {/* sparkles */}
          <motion.div style={{ opacity: sparkleOp }} className="absolute inset-0 pointer-events-none">
            {["✨", "⭐", "✨", "💫", "✨", "⭐"].map((s, i) => (
              <motion.span
                key={i}
                animate={{ scale: [0.6, 1.3, 0.6], rotate: [0, 180, 360] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
                className="absolute text-2xl sm:text-3xl"
                style={{ left: `${10 + i * 14}%`, top: `${10 + ((i * 27) % 70)}%` }}
              >
                {s}
              </motion.span>
            ))}
          </motion.div>

          {/* fresh tag */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-hero text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            Fresh · Folded
          </div>
        </motion.div>
      </div>

      {/* Happy customer emoji */}
      <motion.div
        style={{ opacity: smileOp }}
        className="absolute bottom-6 right-8 text-5xl"
      >
        🥰
      </motion.div>

      <motion.div
        style={{ opacity: smileOp }}
        className="absolute bottom-6 left-6 soft-card rounded-2xl px-3 py-2 text-xs font-bold rotate-[-3deg]"
      >
        smells better than your situationship
      </motion.div>
    </div>
  );
}

/* ---------------- Scene: Happy ending (redesigned) ---------------- */
function HappyEnding({ p }: { p: MotionValue<number> }) {
  const oldOp = useTransform(p, [0.1, 0.45], [1, 0]);
  const oldScale = useTransform(p, [0.1, 0.45], [1, 0.6]);
  const newOp = useTransform(p, [0.4, 0.75], [0, 1]);
  const newScale = useTransform(p, [0.4, 0.75], [0.7, 1]);
  const ringRot = useTransform(p, [0, 1], [0, 360]);

  const perks = [
    { e: "☕", t: "Sunday coffee" },
    { e: "📺", t: "Bingeing S3" },
    { e: "🛋️", t: "Couch mode" },
    { e: "✨", t: "Zero laundry" },
  ];

  return (
    <div className="relative h-full rounded-3xl overflow-hidden bg-gradient-to-br from-marigold/25 via-coral/10 to-mint/25 border border-border">
      {/* rotating ring */}
      <motion.div
        style={{ rotate: ringRot }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[420px] rounded-full border-2 border-dashed border-foreground/15"
      />

      {/* BEFORE */}
      <motion.div
        style={{ opacity: oldOp, scale: oldScale }}
        className="absolute inset-0 grid place-items-center text-center"
      >
        <div>
          <div className="text-[110px] sm:text-[130px]">😩</div>
          <div className="font-mono text-[11px] mt-2 tracking-widest text-coral">BEFORE KORA</div>
          <div className="mt-2 text-xs text-muted-foreground max-w-[240px] mx-auto">
            Sundays lost to piles of laundry.
          </div>
        </div>
      </motion.div>

      {/* AFTER */}
      <motion.div
        style={{ opacity: newOp, scale: newScale }}
        className="absolute inset-0 grid place-items-center text-center px-6"
      >
        <div>
          <div className="text-[110px] sm:text-[130px]">🧘‍♂️</div>
          <div className="font-mono text-[11px] mt-2 tracking-widest text-mint">AFTER KORA</div>
          <div className="mt-2 text-sm font-bold">Weekend saved successfully ✅</div>

          {/* perk chips */}
          <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
            {perks.map((pk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 * i }}
                className="soft-card rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
              >
                <span>{pk.e}</span>
                <span>{pk.t}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* corner note */}
      <div className="absolute top-6 right-6 soft-card rounded-2xl px-3 py-2 text-xs font-bold rotate-2">
        + 4 hrs/week to yourself
      </div>
    </div>
  );
}

/* ---------------- Public component ---------------- */

export function StoryScroll() {
  return (
    <div id="story" className="relative">
     <Scene
        index={2}
        chapter="Discovery"
        title={<>You open <span className="gradient-text">Kora.</span> Chaos pauses.</>}
        description={<>Three taps. No calls, no forms. Pick your service, choose a pickup slot, and confirm — the app does the rest while you get back to your day.</>}
      >
        {(scrollProgress) => {
          // Popup animation
          const popupScale = useTransform(
            scrollProgress, 
            [0, 0.2, 0.35, 0.5], 
            [0.3, 0.9, 1.05, 1]
          );
          const popupOpacity = useTransform(
            scrollProgress, 
            [0, 0.15, 0.3], 
            [0, 1, 1]
          );
          const popupY = useTransform(
            scrollProgress, 
            [0, 0.2, 0.5], 
            [60, -15, 0]
          );
          const rotate = useTransform(
            scrollProgress, 
            [0, 0.3, 0.5], 
            [-5, 2, 0]
          );

          return (
            <motion.div 
              className="relative h-full w-full flex items-center justify-center"
              style={{
                opacity: popupOpacity,
                y: popupY,
              }}
            >
              {/* Background glow */}
              <motion.div
                style={{
                  opacity: useTransform(scrollProgress, [0, 0.2, 0.6], [0, 0.5, 0.2]),
                  scale: useTransform(scrollProgress, [0, 0.4], [0.5, 1.5]),
                }}
                className="absolute w-[350px] h-[350px] rounded-full bg-gradient-to-br from-coral/30 via-marigold/20 to-mint/20 blur-3xl"
              />

              {/* Phone container - responsive sizing */}
              <motion.div 
                style={{
                  scale: popupScale,
                  rotate: rotate,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  mass: 0.8,
                }}
              >
                <img 
                  src={chapter1img} 
                  alt="Kora App Interface" 
                  className="w-full h-full object-cover object-top"
                />
              </motion.div>

       
            </motion.div>
          );
        }}
      </Scene>


      <Scene
        index={3}
        chapter="Nice to meet you"
        title={<>A rider zips in. You don't even <span className="gradient-text">leave the couch.</span></>}
        description={
          <>
            Rider Raj rolls up right on time, scans your bag at the door, and heads to our care facility. Live tracking on your phone the whole way — no guessing, no waiting.
            <div className="mt-6 flex items-center gap-6">
              {[
                { i: "📍", t: "Real-time", s: "Tracking" },
                { i: "🛡️", t: "Secure", s: "Handling" },
                { i: "⏱️", t: "On-time", s: "Guarantee" },
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="size-11 rounded-full border border-mint/40 bg-mint/10 grid place-items-center text-lg">{f.i}</div>
                  <div className="mt-2 text-[11px] font-bold leading-tight">{f.t}<br/>{f.s}</div>
                </div>
              ))}
            </div>
          </>
        }
      >
        {(p) => <RiderPickup p={p} />}
      </Scene>

      <Scene
        index={4}
        chapter="Your cloth on vacation 😎"
        title={<>Backstage, your clothes get the <span className="gradient-text">spa day</span> they begged for.</>}
        description={<>Fabric-safe detergents, temperature-tuned cycles, steam ironing, and gentle folding — handled by trained washers who treat every shirt like it's their own.</>}
      >
        {(p) => <MagicFactory p={p} />}
      </Scene>

      <Scene
        index={5}
        chapter="Yipppy....see you again"
        title={<>Doorbell. Folded. <span className="gradient-text">Sparkling.</span></>}
        description={<>Fresh, folded, and neatly packed — delivered back to your door in as little as 24 hours. Contactless drop-off, real-time ETA, zero effort from you.</>}
      >
        {(p) => <Delivery p={p} />}
      </Scene>

      <Scene
        index={6}
        chapter="The good ending"
        title={<>Your clothes are working. <span className="gradient-text">You don't have to.</span></>}
        description={<>No more Sunday laundry marathons. Just clean clothes, empty baskets, and a weekend that's finally yours again. This is life on Kora.</>}
      >
        {(p) => <HappyEnding p={p} />}
      </Scene>

      {/* mini icon strip */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { i: Smartphone, t: "Tap" },
            { i: Bike, t: "Pickup" },
            { i: WashingMachine, t: "Wash & Iron" },
            { i: PackageCheck, t: "Deliver" },
            { i: Heart, t: "Chill" },
          ].map(({ i: Ic, t }, k) => (
            <div key={k} className="soft-card rounded-2xl p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl gradient-hero grid place-items-center"><Ic className="size-5 text-white" /></div>
              <div className="font-bold">{t}</div>
              {k < 4 && <Sparkles className="size-3 text-muted-foreground ml-auto" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
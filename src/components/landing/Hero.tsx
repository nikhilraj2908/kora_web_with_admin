import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useRef } from "react";
import heroVideo from "@/assets/kora-vdo1.mp4";

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
    >
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* Theme-aware overlay */}
        {/* Light mode = soft white overlay */}
        {/* Dark mode = strong black overlay */}
        <div className="absolute inset-0 bg-white/15 dark:bg-black/35" />

        {/* Extra readability gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 dark:from-black/60 dark:via-black/20 dark:to-black/70" />
      </div>

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 w-full flex items-center justify-center text-center"
      >
        <div className="max-w-4xl mt-5">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold bg-foreground text-background shadow-lg"
          >
            <span className="size-1.5 rounded-full bg-marigold animate-pulse " />
            Laundry. But you forgot it exists.
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="mt-6 text-[clamp(3rem,8vw,6rem)] font-black leading-[0.95] tracking-tight text-slate-900 dark:text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
          >
            Stop Washing. <br />
            <span className="bg-gradient-to-r from-cyan-500 via-teal-400 to-orange-400 bg-clip-text text-transparent">
              Start Living.
            </span>
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 text-lg md:text-2xl text-white dark:text-white/90 max-w-2xl mx-auto leading-relaxed"
          >
            Laundry is stealing your weekends. Kora gives them back —
            pickup, wash, iron, delivery. You just chill.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 sm:mt-10 flex flex-nowrap justify-center gap-2 sm:gap-4"
          >
            <a
              href="#cta"
              className="group gradient-hero text-white text-xs sm:text-base font-semibold px-4 py-3 sm:px-7 sm:py-4 rounded-full inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap glow-primary hover:scale-105 transition-transform"
            >
              Book Pickup
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#story"
              className="text-xs sm:text-base font-semibold px-4 py-3 sm:px-7 sm:py-4 rounded-full inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap border border-slate-300/70 dark:border-white/20 bg-white/70 dark:bg-black/30 backdrop-blur-md text-slate-800 dark:text-white hover:bg-white/90 dark:hover:bg-white/10 transition"
            >
              <PlayCircle className="size-4" /> How it works
            </a>
          </motion.div>

          {/* Stats */}
<div
  className="
    mt-8 sm:mt-10
    mx-auto
    flex w-full max-w-[22rem]
    flex-col sm:inline-flex sm:w-auto sm:max-w-none sm:flex-row
    items-center
    justify-center
    gap-3 sm:gap-5
    rounded-3xl sm:rounded-full
    px-3 py-3 sm:px-4 sm:py-2
    bg-foreground/50
    backdrop-blur-md
    border
    border-white/40
    shadow-lg
  "
>
  <div className="flex -space-x-2" aria-hidden="true">
    {["🧺", "👕", "👖", "🧥", "🧦"].map((e, i) => (
      <div
        key={i}
        className="
          size-9 sm:size-10
          rounded-full
          bg-white/85
          backdrop-blur-md
          border
          border-white/70
          grid
          place-items-center
          text-base
          shadow-sm
        "
      >
        {e}
      </div>
    ))}
  </div>

  <div className="min-w-0 text-center sm:text-left">
    <div className="text-sm sm:text-base font-bold leading-tight text-white dark:text-white">
      50,000+ loads rescued
    </div>

    <div className="mt-1 text-xs sm:text-sm leading-tight text-white dark:text-white/75">
      …and counting this month
    </div>
  </div>
</div>
        </div>
      </motion.div>
    </section>
  );
}

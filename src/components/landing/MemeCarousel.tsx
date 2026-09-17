import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

type Meme = { top: string; body: string; emoji: string; tint: string };

const memes: Meme[] = [
  { top: "Expectation", body: "“Quick wash, 10 mins max.”", emoji: "🕒", tint: "bg-coral/15" },
  { top: "Reality", body: "“Whole day gone. Found a sock from 2022.”", emoji: "🫠", tint: "bg-marigold/20" },
  { top: "Me, Sunday morning", body: "“I’ll do laundry tomorrow.”", emoji: "😎", tint: "bg-mint/25" },
  { top: "Tomorrow", body: "Became next week. Became next month.", emoji: "📅", tint: "bg-bubble/40" },
  { top: "Mom", body: "“Kapde dho liye?”", emoji: "📞", tint: "bg-coral/15" },
  { top: "Me", body: "“Mentally yes 🙏”", emoji: "🧘", tint: "bg-marigold/20" },
  { top: "Friend", body: "“Bro why all your shirts smell like detergent and regret?”", emoji: "👃", tint: "bg-mint/25" },
  { top: "That one shirt", body: "“Wash me on delicate or I become a crop top.”", emoji: "👚", tint: "bg-bubble/40" },
  { top: "Washing machine", body: "“I ate one sock. You’ll never find it. 😈”", emoji: "🌀", tint: "bg-coral/15" },
  { top: "White t-shirt", body: "“Went in white. Came out ✨vintage beige✨.”", emoji: "👕", tint: "bg-marigold/20" },
  { top: "Roommate", body: "“Whose underwear is drying on my chair??”", emoji: "😱", tint: "bg-mint/25" },
  { top: "Me at 2am", body: "“Iron the shirt or wear a hoodie to the meeting?”", emoji: "🤔", tint: "bg-bubble/40" },
  { top: "Detergent", body: "“Bro I’m literally water at this point.”", emoji: "🧴", tint: "bg-coral/15" },
  { top: "Weekend plan", body: "Netflix, chill, and 4 loads of laundry.", emoji: "🛋️", tint: "bg-marigold/20" },
];

function Card3D({
  m,
  i,
  total,
  progress,
}: {
  m: Meme;
  i: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const side: "left" | "right" = i % 2 === 0 ? "left" : "right";
  // Each card owns a slice of the scroll timeline.
  const slice = 1 / total;
  const start = i * slice;
  const mid = start + slice * 0.55;
  const end = Math.min(1, start + slice * 1.4); // overlap with next, clamped to [0,1]

  const x = useTransform(
    progress,
    [start, mid, end],
    side === "left" ? ["-60%", "0%", "6%"] : ["60%", "0%", "-6%"]
  );
  const rotateY = useTransform(
    progress,
    [start, mid, end],
    side === "left" ? [-55, 0, 8] : [55, 0, -8]
  );
  const rotateZ = useTransform(
    progress,
    [start, mid, end],
    side === "left" ? [-10, 0, 2] : [10, 0, -2]
  );
  const opacity = useTransform(progress, [start, mid, end], [0, 1, 0.9]);
  const scale = useTransform(progress, [start, mid, end], [0.75, 1, 0.95]);

  const align =
    side === "left"
      ? "md:mr-auto md:ml-0"
      : "md:ml-auto md:mr-0";

  return (
    <motion.div
      style={{
        x,
        rotateY,
        rotateZ,
        opacity,
        scale,
        transformStyle: "preserve-3d",
        transformPerspective: 1200,
      }}
      className={`sticky top-1/2 -translate-y-1/2 w-[300px] md:w-[420px] ${align}`}
    >
      <div
        className={`rounded-3xl soft-card p-7 md:p-8 ${m.tint} shadow-2xl`}
        style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.25)" }}
      >
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            {m.top}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            #{String(i + 1).padStart(2, "0")}
          </div>
        </div>
        <div className="font-display text-2xl md:text-3xl font-black leading-snug mt-3">
          {m.body}
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="text-5xl">{m.emoji}</div>
          <div className="text-[10px] font-mono text-muted-foreground">
            {side === "left" ? "← from the left" : "from the right →"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MemeCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={ref}
      className="relative"
      // tight per-card scroll — chapter 3 should appear right after the last card settles
      style={{ height: `${memes.length * 38}vh` }}
    >
      {/* sticky heading */}
      <div className="sticky top-0 z-10 pt-24 pb-6 bg-gradient-to-b from-background via-background to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-coral">
            <span className="size-1.5 rounded-full bg-coral" /> Chapter 02
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4 mt-2">
            <h2 className="font-display text-4xl md:text-6xl font-black max-w-2xl leading-[1]">
              We’ve all <span className="gradient-text">been there.</span>
            </h2>
            <p className="text-muted-foreground max-w-sm">
              Keep scrolling — memes fly in from left and right in 3D. Screenshot the ones that hurt.
            </p>
          </div>
        </div>
      </div>

      {/* 3D card stage — each card is sticky-centered and animated by scroll progress */}
      <div
        className="relative max-w-6xl mx-auto px-4"
        style={{ perspective: "1400px" }}
      >
        {memes.map((m, i) => (
          <Card3D
            key={i}
            m={m}
            i={i}
            total={memes.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Sun, Moon, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import koraLogo from "../../assets/icon.png";

export function Nav() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
    >
      <div
        className={`mx-auto max-w-6xl rounded-full px-5 py-3 flex items-center justify-between transition-all ${
          scrolled ? "soft-card" : "glass"
        }`}
      >
        <a href="#" className="flex items-center gap-2.5 font-display font-bold">
          <img
            src={koraLogo}
            alt="Kora Laundry logo"
            className="size-10 rounded-2xl object-cover shadow-md ring-1 ring-border"
          />
        </a>
        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#story" className="hover:text-foreground transition">Story</a>
          <a href="#services" className="hover:text-foreground transition">Services</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="size-9 rounded-full grid place-items-center hover:bg-foreground/5 transition border border-border"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <a
            href="#cta"
            className="hidden sm:inline-flex text-sm font-semibold gradient-hero text-white px-4 py-2 rounded-full hover:scale-105 transition-transform"
          >
            Book Pickup
          </a>
          <button className="md:hidden size-9 rounded-full grid place-items-center border border-border">
            <Menu className="size-4" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

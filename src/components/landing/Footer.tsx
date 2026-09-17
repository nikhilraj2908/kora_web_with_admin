import { Instagram, Twitter, Youtube } from "lucide-react";
import koraLogo from "@/assets/kora-logo.jpeg.asset.json";

export function Footer() {
  return (
    <footer className="border-t border-border py-14 px-4 bg-foreground text-background">
      <div className="max-w-7xl mx-auto grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
        <div>
          <div className="flex items-center gap-2.5 font-display font-bold">
            <img src={koraLogo.url} alt="Kora Laundry logo" className="size-10 rounded-2xl object-cover" />
            <span className="text-lg">Kora Laundry</span>
          </div>
          <p className="text-sm text-background/60 mt-4 max-w-xs">
            Outsource the chore. Keep the vibe. Made for humans who have better things to do.
          </p>
          <div className="flex gap-2 mt-5">
            {[Instagram, Twitter, Youtube].map((Ic, i) => (
              <a key={i} href="#" className="size-9 rounded-full border border-background/20 grid place-items-center hover:bg-background/10 transition">
                <Ic className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="font-display font-bold mb-3">Company</div>
          <ul className="space-y-2 text-sm text-background/70">
            {["About", "Careers", "Press", "Contact"].map((l) => <li key={l}><a href="#" className="hover:text-background">{l}</a></li>)}
          </ul>
        </div>
        <div>
          <div className="font-display font-bold mb-3">Product</div>
          <ul className="space-y-2 text-sm text-background/70">
            {["Services", "Pricing", "How it works", "FAQ"].map((l) => <li key={l}><a href="#" className="hover:text-background">{l}</a></li>)}
          </ul>
        </div>
        <div>
          <div className="font-display font-bold mb-3">Legal</div>
          <ul className="space-y-2 text-sm text-background/70">
            {["Privacy Policy", "Terms", "Refund Policy"].map((l) => <li key={l}><a href="#" className="hover:text-background">{l}</a></li>)}
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-background/10 text-xs text-background/50 flex justify-between flex-wrap gap-2">
        <span>© 2026 Kora Laundry. All rights reserved.</span>
        <span>Made with 🧼 + ❤️ in India</span>
      </div>
    </footer>
  );
}

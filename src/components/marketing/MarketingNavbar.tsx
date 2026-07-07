import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Github, Shield } from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Technology", href: "#tech" },
  { label: "Developers", href: "#developers" },
];

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={`flex w-full w-full items-center justify-between border-b px-3 py-2.5 transition-all duration-500 ${
          scrolled ? "glass-strong ring-glow" : "glass"
        }`}
      >
        <Link to="/" className="group flex items-center gap-2.5 pl-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 via-secondary/20 to-purple/30">
            <Shield className="h-4 w-4 text-primary" strokeWidth={2.2} />
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
          </div>
          <span className="text-sm font-medium tracking-tight text-foreground">
            WRAPLAYER
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
              >
                {n.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://github.com/Yash-arch-ui/WRAPLAYER"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
          </li>
        </ul>

        <Link
          to="/dashboard"
          className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-95"
        >
          <span className="relative z-10">Launch App</span>
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </Link>
      </nav>
    </motion.header>
  );
}

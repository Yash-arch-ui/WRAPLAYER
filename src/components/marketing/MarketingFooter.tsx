import { Github, Shield } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 via-secondary/20 to-purple/30">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium tracking-tight">Confidential Registry</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              A confidential asset layer for the on-chain world — powered by Zama FHEVM.
            </p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">
              Protocol
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/registry" className="text-foreground/80 hover:text-primary">Registry</Link></li>
              <li><Link to="/faucet" className="text-foreground/80 hover:text-primary">Faucet</Link></li>
              <li><Link to="/decrypt" className="text-foreground/80 hover:text-primary">Decrypt</Link></li>
              <li><Link to="/docs" className="text-foreground/80 hover:text-primary">Documentation</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">
              Resources
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="https://github.com/Yash-arch-ui/WRAPLAYER" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-primary">
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              </li>
              <li><a href="https://www.zama.ai" target="_blank" rel="noreferrer" className="text-foreground/80 hover:text-primary">Zama</a></li>
              <li><a href="https://docs.zama.ai/fhevm" target="_blank" rel="noreferrer" className="text-foreground/80 hover:text-primary">FHEVM Docs</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Confidential Registry. All rights reserved.</p>
          <p>Built with <span className="text-primary">♥</span> using FHEVM</p>
        </div>
      </div>
    </footer>
  );
}

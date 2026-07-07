import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import ConnectWallet from "../ConnectWallet";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { AlertTriangle, Clock } from "lucide-react";
import {toast} from "sonner";
const APP_NAV = [
  { label: "Dashboard", to: "/dashboard" as const },
  { label: "Registry", to: "/registry" as const },
  { label: "Faucet", to: "/faucet" as const },
  { label: "Decrypt", to: "/decrypt" as const },
  { label: "Docs", to: "/docs" as const },
];

function truncate(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const isMainnet = isConnected && chainId === mainnet.id;
  const isWrongNetwork = isConnected && chainId !== sepolia.id && !isMainnet;

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
  if (typeof window === "undefined") return;

  const hasInjectedWallet =
    typeof (window as any).ethereum !== "undefined";

  if (!hasInjectedWallet && !sessionStorage.getItem("wallet-toast")) {
    sessionStorage.setItem("wallet-toast", "shown");

    toast.error(
      "No wallet detected. Please install MetaMask or another injected wallet."
    );
  }
}, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-60" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[600px] rounded-full bg-purple/10 blur-[120px]" />
      </div>

      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          className={`flex w-full items-center justify-between px-6 py-4 transition-all duration-500 border-b ${
            scrolled
              ? "bg-background/80 backdrop-blur-md border-border/80 shadow-sm"
              : "bg-background/40 backdrop-blur-sm border-border/40"
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 via-secondary/20 to-purple/30">
              <Shield className="h-4 w-4 text-primary" strokeWidth={2.2} />
            </div>
            <span className="hidden text-sm font-medium tracking-tight text-foreground sm:inline">
              WRAP LAYER
            </span>
          </Link>

          <ul className="hidden items-center gap-0.5 md:flex">
            {APP_NAV.map((n) => {
              const active =
                pathname === n.to ||
                (n.to !== "/dashboard" && pathname.startsWith(n.to));
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                      active
                        ? "bg-white/[0.06] text-foreground"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                    }`}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <ConnectWallet />
        </nav>
      </motion.header>
      {isMainnet && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-24 left-1/2 z-50 w-[95%] max-w-2xl -translate-x-1/2"
        >
          <div className="flex items-center justify-between rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0 text-yellow-400" />
              <div>
                <h3 className="font-semibold text-yellow-300">
                  Mainnet temporarily unavailable
                </h3>
                <p className="text-sm text-muted-foreground">
                  Zama's mainnet wrappers are paused pending legal resolution.{" "}
                  <span className="font-medium text-yellow-300/80">
                    Switch to Sepolia to use WrapLayer today.
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => switchChain({ chainId: sepolia.id })}
              disabled={isPending}
              className="ml-4 shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Switching…" : "Use Sepolia"}
            </button>
          </div>
        </motion.div>
      )}

      {isWrongNetwork && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-24 left-1/2 z-50 w-[95%] max-w-2xl -translate-x-1/2"
        >
          <div className="flex items-center justify-between rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400" />
              <div>
                <h3 className="font-semibold text-yellow-300">Wrong network</h3>
                <p className="text-sm text-muted-foreground">
                  Switch to{" "}
                  <span className="font-medium">Sepolia Testnet</span> to use
                  WrapLayer.
                </p>
              </div>
            </div>
            <button
              onClick={() => switchChain({ chainId: sepolia.id })}
              disabled={isPending}
              className="ml-4 shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Switching…" : "Switch Network"}
            </button>
          </div>
        </motion.div>
      )}

      <main
        className={`pt-28 pb-24 transition-all duration-300 ${
          isWrongNetwork || isMainnet ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}

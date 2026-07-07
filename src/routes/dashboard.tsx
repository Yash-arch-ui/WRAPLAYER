import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Search,
  Droplets,
  Eye,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  Shield,
  Send,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell } from "../components/app/AppShell";
import { useAccount } from "wagmi";
import { getRegistryPairs } from "../lib/registry";
import { useZamaSDK } from "@zama-fhe/react-sdk";
import { getTokenInfo } from "@/lib/token";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Confidential Registry" },
      { name: "description", content: "Your confidential asset command center." },
    ],
  }),
  component: DashboardPage,
});

const QUICK = [
  { to: "/registry" as const, label: "Registry Explorer", desc: "Browse wrapper pairs", icon: Search },
  { to: "/faucet" as const, label: "Mock Faucet", desc: "Mint test tokens", icon: Droplets },
  { to: "/decrypt" as const, label: "Decrypt", desc: "Reveal ciphertexts", icon: Eye },
  { to: "/docs" as const, label: "Documentation", desc: "Read the manual", icon: BookOpen },
];

// Define structured interface for live token data mapped from on-chain queries
interface LivePairData {
  id: string;
  underlyingSymbol: string;
  wrapperSymbol: string;
  wrapperName: string;
  underlyingAddress: `0x${string}`;
  wrapperAddress: `0x${string}`;
  chain: string;
  balance: string; // Fetches the actual dynamic user balance instead of a static TVL string
}

function DashboardPage() {
  const { address: userAddress } = useAccount();
  const sdk = useZamaSDK();

  // Real-time states derived from blockchain fetching
  const [livePairs, setLivePairs] = useState<LivePairData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confidentialCount, setConfidentialCount] = useState(0);

  useEffect(() => {
    async function fetchOnChainDashboardData() {
      if (!sdk || !userAddress) return;
      setIsLoading(true);
      try {
        const pairs = await getRegistryPairs(sdk);
        const detailedPairs = await Promise.all(
          pairs.map(async (p, idx) => {
            try {
              const meta = await getTokenInfo(p.tokenAddress, userAddress);

              // 1. Define the variable right here
              const derivedSymbol = meta.name ? meta.name.split(" ")[0].toUpperCase() : "TOKEN";

              return {
                id: `live-${idx}`,
                underlyingSymbol: derivedSymbol,        // 2. Used correctly here
                wrapperSymbol: `c${derivedSymbol}`,     // 3. Used correctly here
                wrapperName: `${meta.name || "Unknown"} Confidential Wrapper`,
                underlyingAddress: p.tokenAddress,
                wrapperAddress: p.confidentialTokenAddress,
                chain: "Sepolia",
                balance:parseFloat(meta.balance).toFixed(4)
              };
            } catch (err) {
              console.error(`Failed loading metadata for address ${p.tokenAddress}:`, err);
              return null;
            }
          })
        );

        const validPairs: LivePairData[] = detailedPairs.filter(
          (p): p is LivePairData => p !== null
        );

        setLivePairs(validPairs);
        const positiveBalances = validPairs.filter(p => Number(p.balance) > 0).length;
        setConfidentialCount(positiveBalances);

      } catch (error) {
        console.error("Critical error building on-chain dashboard portfolio view:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOnChainDashboardData();
    const interval = setInterval(fetchOnChainDashboardData,5000);
    return () => clearInterval(interval);
  }, [sdk, userAddress]);

  // Construct live dynamic statistics grid array from chain/wallet telemetry
  const STATS = [
    { label: "Live Registry Pairs", value: isLoading ? "..." : livePairs.length.toString(), sub: "Fetched from registry", accent: "text-primary" },
    { label: "Network", value: "Sepolia", sub: "chain 11155111", accent: "text-secondary" },
    { label: "Wallet Status", value: userAddress ? "Connected" : "Disconnected", sub: userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : "Connect to interact", accent: userAddress ? "text-green-400" : "text-purple" },
    { label: "Active Wrappers", value: isLoading ? "..." : confidentialCount.toString(), sub: "With non-zero balances (balances>0)", accent: "text-primary" },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
            Dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Your confidential portfolio.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Track pairs, network state, and confidential wrappers in real time directly from the contract.
          </p>
        </motion.div>

        {/* Dynamic Stats Section */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="glass relative overflow-hidden rounded-3xl p-5"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {s.label}
              </p>
              <p className={`mt-3 text-3xl font-semibold tracking-tight ${s.accent}`}>
                {s.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Container */}
        <h2 className="mt-16 text-sm font-mono uppercase tracking-[0.25em] text-muted-foreground">
          Quick Actions
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK.map((q, i) => (
            <motion.div
              key={q.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
            >
              <Link
                to={q.to}
                className="glass group flex h-full flex-col justify-between rounded-3xl p-5 transition hover:-translate-y-0.5 hover:border-primary/30"
              >
                <div className="mb-8 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-inset ring-white/10">
                  <q.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{q.label}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    {q.desc}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Live Pairs Section */}
        <div className="mt-16 flex items-baseline justify-between">
          <h2 className="text-sm font-mono uppercase tracking-[0.25em] text-muted-foreground">
            On-Chain Wrapper Pairs
          </h2>
          <Link
            to="/registry"
            className="text-xs text-primary transition hover:opacity-80"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-8 flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : livePairs.length === 0 ? (
          <p className="mt-6 text-center text-xs font-mono text-muted-foreground/60">
            No live pairs found. Verify wallet connections and contract registry setup.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {livePairs.map((p, i) => (
              <PairCard key={p.id} p={p} delay={i * 0.05} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function PairCard({ p, delay }: { p: LivePairData; delay: number }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (v: string, k: string) => {
    navigator.clipboard.writeText(v);
    setCopied(k);
    setTimeout(() => setCopied(null), 1200);
  };

  const shortAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="glass group relative overflow-hidden rounded-3xl p-5 transition"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 via-secondary/20 to-purple/30 font-mono text-xs">
            {p.underlyingSymbol.slice(0, 2)}
          </div>
          <div>
            <p className="font-medium">
              {p.underlyingSymbol} → {p.wrapperSymbol}
            </p>
            <p className="text-[11px] text-muted-foreground">{p.wrapperName}</p>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
          {p.chain}
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <AddrRow label="Underlying" addr={p.underlyingAddress} onCopy={() => copy(p.underlyingAddress, `${p.id}u`)} copied={copied === `${p.id}u`} shortFn={shortAddress} />
        <AddrRow label="Wrapper" addr={p.wrapperAddress} onCopy={() => copy(p.wrapperAddress, `${p.id}w`)} copied={copied === `${p.id}w`} shortFn={shortAddress} />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Your Balance: <span className="text-foreground font-mono">{p.balance}</span>
        </p>
        <div className="flex gap-1.5">
          <IconBtn icon={Shield} title="Shield" />
          <IconBtn icon={Send} title="Transfer" />
          <IconBtn icon={Eye} title="Unshield" />
        </div>
      </div>
    </motion.div>
  );
}

function AddrRow({
  label,
  addr,
  onCopy,
  copied,
  shortFn
}: {
  label: string;
  addr: string;
  onCopy: () => void;
  copied: boolean;
  shortFn: (a: string) => string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/40 px-3 py-2">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-mono text-[11px]">{shortFn(addr)}</p>
      </div>
      <button
        onClick={onCopy}
        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/[0.05] hover:text-primary"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function IconBtn({ icon: Icon, title }: { icon: typeof Shield; title: string }) {
  return (
    <button
      title={title}
      className="rounded-full border border-border bg-background/40 p-2 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
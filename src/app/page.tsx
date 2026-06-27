"use client";

import ConnectWallet from "@/components/ConnectWallet";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi"; // ─── STEP 3: Get Connected Wallet
import { getRegistryPairs } from "@/lib/registry";
import { getTokenInfo } from "@/lib/token"; // ─── Import your Step 2 helper
import Button from "@/components/ui/Button";
import { 
  Shield, 
  Layers, 
  Cpu, 
  ArrowRight, 
  Activity, 
  ChevronDown,
  Lock,
  Coins,
  Wallet
} from "lucide-react";

// Strongly-typed model for our asset metrics data
type EnrichedTokenPair = {
  tokenAddress: `0x${string}`;
  confidentialTokenAddress: `0x${string}`;
  isValid: boolean;
  name: string;
  decimals: number;
  balance: string;
};

export default function Home() {
  const { address, isConnected } = useAccount(); // Active blockchain account hook instance
  const [pairs, setPairs] = useState<EnrichedTokenPair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAndEnrichPairs() {
      try {
        setLoading(true);
        // 1. Fetch the hardcoded raw core address data array
        const rawPairs = await getRegistryPairs();
        
        // 2. ─── STEP 4: Asynchronously fetch live contract metadata ───
        const enrichedData = await Promise.all(
          rawPairs.map(async (pair) => {
            const tokenMetadata = await getTokenInfo(pair.tokenAddress, address);
            return {
              ...pair,
              ...tokenMetadata // Merges live name, decimals, and balances safely into state object
            };
          })
        );

        setPairs(enrichedData);
      } catch (error) {
        console.error("Failed to compile or enrich token registry:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadAndEnrichPairs();
  }, [address]); // ⚡ Re-triggers instantly whenever a user connects or switches a wallet account!

  // Animation variants for staggered load-in
  const fadeInContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const fadeInUpItem = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white antialiased overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* --- EXTRA FANCY FLOATING GLOW BACKGROUND --- */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[150px]" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-5%] top-[20%] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[160px]" 
        />
        <div className="absolute bottom-[-10%] left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[130px]" />
      </div>

      {/* --- MAC-STYLE FLOATING NAVBAR --- */}
      <header className="sticky top-4 z-50 mx-auto max-w-5xl px-4">
        <div className="mb-2 flex justify-end">
          <ConnectWallet />
        </div>
        
        <nav className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/40 px-6 py-3 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
              <Layers className="h-4 w-4 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">WrapLayer</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#registry-section" className="hover:text-emerald-400 transition-colors">Explorer</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a>
          </div>

          <Button variant="secondary" className="border-white/10 bg-white/5 text-xs px-4 py-2 hover:bg-white/10">
            Launch App
          </Button>
        </nav>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 text-center md:pt-32 md:pb-24">
        <motion.div
          variants={fadeInContainer}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={fadeInUpItem} className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md">
            <Lock className="h-3 w-3 animate-pulse" /> Fully Homomorphic Encryption Built-In
          </motion.div>

          <motion.h1 variants={fadeInUpItem} className="mx-auto max-w-3xl bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl">
            Operating with Secure <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text">Confidential Registries</span>
          </motion.h1>

          <motion.p variants={fadeInUpItem} className="mx-auto max-w-xl text-base text-slate-400 sm:text-lg md:text-xl">
            Wrap Layer seamlessly synthesizes standard assets into fully private tokens. Wrap, view, and decrypt transaction parameters without shedding public balance records.
          </motion.p>

          <motion.div variants={fadeInUpItem} className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="#registry-section">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 font-bold shadow-lg shadow-emerald-500/10 hover:brightness-110">
                Explore Registries <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
            <Button variant="secondary" className="border border-white/10 bg-white/5 px-6 py-3.5 font-medium hover:bg-white/10">
              Read Whitepaper
            </Button>
          </motion.div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-16 flex justify-center text-slate-500 md:mt-24"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      {/* --- FANCY FEATURE HIGHLIGHT PILLARS --- */}
      <section id="features" className="mx-auto max-w-5xl px-6 py-12 border-t border-white/5">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 backdrop-blur-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Shielded Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Powered by Zama, keeping ERC-20 smart contract state securely hidden under FHE.</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 backdrop-blur-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Dual-State Design</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Maps transparent public parameters explicitly with your encrypted counterpart wrappers.</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 backdrop-blur-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant Wrapping</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Lock public liquid tokens straight into active secure registers with zero latency overhead.</p>
          </div>
        </div>
      </section>

      {/* --- LIVE REGISTRY WORKSPACE --- */}
      <section id="registry-section" className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <span className="font-[family-name:var(--font-cursive)] font-normal tracking-wide normal-case bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text pr-2">
              Confidential Registries
            </span>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-white mt-1">Live Wrapper Registry</h2>
            <p className="mt-1 text-sm text-slate-400">Interact and wrap on active cryptographic token combinations directly below.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-white/5 px-4 py-2.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-medium">Total Tracked Pairs:</span>
            <span className="font-bold text-white">{loading ? "..." : pairs.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center rounded-3xl border border-white/5 bg-white/[0.01]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              <span className="text-sm text-slate-400">Streaming wrapper records...</span>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2"
          >
            {pairs.map((pair, index) => (
              <div
                key={pair.confidentialTokenAddress}
                className="group relative rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_10px_40px_rgba(16,185,129,0.05)]"
              >
                {/* Card Header Status */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Pair #{index + 1}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-md ${
                      pair.isValid
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${pair.isValid ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    {pair.isValid ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* ─── LIVE TOKEN METADATA LAYER WORKSPACE ─── */}
                <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-base font-bold tracking-tight text-white truncate max-w-[180px]">
                        {pair.name}
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded-md uppercase font-mono">
                      {pair.decimals} Decimals
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Wallet size={12} className="text-slate-500" /> Live Balance
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-200">
                      {isConnected ? pair.balance : "0.00"}
                    </span>
                  </div>
                </div>

                {/* Cryptographic Ledger Registry Addresses */}
                <div className="space-y-4 mb-8">
                  <div>
                    <span className="block text-xs font-medium text-slate-400 mb-1">Public Token Address</span>
                    <code className="block rounded-lg bg-black/40 px-3 py-2 text-xs font-mono text-slate-300 border border-white/5 truncate select-all">
                      {pair.tokenAddress}
                    </code>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-400 mb-1">Confidential Wrapper Address</span>
                    <code className="block rounded-lg bg-black/40 px-3 py-2 text-xs font-mono text-emerald-300 border border-emerald-500/5 truncate select-all">
                      {pair.confidentialTokenAddress}
                    </code>
                  </div>
                </div>

                {/* Action Suite Context */}
                <div className="flex flex-col gap-2.5 pt-4 border-t border-white/5">
                  {!isConnected && (
                    <div className="w-full">
                      <ConnectWallet />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" disabled={!isConnected} className="w-full justify-center border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-20">
                      Decrypt Balance
                    </Button>
                    <Button variant="danger" disabled={!isConnected} className="w-full justify-center bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-20">
                      Unwrap
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button loading className="w-full justify-center text-slate-400">
                      Wrapping...
                    </Button>
                    <Button disabled className="w-full justify-center opacity-40">
                      Switch Network
                    </Button>
                  </div>
                </div>

              </div>
            ))}
          </motion.div>
        )}
      </section>

      {/* --- FOOTER --- */}
      <footer className="mx-auto max-w-5xl px-6 py-8 border-t border-white/5 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} WrapLayer. Built for secure, confidential asset scaling.
      </footer>
    </div>
  );
}
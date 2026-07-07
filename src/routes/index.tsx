import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { toast} from "sonner";
import {
  ArrowRight,
  Github,
  Shield,
  Search,
  Lock,
  Send,
  Eye,
  Sparkles,
  Zap,
  Code2,
  Layers,
  Database,
  Cpu,
  ChevronRight,
} from "lucide-react";
import { MarketingNavbar } from "../components/marketing/MarketingNavbar";
import { MarketingFooter } from "../components/marketing/MarketingFooter";
import { HeroNodes } from "../components/marketing/HeroNodes";
import {useRegistry} from "../hooks/useRegistry";
import {useEffect,useState} from "react";
import { getRegistryPairs, RegistryTokenPair } from "../lib/registry";
import { useZamaSDK } from "@zama-fhe/react-sdk"; 
export const Route = createFileRoute("/")({
  component: Landing,
});

const FEATURES = [
  {
    icon: Search,
    title: "On-chain Registry Discovery",
    body: "Automatically discovers ERC20 ↔ ERC7984 wrapper pairs directly from the blockchain. No manual lists, no stale JSON.",
  },
  {
    icon: Shield,
    title: "Confidential Shielding",
    body: "Convert public ERC20 balances into ERC7984 confidential wrappers with a single signed transaction.",
  },
  {
    icon: Send,
    title: "Encrypted Transfers",
    body: "Move confidential balances between accounts. Amounts stay encrypted on-chain, verified by FHE.",
  },
  {
    icon: Eye,
    title: "Decryption Toolkit",
    body: "Selectively decrypt ciphertexts you own with an EIP-712 signature. Never leak balances by default.",
  },
];

const STACK = [
  { name: "Zama", sub: "FHEVM", accent: "from-primary/40 to-primary/0" },
  { name: "Next.js", sub: "React 19", accent: "from-secondary/40 to-secondary/0" },
  { name: "TypeScript", sub: "Strict", accent: "from-purple/40 to-purple/0" },
  { name: "TailwindCSS", sub: "v4", accent: "from-primary/40 to-primary/0" },
  { name: "wagmi", sub: "Hooks", accent: "from-secondary/40 to-secondary/0" },
  { name: "viem", sub: "RPC", accent: "from-purple/40 to-purple/0" },
];

const FLOW = [
  { label: "ERC20", icon: Database },
  { label: "Registry", icon: Search },
  { label: "ERC7984", icon: Layers },
  { label: "Shield", icon: Shield },
  { label: "Encrypted", icon: Lock },
  { label: "Transfer", icon: Send },
  { label: "Decrypt", icon: Eye },
];

const CODE_SNIPPETS = [
  {
    title: "Discover pairs",
    lang: "ts",
    code: `import { sdk } from "@confidential/registry";

// Reads pairs directly from the on-chain registry contract.
const pairs = await sdk.registry.listPairs();

for (const p of pairs) {
  console.log(p.underlying, "→", p.wrapper);
}`,
  },
  {
    title: "Shield ERC20 → ERC7984",
    lang: "ts",
    code: `await sdk.shield({
  wrapper: pair.wrapper,
  amount: parseUnits("100", 6),
  to: account,
});
// Emits ConfidentialMint(euint256) on-chain.`,
  },
  {
    title: "Encrypted transfer",
    lang: "ts",
    code: `const enc = await sdk.encrypt(amount, {
  contract: pair.wrapper,
  user: account,
});

await pair.wrapper.transfer(recipient, enc.handle, enc.proof);`,
  },
  {
    title: "Decrypt your balance",
    lang: "ts",
    code: `const ciphertext = await pair.wrapper.balanceOf(account);
const plain = await sdk.decrypt(ciphertext, {
  contract: pair.wrapper,
  signer: account,
});
// plain = 100_000000n`,
  },
];

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl px-6 py-28">
      <div className="mb-14 max-w-2xl">
        {eyebrow && (
          <p className="mb-4 inline-block rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="text-balance text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function Landing() {
  const  sdk  = useZamaSDK();
 const [registryPairs, setRegistryPairs] = useState<RegistryTokenPair[]>([]);
  const [isRegistryLoading, setIsRegistryLoading] = useState(true);
  useEffect(() => {
    async function loadPairs() {
      if (!sdk) return; // Keep loading active or wait until SDK instance mounts

      try {
        setIsRegistryLoading(true);
        const pairs = await getRegistryPairs(sdk);
        setRegistryPairs(pairs);
      } catch (error) {
        console.error("Error executing getRegistryPairs inside route context:", error);
        toast.error("Error executing getRegistryPairs inside route context");
      } finally {
        setIsRegistryLoading(false);
      }
    }

    loadPairs();
  }, [sdk]);
const totalPairsCount = registryPairs.length;
const globalLoadingState = isRegistryLoading;
  const FEATURES = [
    {
      side: "left" as const,
      eyebrow: "01 / DISCOVER",
      title: "On-Chain Registry",
      body: "Browse and interact with secure ERC20 ↔ ERC7984 wrapper pairs verified directly by our smart contracts.",
icon: Search,
      mockup:<RegistryMock pairs={registryPairs} isLoading={isRegistryLoading} />,
    },
    {
         side: "right" as const,
    eyebrow: "02 / SHIELD",
    title: "Encrypt Assets",
    body: "Convert your public tokens into secure, encrypted confidential variants utilizing Zama FHEVM architectures.",
    icon: Shield,
    // Pass the real state values here
    mockup: <ShieldMock pairs={registryPairs} isLoading={isRegistryLoading} />,
    },
    {
      side: "left" as const,
    eyebrow: "03 / PRIVACY",
    title: "Confidential Transfers",
    body: "Execute point-to-point transfers where balances and transaction amounts remain fully encrypted on-chain.",
    icon: Zap,
    // Pass the real state values here
    mockup: <TransferMock pairs={registryPairs} isLoading={isRegistryLoading} />,
    },
  ];
  return (

    <div className="relative overflow-x-clip bg-background">
      <MarketingNavbar />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-70" />
        <div className="absolute left-1/2 top-[-10%] h-[720px] w-[1100px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute right-[-10%] top-[40%] h-[520px] w-[720px] rounded-full bg-purple/10 blur-[140px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[520px] w-[720px] rounded-full bg-secondary/10 blur-[140px]" />
      </div>

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-40 sm:pt-44">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground"
            >
              <Sparkles className="h-3 w-3 text-primary" />
              Powered by Zama FHEVM
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05 }}
              className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[76px]"
            >
              <span className="text-gradient">Confidential Assets.</span>
              <br />
              <span className="text-gradient-brand animate-gradient-shift">
                Discover. Shield.
              </span>
              <br />
              <span className="text-gradient">Transfer. Privately.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              Discover ERC20 ↔ ERC7984 wrapper pairs directly from the on-chain
              registry and interact with confidential assets using Zama FHEVM.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/dashboard"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground glow-teal transition hover:opacity-95"
              >
                Launch App
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
              <a
                href="https://github.com/Yash-arch-ui/WRAPLAYER"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-card"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Sepolia • Zama Devnet
              </div>
              <div className="font-mono">euint32 · euint64 · euint256</div>
              <div>EIP-712 selective decryption</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <HeroNodes />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 space-y-32">
        {FEATURES.map((feat) => (
          <ProductRow
            key={feat.title}
            side={feat.side}
            eyebrow={feat.eyebrow}
            title={feat.title}
            body={feat.body}
            mockup={feat.mockup}
          />
        ))}
        </section>

      {/* TECH STACK */}
      <Section
        id="tech"
        eyebrow="Built On"
        title="A stack made for confidential computation."
        subtitle="Battle-tested primitives, encrypted end-to-end. No experimental hand-waving."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {STACK.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass group relative overflow-hidden rounded-3xl p-5 transition"
            >
              <div
                className={`pointer-events-none absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-br ${s.accent} opacity-0 blur-2xl transition group-hover:opacity-100`}
              />
              <p className="text-base font-medium">{s.name}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {s.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* FEATURES */}
      <Section
        id="features"
        eyebrow="Features"
        title="Everything you need for private on-chain assets."
        subtitle="A registry, a shielding layer, encrypted transfers, and a decryption toolkit — in one composable protocol."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="glass group relative overflow-hidden rounded-3xl p-8 transition"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-purple/20 ring-1 ring-inset ring-white/10">
                <f.icon className="h-5 w-5 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-medium tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* WORKFLOW */}
      <Section
        id="workflow"
        eyebrow="Workflow"
        title="A single flow, encrypted end-to-end."
        subtitle="From a public ERC20 all the way to a decrypted confidential balance — every step verifiable on-chain."
      >
        <div className="glass relative overflow-hidden rounded-3xl p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-purple/[0.04]" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            {FLOW.map((step, i) => (
              <div key={step.label} className="flex flex-1 items-center gap-4 min-w-[130px]">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
                    <step.icon className="h-5 w-5 text-primary" />
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-mono font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                  </div>
                  <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {step.label}
                  </span>
                </motion.div>
                {i < FLOW.length - 1 && (
                  <div className="hidden flex-1 items-center md:flex">
                    <div className="relative h-px w-full overflow-hidden bg-border">
                      <motion.div
                        className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
                        animate={{ x: ["-100%", "300%"] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "linear",
                          delay: i * 0.3,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* SCREENSHOTS / PRODUCT */}
      <Section
        eyebrow="Product"
        title="Feels like a protocol, not a demo."
        subtitle="Every surface — from the registry explorer to the decrypt console — is designed for real on-chain workflows."
      >
        <div className="space-y-16">
          <ProductRow
            side="left"
            eyebrow="Dashboard"
            title="A live view of your confidential portfolio."
            body="Track pairs, wallet status and confidential wrappers at a glance. No refresh, no polling loops — everything is streamed from the chain."
            mockup={<DashboardMock />}
          />
          <ProductRow
            side="right"
            eyebrow="Registry"
            title="Discovered from chain, not from a JSON file."
            body="Every wrapper pair comes straight from the registry contract. Sort, filter, and inspect wrappers with full addresses and copy-safe UI."
            mockup={<RegistryMock />}
          />
          <ProductRow
            side="left"
            eyebrow="Shield"
            title="One transaction, fully confidential."
            body="Approve, shield, and mint an ERC7984 balance. Amounts are encrypted before they hit the mempool."
            mockup={<ShieldMock />}
          />
          <ProductRow
            side="right"
            eyebrow="Transfer"
            title="Move encrypted balances privately."
            body="Recipient, ciphertext, proof — all handled behind a clean interface."
            mockup={<TransferMock />}
          />
        </div>
      </Section>

      {/* CODE SECTION */}
      <Section
        eyebrow="For Developers"
        title="A tiny SDK. A big protocol."
        subtitle="The registry is fetched live from chain — the SDK is a thin ergonomic layer on top."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {CODE_SNIPPETS.map((snip, i) => (
            <motion.div
              key={snip.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="glass overflow-hidden rounded-3xl"
            >
              <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                  <span className="ml-3 font-mono text-[11px] text-muted-foreground">
                    {snip.title}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {snip.lang}
                </span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed">
                <CodeBlock code={snip.code} />
              </pre>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* DEVELOPERS SECTION */}
      <Section
        id="developers"
        eyebrow="For Builders"
        title="Composable, hybrid, open."
        subtitle="Whether you deploy your own registry or plug into an existing one, the primitives stay the same."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Search, title: "Automatic registry discovery", body: "Wrapper pairs are indexed live from the on-chain registry contract." },
            { icon: Layers, title: "Hybrid registry support", body: "Combine multiple registries, or extend with your own without forking." },
            { icon: Cpu, title: "Local configuration", body: "Point the SDK at any RPC — Sepolia, Zama Devnet, or a private fork." },
            { icon: Shield, title: "ERC7984 integration", body: "First-class support for the confidential token standard." },
            { icon: Code2, title: "TypeScript-first SDK", body: "Fully typed. Autocomplete-friendly. No hidden any's." },
            { icon: Github, title: "Open source", body: "MIT-licensed. Every contract, every hook, every page." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass group rounded-3xl p-6 transition"
            >
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-inset ring-white/10">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="font-medium">{f.title}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 py-32">
        <div className="glass-strong relative overflow-hidden rounded-3xl px-8 py-24 text-center ring-glow">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute -bottom-32 left-1/2 h-[320px] w-[720px] -translate-x-1/2 rounded-full bg-purple/20 blur-[120px]" />
            <div className="absolute inset-0 bg-grid opacity-30" />
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight text-gradient sm:text-6xl"
          >
            Ready to explore confidential assets?
          </motion.h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Open the app, connect a wallet, and start shielding. Sepolia and Zama Devnet are live now.
          </p>
          <div className="mt-9 flex justify-center gap-3">
            <Link
              to="/dashboard"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground glow-teal transition hover:opacity-95"
            >
              Launch App
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3.5 text-sm font-medium text-foreground transition hover:border-primary/30"
            >
              Read the docs <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

/* ------- Sub-components ------- */

function ProductRow({
  side,
  eyebrow,
  title,
  body,
  mockup,
}: {
  side: "left" | "right";
  eyebrow: string;
  title: string;
  body: string;
  mockup: React.ReactNode;
}) {
  const flip = side === "right";
  return (
    <div
      className={`grid items-center gap-12 lg:grid-cols-2 ${
        flip ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <motion.div
        initial={{ opacity: 0, x: flip ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
          {eyebrow}
        </p>
        <h3 className="text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
          {title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {body}
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        {mockup}
      </motion.div>
    </div>
  );
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass ring-glow overflow-hidden rounded-3xl">
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
        <div className="ml-3 flex-1 rounded-full bg-background/60 px-3 py-1 font-mono text-[10px] text-muted-foreground">
          confidential-registry.xyz
        </div>
      </div>
      <div className="relative p-4 sm:p-6">{children}</div>
    </div>
  );
}



function DashboardMock({ 
  pairs = [], 
  isLoading = false 
}: { 
  pairs?: RegistryTokenPair[]; 
  isLoading?: boolean 
}) {
  const totalPairs = pairs.length;

  return (
    <BrowserFrame>
      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Pairs", v: isLoading ? "..." : String(totalPairs) },
          { l: "Network", v: "Sepolia" },
          { l: "Wallet", v: "0x9f…c1" },
          { l: "Wrappers", v: isLoading ? "..." : String(totalPairs) },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background/40 p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{s.l}</p>
            <p className="mt-1 text-lg font-medium">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 max-h-[180px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="text-center py-6 text-xs text-muted-foreground font-mono">
            Fetching Zama registry...
          </div>
        ) : pairs.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground font-mono">
            No on-chain pairs found.
          </div>
        ) : (
          pairs.slice(0, 3).map((pair) => (
            <div
              key={pair.tokenAddress}
              className="flex items-center justify-between rounded-2xl border border-border bg-background/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={pair.logo} 
                  alt={pair.symbol} 
                  className="h-7 w-7 rounded-full object-contain bg-background/50 border border-border/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/tokens/default.png";
                  }}
                />
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-medium">
                    {pair.symbol} → c{pair.symbol}
                  </span>
                  <span className="text-[9px] text-muted-foreground max-w-[120px] truncate">
                    {pair.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${pair.isValid ? 'bg-primary' : 'bg-destructive'}`} />
                {pair.isValid ? "Active" : "Disabled"}
              </div>
            </div>
          ))
        )}
      </div>
    </BrowserFrame>
  );
}

function RegistryMock({ 
  pairs = [], 
  isLoading = false 
}: { 
  pairs?: RegistryTokenPair[]; 
  isLoading?: boolean 
}) {
  return (
    <BrowserFrame>
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-[11px] text-muted-foreground">search wrappers…</span>
        </div>
        <button className="rounded-full border border-border bg-background/40 px-3 py-1.5 text-[11px]">TVL ↓</button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 max-h-[180px] overflow-y-auto">
        {isLoading ? (
          <div className="col-span-2 text-center py-8 text-xs text-muted-foreground font-mono">
            Loading registry...
          </div>
        ) : pairs.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-xs text-muted-foreground font-mono">
            No active wrappers found.
          </div>
        ) : (
          pairs.slice(0, 4).map((pair) => {
            // Shorten the address for presentation (e.g., 0x7984...a1b2)
            const addr = pair.confidentialTokenAddress;
            const truncatedAddr = `${addr.slice(0, 8)}…${addr.slice(-4)}`;

            return (
              <div key={pair.tokenAddress} className="rounded-2xl border border-border bg-background/40 p-3">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <img 
                      src={pair.logo} 
                      alt={pair.symbol} 
                      className="h-3.5 w-3.5 rounded-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/tokens/default.png";
                      }}
                    />
                    <span className="font-mono text-xs truncate">
                      {pair.symbol} → c{pair.symbol}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[8px] text-primary">
                    ERC7984
                  </span>
                </div>
                <p className="mt-2 font-mono text-[10px] text-muted-foreground tracking-tight">
                  {truncatedAddr}
                </p>
              </div>
            );
          })
        )}
      </div>
    </BrowserFrame>
  );
}

function ShieldMock({ 
  pairs = [], 
  isLoading = false 
}: { 
  pairs?: RegistryTokenPair[]; 
  isLoading?: boolean 
}) {
  const activePair = pairs.length > 0 ? pairs[0] : null;
  const publicSymbol = activePair ? activePair.symbol : "USDC";
  const confidentialSymbol = activePair ? `c${activePair.symbol}` : "cUSDC";

  return (
    <BrowserFrame>
      <div className="mx-auto max-w-sm space-y-3">
        <div className="rounded-2xl border border-border bg-background/40 p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">From</p>
          <p className="mt-2 flex items-center justify-between text-lg font-medium">
            <span>100.00</span>
            <span className="rounded-full bg-white/[0.04] px-2 py-1 font-mono text-xs flex items-center gap-1.5">
              {activePair && (
                <img 
                  src={activePair.logo} 
                  alt={publicSymbol} 
                  className="h-3.5 w-3.5 rounded-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/tokens/default.png";
                  }}
                />
              )}
              {publicSymbol}
            </span>
          </p>
        </div>
        <div className="flex justify-center">
          <div className="rounded-xl border border-border bg-card p-2">
            <Shield className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">To (encrypted)</p>
          <p className="mt-2 flex items-center justify-between text-lg font-medium">
            <span className="font-mono text-primary">euint256</span>
            <span className="rounded-full bg-primary/10 px-2 py-1 font-mono text-xs text-primary flex items-center gap-1.5">
              {activePair && (
                <img 
                  src={activePair.logo} 
                  alt={confidentialSymbol} 
                  className="h-3.5 w-3.5 rounded-full object-contain brightness-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/tokens/default.png";
                  }}
                />
              )}
              {confidentialSymbol}
            </span>
          </p>
        </div>
        <button 
          disabled={isLoading}
          className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {isLoading ? "Syncing..." : "Shield"}
        </button>
      </div>
    </BrowserFrame>
  );
}
function TransferMock({ 
  pairs = [], 
  isLoading = false 
}: { 
  pairs?: RegistryTokenPair[]; 
  isLoading?: boolean 
}) {
  // Use the first on-chain pair as context, default to cUSDC text if empty
  const activePair = pairs.length > 0 ? pairs[0] : null;
  const confidentialSymbol = activePair ? `c${activePair.symbol}` : "cUSDC";

  return (
    <BrowserFrame>
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-background/40 p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Recipient</p>
          <p className="mt-2 font-mono text-xs">0x8a2f…9c1b</p>
        </div>
        <div className="rounded-2xl border border-border bg-background/40 p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Amount</p>
          <p className="mt-2 font-mono text-lg flex items-center justify-between">
            <span>
              <span className="text-primary">enc(</span>25.00<span className="text-primary">)</span>
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-1 font-mono text-xs text-primary flex items-center gap-1.5">
              {activePair && (
                <img 
                  src={activePair.logo} 
                  alt={confidentialSymbol} 
                  className="h-3.5 w-3.5 rounded-full object-contain brightness-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/tokens/default.png";
                  }}
                />
              )}
              {confidentialSymbol}
            </span>
          </p>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-border bg-background/40 px-4 py-3 text-[11px] text-muted-foreground">
          <span>ZK Proof</span>
          <span className="flex items-center gap-1.5 text-primary">
            <Zap className="h-3 w-3" /> verified
          </span>
        </div>
        <button 
          disabled={isLoading}
          className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {isLoading ? "Syncing..." : "Transfer confidentially"}
        </button>
      </div>
    </BrowserFrame>
  );
}

/** Minimal syntax highlighter tuned for TypeScript-ish snippets. */
function CodeBlock({ code }: { code: string }) {
  const tokens = code.split(/(\/\/[^\n]*|"[^"]*"|`[^`]*`|\b(?:const|await|import|from|for|of|let|new)\b|\b\d+n?\b)/g);
  return (
    <code className="text-foreground/90">
      {tokens.map((t, i) => {
        if (!t) return null;
        if (/^\/\//.test(t)) return <span key={i} className="text-muted-foreground italic">{t}</span>;
        if (/^["`]/.test(t)) return <span key={i} className="text-primary">{t}</span>;
        if (/^(const|await|import|from|for|of|let|new)$/.test(t))
          return <span key={i} className="text-purple">{t}</span>;
        if (/^\d/.test(t)) return <span key={i} className="text-secondary">{t}</span>;
        return <span key={i}>{t}</span>;
      })}
    </code>
  );
}

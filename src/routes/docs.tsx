import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Search, Shield, Send, Eye, ArrowRight } from "lucide-react";
import { AppShell } from "../components/app/AppShell";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — Confidential Registry" },
      { name: "description", content: "How the registry, shielding, transfers and decryption work." },
    ],
  }),
  component: DocsPage,
});

const SECTIONS = [
  {
    id: "registry",
    icon: Search,
    title: "Registry",
    body: "The registry is an on-chain contract that indexes ERC20 ↔ ERC7984 pairs. Reads happen through `sdk.registry.listPairs()` and are cached per block.",
    code: `const pairs = await sdk.registry.listPairs();
// -> [{ underlying, wrapper, chain, tvl }, ...]`,
  },
  {
    id: "shield",
    icon: Shield,
    title: "Shield",
    body: "Shielding converts a public ERC20 balance into an encrypted ERC7984 balance. Approve → shield → mint(euint256) — all in one call.",
    code: `await sdk.shield({
  wrapper: pair.wrapper,
  amount: parseUnits("100", 6),
});`,
  },
  {
    id: "transfer",
    icon: Send,
    title: "Transfer",
    body: "Encrypted transfers accept an encrypted amount plus a ZK proof. The wrapper contract verifies the proof and updates ciphertext balances homomorphically.",
    code: `const enc = await sdk.encrypt(amount, { contract, user });
await wrapper.transfer(to, enc.handle, enc.proof);`,
  },
  {
    id: "decrypt",
    icon: Eye,
    title: "Decrypt",
    body: "Decryption is opt-in and requires an EIP-712 signature. Only the ciphertext's owner can request the plaintext.",
    code: `const value = await sdk.decrypt(ciphertext, {
  contract, signer,
});`,
  },
];

function DocsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Documentation</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            How Confidential Registry works.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A short read-through of the four core primitives — registry, shield, transfer, decrypt — and how they compose into a full confidential asset flow.
          </p>
        </motion.div>

        {/* Architecture diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass mt-12 rounded-3xl p-8"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Architecture
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <ArchCard title="Client SDK" body="TypeScript + wagmi/viem. Encrypts inputs, signs decrypt requests." />
            <ArchCard title="Registry Contract" body="Source of truth for every wrapper pair. Enumerable + event-indexed." accent />
            <ArchCard title="ERC7984 Wrapper" body="Confidential balances via FHEVM. Transfers verified with ZK proofs." />
          </div>
          <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono">wallet</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono">sdk</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono">registry</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono">wrapper</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-primary">FHEVM</span>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="mt-16 grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Contents
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-muted-foreground transition hover:text-primary"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div className="space-y-14">
            {SECTIONS.map((s, i) => (
              <motion.section
                key={s.id}
                id={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 via-secondary/20 to-purple/30">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">{s.title}</h2>
                </div>
                <p className="max-w-3xl leading-relaxed text-muted-foreground">{s.body}</p>
                <pre className="glass mt-5 overflow-x-auto rounded-2xl p-5 font-mono text-[12.5px] leading-relaxed">
                  <code>{s.code}</code>
                </pre>
              </motion.section>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ArchCard({ title, body, accent }: { title: string; body: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-primary/30 bg-primary/[0.04]"
          : "border-border bg-background/40"
      }`}
    >
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}

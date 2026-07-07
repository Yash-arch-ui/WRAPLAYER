import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Droplets, ChevronDown, ExternalLink, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell } from "../components/app/AppShell";
import { useZamaSDK } from "@zama-fhe/react-sdk";
import { getRegistryPairs } from "../lib/registry";
import { useFaucet } from "../hooks/useFaucet";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { parseAbi, formatUnits } from "viem";
import { toast } from "sonner";

export const Route = createFileRoute("/faucet")({
  head: () => ({
    meta: [
      { title: "Faucet — WrapLayer" },
      { name: "description", content: "Mint mock ERC20 tokens for testing." },
    ],
  }),
  component: FaucetPage,
});

type Mint = {
  id: string;
  symbol: string;
  amount: string;
  hash: string;
  at: string;
};

function isMockToken(name: string, symbol: string): boolean {
  return (
    name.toLowerCase().includes("mock") ||
    symbol.toLowerCase().includes("mock")
  );
}

function FaucetPage() {
  const { mint, loading } = useFaucet();
  const sdk = useZamaSDK();
  const publicClient = usePublicClient();

  const [token, setToken] = useState("");
  const [allPairs, setAllPairs] = useState<any[]>([]);
  const [faucetPairs, setFaucetPairs] = useState<any[]>([]);
  const [nonMintablePairs, setNonMintablePairs] = useState<any[]>([]);
  const [history, setHistory] = useState<Mint[]>([]);

  const { address } = useAccount();

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: token as `0x${string}`,
    abi: parseAbi(["function balanceOf(address owner) view returns (uint256)"]),
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!token && !!address },
  });

  const { data: decimals } = useReadContract({
    address: token as `0x${string}`,
    abi: parseAbi(["function decimals() view returns (uint8)"]),
    functionName: "decimals",
    query: { enabled: !!token },
  });

  const selectedPair = faucetPairs.find((p) => p.tokenAddress === token);

  useEffect(() => {
    async function loadPairs() {
      if (!sdk) return;

      const livePairs = await getRegistryPairs(sdk);
      setAllPairs(livePairs);
      const mintable: any[] = [];
      const nonMintable: any[] = [];

      for (const pair of livePairs) {
        if (isMockToken(pair.name ?? "", pair.symbol ?? "")) {
          mintable.push(pair);
        } else {
          nonMintable.push(pair);
        }
      }

      setFaucetPairs(mintable);
      setNonMintablePairs(nonMintable);

      if (mintable.length > 0) {
        setToken(mintable[0].tokenAddress);
      }
    }
    loadPairs();
  }, [sdk]);

  const handleMint = async () => {
    if (!address) {
      toast.error("Connect your wallet first.");
      return;
    }
    if (!token) {
      toast.error("Select a token first.");
      return;
    }

    if (publicClient) {
      try {
        await publicClient.simulateContract({
          address: token as `0x${string}`,
          abi: parseAbi(["function mint(address to, uint256 amount)"]),
          functionName: "mint",
          args: [address, BigInt(1000) * BigInt(10 ** (decimals ?? 6))],
          account: address,
        });
      } catch (simErr: any) {
        const msg =
          simErr?.shortMessage?.includes("execution reverted")
            ? `${selectedPair?.symbol ?? "This token"} does not support public minting. It may require owner access.`
            : simErr?.shortMessage ?? "Transaction would fail. Check your wallet and try again.";
        toast.error(msg);
        return;
      }
    }

    const toastId = toast.loading(
      `Minting 1,000 ${selectedPair?.symbol ?? "tokens"}…`
    );

    try {
      await mint(token, () => {
        refetchBalance();
        setHistory((h) => [
          {
            id: crypto.randomUUID(),
            symbol: selectedPair?.symbol ?? "TOKEN",
            amount: "1,000",
            hash: "0x…",
            at: new Date().toLocaleTimeString(),
          },
          ...h.slice(0, 9), // keep last 10
        ]);
      });

      toast.success(
        `Minted 1,000 ${selectedPair?.symbol ?? "tokens"} successfully!`,
        { id: toastId }
      );
    } catch (err: any) {
      console.error("Faucet error:", err);
      const errMsg =
        err?.shortMessage?.includes("execution reverted")
          ? "Mint reverted — this token may not have a public faucet."
          : err?.shortMessage ?? err?.message ?? "Claim failed.";
      toast.error(errMsg, { id: toastId });
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
            Faucet
          </p>
          <h1 className="mt-3 text-center text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Mint mock tokens.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
            Get test ERC20 tokens for wrapping into their confidential ERC7984
            counterparts.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass ring-glow mx-auto mt-12 max-w-lg rounded-3xl p-6"
        >
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Select Token
          </label>

          {faucetPairs.length === 0 ? (
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Loading faucet tokens…
            </div>
          ) : (
            <div className="relative mt-2">
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-border bg-[#0B1220] px-4 py-3 pr-10 text-base font-medium text-white outline-none transition hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                {faucetPairs.map((p) => (
                  <option
                    key={p.tokenAddress}
                    value={p.tokenAddress}
                    className="bg-[#0B1220] text-white"
                  >
                    {p.symbol} — {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          )}

          <div className="mt-4 flex justify-between px-2 font-mono text-xs text-muted-foreground">
            <span>Wallet Balance:</span>
            <span>
              {balance !== undefined && decimals !== undefined
                ? `${Number(formatUnits(balance, decimals)).toFixed(2)} ${selectedPair?.symbol ?? "TOKEN"}`
                : address
                ? "Loading…"
                : "—"}
            </span>
          </div>

          <button
            onClick={handleMint}
            disabled={loading || faucetPairs.length === 0}
            className="group relative mt-8 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground glow-teal transition hover:opacity-95 disabled:opacity-60"
          >
            <Droplets className="h-4 w-4" />
            {loading ? "Minting…" : `Claim 1,000 ${selectedPair?.symbol ?? "Mock Tokens"}`}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
        </motion.div>
        {nonMintablePairs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-6 max-w-lg rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-yellow-300">
                  Some registry tokens don't have a faucet
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Third-party tokens like{" "}
                  <span className="font-mono text-yellow-400">
                    {nonMintablePairs.map((p) => p.symbol).join(", ")}
                  </span>{" "}
                  are registered in the Wrappers Registry but don't expose a
                  public <span className="font-mono">mint()</span> function.
                  These are real protocol tokens — not test tokens — and can
                  only be obtained through their own interfaces. They are still
                  fully supported for wrap, unwrap, and decrypt in WrapLayer.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        <div className="mx-auto mt-14 max-w-lg">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Recent Mints
          </h2>

          {history.length === 0 ? (
            <p className="mt-4 text-center text-sm text-muted-foreground/50">
              No mints yet.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {history.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass flex items-center justify-between rounded-2xl px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-purple/20 font-mono text-[10px] uppercase">
                      {m.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {m.amount} {m.symbol}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {m.hash}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.at}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

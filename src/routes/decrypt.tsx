import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Eye, Lock, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/app/AppShell";
import { useZamaSDK } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { toast } from "sonner";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(import.meta.env.VITE_ALCHEMY_SEPOLIA_URL),
});

const erc20MetadataAbi = [
  { name: "name", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "symbol", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
] as const;

export function useDecrypt() {
  const sdk = useZamaSDK();
  const { address } = useAccount();
  const [isDecrypting, setIsDecrypting] = useState(false);

  const fetchPrivateBalance = async (confidentialTokenAddress: `0x${string}`) => {
    if (!sdk || !confidentialTokenAddress || !address) return null;
    setIsDecrypting(true);
    try {
      const token = sdk.createWrappedToken(confidentialTokenAddress); 
      const balance = await token.balanceOf(address); 
      return balance;
      toast.success("SUCCESS FETCHING BALANCE ");
    } catch (error) {
      console.error("Decryption pipeline failure:", error);
      toast.error("DECRYPTION PIPLEINE FAILURE");
      return null;
    } finally {
      setIsDecrypting(false);
    }
  };

  return { fetchPrivateBalance, isDecrypting };
}

export const Route = createFileRoute("/decrypt")({
  head: () => ({
    meta: [
      { title: "Decrypt — Confidential Registry" },
      { name: "description", content: "Decrypt confidential values you own with a signed request." },
    ],
  }),
  component: DecryptPage,
});

type Item = { id: string; input: string; output: string; at: string };

function DecryptPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [history, setHistory] = useState<Item[]>([]);

  const { fetchPrivateBalance, isDecrypting } = useDecrypt();

  const run = async () => {
    const targetAddress = input.trim() as `0x${string}`;
    
    if (!targetAddress || !/^0x[a-fA-F0-9]{40}$/.test(targetAddress)) {
      setOutput("Error: Invalid Ethereum contract address length or character composition.");
      return;
    }
    setOutput(null);

    try {
      const [name, symbol, decimals] = await Promise.all([
        publicClient.readContract({ address: targetAddress, abi: erc20MetadataAbi, functionName: "name" }).catch(() => "Unknown External Wrapper"),
        publicClient.readContract({ address: targetAddress, abi: erc20MetadataAbi, functionName: "symbol" }).catch(() => "UNKNWN"),
        publicClient.readContract({ address: targetAddress, abi: erc20MetadataAbi, functionName: "decimals" }).catch(() => 18),
      ]);
      const balance = await fetchPrivateBalance(targetAddress);
      
      if (balance !== null) {
        const formattedBalance = (Number(balance) / Math.pow(10, decimals)).toFixed(decimals > 6 ? 6 : decimals);
        const result = `${formattedBalance} ${symbol} (${name})`;
        
        setOutput(result);
        setHistory((h) => [
          {
            id: crypto.randomUUID(),
            input: targetAddress.slice(0, 6) + "…" + targetAddress.slice(-4),
            output: result,
            at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          ...h,
        ]);
      } else {
        setOutput("Failed to decrypt balance. Verify that you hold assets in this contract or checking permissions.");
      }
    } catch (err) {
      console.error("Critical failure during external decryption routine:", err);
      toast.error("ERROR target contract execution failed");
      setOutput("Error: Target contract execution failed. Verify network status.");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Decrypt</p>
          <h1 className="mt-3 text-center text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Reveal encrypted balances.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
            Provide any confidential wrapper address to query live contract data and request an EIP-712 signature.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass ring-glow mx-auto mt-12 rounded-3xl p-6"
        >
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Confidential Token Address (Wrapper ERC7984)
          </label>
          <div className="mt-2 rounded-2xl border border-border bg-background/40 p-4 font-mono text-xs">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder="0x... (Paste any arbitrary ERC-7984 contract address here)"
              className="w-full resize-none bg-transparent outline-none placeholder:text-muted-foreground/70 text-foreground"
            />
          </div>

          <button
            onClick={run}
            disabled={isDecrypting || !input.trim()}
            className="group relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground glow-teal transition hover:opacity-95 disabled:opacity-50"
          >
            {isDecrypting ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Eye className="h-4 w-4" />}
            {isDecrypting ? "Signing & Decrypting Pipeline..." : "Fetch & Decrypt Balance"}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>

          {output && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-2xl border border-primary/30 bg-primary/[0.05] p-4"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">Live Decrypted Balance</p>
              <p className="mt-2 font-mono text-2xl text-primary">{output}</p>
            </motion.div>
          )}
        </motion.div>

        <div className="mt-14">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Decryption History
          </h2>
          <div className="mt-3 space-y-2">
            {history.length === 0 ? (
              <p className="text-center text-xs font-mono text-muted-foreground/60 py-4">No decryption requests made yet.</p>
            ) : (
              history.map((h) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass flex items-center justify-between rounded-2xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">Contract: {h.input}</p>
                      <p className="font-mono text-sm text-primary">{h.output}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{h.at}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Search, Copy, Check, Shield, Send, Eye, SlidersHorizontal } from "lucide-react";
import { useMemo, useState, useEffect} from "react";
import { AppShell } from "../components/app/AppShell";
import { getRegistryPairs, type RegistryTokenPair } from "../lib/registry";
import { useWrapper } from "@/hooks/useWrapper";
import { useZamaSDK } from "@zama-fhe/react-sdk";
import { getAllowanceQuery } from "../lib/allowance"; 
import { useWriteContract, useAccount } from "wagmi";
import { erc20Abi } from "../lib/erc20"; 
import { useQuery } from "@tanstack/react-query"; 
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import {toast} from "sonner";
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(import.meta.env.VITE_ALCHEMY_SEPOLIA_URL ),
});
function shortAddress(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
export const Route = createFileRoute("/registry")({
  head: () => ({
    meta: [
      { title: "Registry — Confidential Registry" },
      { name: "description", content: "Explore ERC20 ↔ ERC7984 wrapper pairs on-chain." },
    ],
  }),
  component: RegistryPage,
});

function RegistryPage() {
  const  sdk  = useZamaSDK();
  const [registryPairs, setRegistryPairs] = useState<RegistryTokenPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState("");
const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
const [sort, setSort] = useState<"symbol" | "address">("symbol");


  useEffect(() => {
    async function loadOnChainPairs() {
      if (!sdk) return;
      try {
        setIsLoading(true);
        const pairs = await getRegistryPairs(sdk);
        setRegistryPairs(pairs);
      } catch (error) {
        console.error("Error pulling live tokens on registry view:", error);
        toast.error("Error pulling live tokens on registry view:");
      } finally {
        setIsLoading(false);
      }
    }
    loadOnChainPairs();
  }, [sdk]);

 const list = useMemo(() => {
    let arr = [...registryPairs];
    
    if (q) {
      const s = q.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.symbol.toLowerCase().includes(s) ||
          p.name.toLowerCase().includes(s) ||
          p.tokenAddress.toLowerCase().includes(s) ||
          p.confidentialTokenAddress.toLowerCase().includes(s)
      );
    }

    if (statusFilter === "active") arr = arr.filter((p) => p.isValid);
    if (statusFilter === "disabled") arr = arr.filter((p) => !p.isValid);

    if (sort === "symbol") {
      arr.sort((a, b) => a.symbol.localeCompare(b.symbol));
    } else {
      arr.sort((a, b) => a.tokenAddress.localeCompare(b.tokenAddress));
    }
    
    return arr;
  }, [registryPairs, q, statusFilter, sort]);


  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Registry</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            Discover wrapper pairs.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Every pair below was read directly from the on-chain registry contract.
          </p>
        </motion.div>

        {/* Toolbar */}
        <div className="glass mt-10 flex flex-wrap items-center gap-3 rounded-full p-2">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-background/40 px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by symbol or address…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-full border border-border bg-background/40 px-3 py-2 text-sm outline-none appearance-none cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="active">Active pairs</option>
            <option value="disabled">Disabled pairs</option>
          </select>
          <button
            onClick={() => setSort((s) => (s === "symbol" ? "address" : "symbol"))}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-3 py-2 text-sm"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Sort: {sort === "symbol" ? "Symbol" : "Address"}
          </button>
        </div>

        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          {isLoading ? "Fetching data..." : `${list.length} pair${list.length === 1 ? "" : "s"} · fetched from chain`}
        </p>

        {isLoading ? (
          <div className="mt-12 text-center text-sm font-mono text-muted-foreground animate-pulse">
            Syncing on-chain wrapper nodes...
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.map((pair, i) => (
              <WrapperCard key={pair.tokenAddress} p={pair} i={i} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function WrapperCard({ p, i }: { p: RegistryTokenPair; i: number }) {
   const { address: userAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
    const [copied, setCopied] = useState<string | null>(null);
  const [isShielding, setIsShielding] = useState(false);
  const [isUnshielding, setIsUnshielding] = useState(false);
  const [amount, setAmount] = useState(""); 
  const { shield, unshield } = useWrapper(p.confidentialTokenAddress as `0x${string}`);
   
    
  const copy = (v: string, k: string) => {
    navigator.clipboard.writeText(v);
    setCopied(k);
    setTimeout(() => setCopied(null), 1200);
  };
   
  const getAmountBigInt = () => {
  const FHE_DECIMALS = 6; 
  const [integer, fraction = ""] = amount.split(".");
  const fractionPart = fraction.padEnd(FHE_DECIMALS, "0").slice(0, FHE_DECIMALS);
  return BigInt(integer + fractionPart);
  };

  const { data: allowance = 0n, refetch } = useQuery({
    queryKey: ['allowance', p.tokenAddress, userAddress, p.confidentialTokenAddress],
    queryFn: () => getAllowanceQuery(
      p.tokenAddress as `0x${string}`, 
      userAddress as `0x${string}`, 
      p.confidentialTokenAddress as `0x${string}`
    ),
    enabled: !!userAddress,
  });
  const { data: tokenBalance = "0.0000" } = useQuery({
    queryKey: ['tokenBalance', p.tokenAddress, userAddress],
    queryFn: async () => {
      if (!userAddress) return "0.0000";
      try {
        const [rawBalance, decimals] = await Promise.all([
          publicClient.readContract({
            address: p.tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [userAddress as `0x${string}`],
          }),
          publicClient.readContract({
            address: p.tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "decimals",
          }).catch(() => 18),
        ]);
        return (Number(rawBalance) / Math.pow(10, Number(decimals))).toFixed(4);
      } catch (err) {
        return "0.0000";
      }
    },
    enabled: !!userAddress,
  });

  const needsApproval = allowance < getAmountBigInt();

  const handleApprove = async () => {
try {
    const txHash = await writeContractAsync({
      address: p.tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [p.confidentialTokenAddress as `0x${string}`, getAmountBigInt()],
    });
    
    toast.success("Transaction submitted...");

    setTimeout(async () => {
      await refetch(); 
      toast.info("Allowance updated.");
    }, 1000); 

  } catch (err: any) {
    console.error("Approval failed:", err);
    const errMsg = err?.shortMessage || err?.message || "Approval signature rejected.";
    toast.error(errMsg);
  }
  };



 

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: i * 0.03 }}
      whileHover={{ y: -4 }}
      className="glass group relative overflow-hidden rounded-3xl p-5"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <img 
            src={p.logo} 
            alt={p.symbol} 
            className="h-9 w-9 rounded-full object-contain bg-background/50 border border-border/50 mt-1"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/tokens/default.png";
            }}
          />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {p.isLocalDevAsset ? "Local Configuration" : "Zama Network"}
            </p>
            <p className="mt-1 text-lg font-medium">
              {p.symbol} → <span className="text-primary">c{p.symbol}</span>
            </p>
            <p className="text-xs text-muted-foreground max-w-[150px] truncate">{p.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Status</p>
          <div className="mt-1 flex items-center justify-end gap-1.5 text-xs font-medium">
            <span className={`h-1.5 w-1.5 rounded-full ${p.isValid ? 'bg-primary' : 'bg-destructive'}`} />
            {p.isValid ? "Active" : "Disabled"}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <AddrRow
          label="Underlying (ERC20)"
          addr={p.tokenAddress}
          onCopy={() => copy(p.tokenAddress, `${p.tokenAddress}u`)}
          copied={copied === `${p.tokenAddress}u`}
        />
        <AddrRow
          label="Wrapper (ERC7984)"
          addr={p.confidentialTokenAddress}
          onCopy={() => copy(p.confidentialTokenAddress, `${p.tokenAddress}w`)}
          copied={copied === `${p.tokenAddress}w`}
          accent
        />
      </div>
      <div className="mt-4 flex items-center justify-between px-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          Available Balance
        </span>
        <span className="font-mono text-xs font-semibold text-emerald-400">
          {tokenBalance} <span className="text-[10px] text-muted-foreground font-normal">{p.symbol}</span>
        </span>
      </div>
<div className="mt-5">
        <input
          type="number"
          placeholder={`Amount to ${p.symbol}...`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm font-mono outline-none focus:border-primary placeholder:text-muted-foreground/50"
        />
      </div>


<div className="mt-3 grid grid-cols-2 gap-2">
{needsApproval ? (
    <ActionBtn
      icon={Shield}
      label="Approve Allowance"
      primary
      onClick={handleApprove}
    />
  ) : (
    <ActionBtn
      icon={Shield}
      label={isShielding ? "Shielding..." : "Shield"}
      primary
      onClick={async () => {
        setIsShielding(true);
        try {
          await shield(getAmountBigInt());
          toast.success("Assets successfully shielded!");
          await refetch();
        } catch (err) {
          console.error("Shield failed:", err);
          toast.error("SHIELDING FAILED");
        } finally {
          setIsShielding(false);
        }
      }}
    />
  )}
<ActionBtn 
          icon={Eye} 
          label={isUnshielding ? "Unshielding..." : "Unshield"} 
          onClick={async () => {
            setIsUnshielding(true);
            try {
              await unshield(getAmountBigInt());
              toast.success("Assets successfully unshielded!");
            } catch (err) {
              console.error("Unshield failed:", err);
              toast.error("FAILEDCHECK CONSOLE");
            } finally {
              setIsUnshielding(false);
            }
          }}
        />
</div>
    </motion.div>
  );
}

function AddrRow({
  label,
  addr,
  onCopy,
  copied,
  accent,
}: {
  label: string;
  addr: string;
  onCopy: () => void;
  copied: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-3 py-2 ${
        accent ? "border-primary/30 bg-primary/[0.04]" : "border-border/70 bg-background/40"
      }`}
    >
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 font-mono text-[11px]">{shortAddress(addr)}</p>
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

function ActionBtn({
  icon: Icon,
  label,
  primary,
  onClick,
}: {
  icon: typeof Shield;
  label: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick} // 3. Attach it to the HTML button element
      className={`inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition ${
        primary
          ? "bg-primary text-primary-foreground hover:opacity-95"
          : "border border-border bg-background/40 text-foreground hover:border-primary/40"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
    );
}

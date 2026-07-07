"use client";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function WalletButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const { address, isConnected, status } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (!mounted) {
    return (
      <div className="flex gap-2">
        <button
          disabled
          className="bg-blue-600 opacity-50 text-white text-xs px-4 py-1.5 rounded font-medium"
        >
          Connect Wallet
        </button>
      </div>
    );
  }
    if(status === "reconnecting" || status === "connecting"){
    return (
      <div className="flex gap-2">
        <button
          disabled
          className="bg-blue-600 opacity-70 text-white text-xs px-4 py-1.5 rounded font-medium animate-pulse"
        >
          Connecting...
        </button>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded text-xs font-mono border border-slate-700">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>

        <button
          onClick={() => disconnect()}
          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded font-medium transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          disabled={isPending}
          onClick={() => connect({ connector })}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-4 py-1.5 rounded font-medium transition"
        >
          {isPending ? "Connecting..." : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  );
}
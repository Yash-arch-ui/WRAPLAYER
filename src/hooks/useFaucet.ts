import { useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { parseAbi } from "viem";
import { toast } from "sonner";

export function useFaucet() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [loading, setLoading] = useState(false);

  async function mint(selectedToken: string, onSuccess?: () => Promise<void> | void) {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet.");
      return;
    }

    if (!selectedToken) {
      toast.error("Please select a token to claim.");
      return;
    }

    if (!publicClient) {
      toast.error("Public client is not available.");
      return;
    }

    try {
      setLoading(true);

      const loadingToast = toast.loading("Minting tokens...");

      const decimals = await publicClient.readContract({
        address: selectedToken as `0x${string}`,
        abi: parseAbi([
          "function decimals() view returns (uint8)",
        ]),
        functionName: "decimals",
      });

      const mintAmount = 1000n * 10n ** BigInt(decimals);

      const txHash = await writeContractAsync({
        address: selectedToken as `0x${string}`,
        abi: parseAbi([
          "function mint(address to,uint256 amount)",
        ]),
        functionName: "mint",
        args: [address, mintAmount],
      });

      await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      // Refresh balances
      await onSuccess?.();

      toast.success("1000 tokens minted successfully!", {
        id: loadingToast,
      });
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.shortMessage ||
          error?.message ||
          "Mint failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    mint,
    loading,
  };
}
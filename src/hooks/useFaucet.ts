import { useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { parseAbi } from "viem";
import { toast } from "sonner"; 

export function useFaucet() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
    const [loading, setLoading] = useState(false);
  async function mint(selectedToken: string, onSuccess?: () => void) {
    if (!isConnected || !address) return toast.error("Please connect your wallet.");
    if (!selectedToken) return toast.error("Please select a token to claim.");
    if (!publicClient) return toast.error("Public client is not available.");

    try {
      setLoading(true);

      const decimals = await publicClient.readContract({
        address: selectedToken as `0x${string}`,
        abi: parseAbi(["function decimals() view returns (uint8)"]),
        functionName: "decimals",
      });

      const publicMockAbi = parseAbi(["function mint(address to , uint256 amount) external"]);
      const mintAmount = 1000n * 10n ** BigInt(decimals); 

      const tx = await writeContractAsync({
        address: selectedToken as `0x${string}`,
        abi: publicMockAbi,
        functionName: "mint", 
        args: [address, mintAmount],
      });

      toast.success("Tokens minted!");
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error("Faucet error:", error);
      toast.error(error?.shortMessage || error?.message || "Check wallet console.");
    } finally {
      setLoading(false);
    }
  }
  return {
    mint,
    loading
  };
}
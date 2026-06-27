// src/lib/token.ts
import { createPublicClient, http, formatUnits } from "viem";
import { sepolia } from "viem/chains"; // Switch to mainnet if needed
import { erc20Abi } from "./erc20";

// Standard client lookup using your backend Alchemy pipeline setup
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_URL),
});

export async function getTokenInfo(tokenAddress: `0x${string}`, userAddress?: `0x${string}`) {
  try {
    // Run contract queries concurrently via Promise.all
    const [name, decimals, rawBalance] = await Promise.all([
      publicClient.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "name" }),
      publicClient.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "decimals" }),
      userAddress 
        ? publicClient.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "balanceOf", args: [userAddress] })
        : Promise.resolve(BigInt(0))
    ]);

    return {
      name,
      decimals,
      balance: formatUnits(rawBalance, decimals) // Converts BigInt to human-readable string
    };
  } catch (error) {
    console.error(`Error reading metadata for contract ${tokenAddress}:`, error);
    return {
      name: "Unknown Token",
      decimals: 18,
      balance: "0.00"
    };
  }
}
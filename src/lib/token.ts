import { createPublicClient, http, formatUnits } from "viem";
import { sepolia } from "viem/chains";
import { erc20Abi } from "./erc20";

const rpcUrl =import.meta.env.VITE_ALCHEMY_SEPOLIA_URL ;


const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});

export async function getTokenInfo(
  tokenAddress: `0x${string}`,
  userAddress?: `0x${string}`,
  spenderAddress?: `0x${string}`
) {
  try {
    const [name, decimals, rawBalance] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "name",
      }),
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "decimals",
      }),
      userAddress
        ? publicClient.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [userAddress],
          })
        : Promise.resolve(0n),
    ]);

    const allowance =
      userAddress && spenderAddress
        ? await publicClient.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "allowance",
            args: [userAddress, spenderAddress],
          })
        : 0n;

    console.log(
      "Allowance:",
      tokenAddress,
      userAddress,
      spenderAddress,
      allowance.toString()
    );

    return {
      name,
      decimals,
      balance: formatUnits(rawBalance, decimals),
      allowance,
    };
  } catch (error) {
    console.error(
      `Metadata recovery breakdown for ${tokenAddress}:`,
      error
    );

    return {
      name: "Unknown Token",
      decimals: 18,
      balance: "0",
      allowance: 0n,
    };
  }
}

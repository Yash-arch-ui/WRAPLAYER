import { createPublicClient, http } from "viem";
import { sepolia , mainnet} from "viem/chains";
import { erc20Abi } from "./erc20";

const rpcUrl = import.meta.env.VITE_ALCHEMY_SEPOLIA_URL;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});

export async function getAllowanceQuery(
  tokenAddress: `0x${string}`,
  owner: `0x${string}`,
  spender: `0x${string}`
): Promise<bigint> {
  return await publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner, spender],
  });
}

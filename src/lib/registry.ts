import { createPublicClient,http } from "viem"
import {sepolia} from "viem/chains"
import {type Address } from "viem"
// it creates a public client using the viem library; initializes a blockchain client 
export const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),

})
export const REGISTRY_ADDRESS ="0x2f0750Bbb0A246059d80e94c454586a7F27a128e"
export const registryAbi = [{
type: "function",
    name: "getTokenConfidentialTokenPairs",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "tokenAddress", type: "address" },
          { name: "confidentialTokenAddress", type: "address" },
          { name: "isValid", type: "bool" },
        ],
      },
    ],
  },
] // will tell exactly viem what function are available on that smart contract 

export async function getRegistryPairs() {
  const data = await publicClient.readContract({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    functionName: "getTokenConfidentialTokenPairs",
  }) as any []
  // it calls the gettokenconfidentialTokenPairs on the deployed smart contract 

  return data.filter((p) => p.isValid)
}
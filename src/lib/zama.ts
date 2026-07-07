// src/lib/zama.ts
import { createConfig } from "@zama-fhe/react-sdk/wagmi";
import { web } from "@zama-fhe/sdk/web";
import { config as wagmiConfig } from "./wagmi";
import { sepolia as sepoliaFhe } from "@zama-fhe/sdk/chains";

export const zamaConfig = createConfig({
  chains: [sepoliaFhe],
  wagmiConfig, // Hooks directly into your pure Wagmi architecture
  relayers: {
    [sepoliaFhe.id]: web(), // Spawns browser multi-threaded WASM workers automatically
  },
});
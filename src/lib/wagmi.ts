import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});
// CHAINS- We are woring with sepolia testnet 
// Connectors: We support injected wallets
// Transports: We are talking to the sepolia blockchain using a basic http connection 
// src/lib/erc20.ts
export const erc20Abi = [
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address", name: "account" }], outputs: [{ type: "uint256" }] },
] as const; // 'as const' allows Viem to infer exact return types
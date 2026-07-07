export const registryAbi = [
  {
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
  {
    type: "function",
    name: "getWrapperFor",
    stateMutability: "view",
    inputs: [{ name: "tokenAddress", type: "address" }],
    outputs: [{ name: "confidentialTokenAddress", type: "address" }],
  },
  {
    type: "function",
    name: "isWrapperValid",
    stateMutability: "view",
    inputs: [{ name: "wrapperAddress", type: "address" }],
    outputs: [{ name: "isValid", type: "bool" }],
  }
] as const;
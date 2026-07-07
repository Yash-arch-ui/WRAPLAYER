# WrapLayer

> The canonical interface for the Zama Wrappers Registry — wrap, unwrap, and decrypt confidential ERC-7984 tokens on Sepolia,Mainnet.

**Live Demo:** https://wraplayer.vercel.app/
**Network:** Ethereum Sepolia (chainId: 11155111) || Ethereum Mainnet 
**Standard:** ERC-7984 Confidential Tokens via Zama FHEVM

---

## Table of Contents

1. [What is WrapLayer?](#what-is-wraplayer)
2. [Architecture Overview](#architecture-overview)
3. [Registry: How Pairs Are Sourced](#registry-how-pairs-are-sourced)
4. [Adding a New Token Pair](#adding-a-new-token-pair)
5. [Wrap Flow](#wrap-flow)
6. [Unwrap Flow](#unwrap-flow)
7. [Decrypt Flow (EIP-712)](#decrypt-flow-eip-712)
8. [Faucet](#faucet)
9. [Contract Addresses](#contract-addresses)
10. [Local Development](#local-development)
11. [Deployment](#deployment)

---

## What is WrapLayer?

Every developer building on Zama's FHEVM was deploying their own ERC-20 testnet tokens and ERC-7984 confidential wrappers in isolation. The result: duplicate assets, incompatible integrations, and a wallet full of look-alike tokens that don't compose.

Zama ships an official **Wrappers Registry** onchain — a single source of truth for canonical ERC-20 ↔ ERC-7984 pairs. Nobody had built a usable interface for it.

WrapLayer is that interface.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        WrapLayer                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Marketing  │  │   App Shell  │  │    Route Pages   │  │
│  │   (Landing)  │  │  (Providers) │  │                  │  │
│  │              │  │              │  │  /dashboard       │  │
│  │  HeroNodes   │  │  Wagmi       │  │  /registry        │  │
│  │  MarketingNav│  │  ZamaSDK     │  │  /faucet          │  │
│  │  MarketingFt │  │  QueryClient │  │  /decrypt         │  │
│  └──────────────┘  └──────────────┘  │  /docs            │  │
│                                      └──────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Hooks Layer                        │  │
│  │                                                       │  │
│  │  useRegistry   useWrapper   useDecrypt                │  │
│  │  useFaucet     useAllowance useWrap                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      lib/                             │  │
│  │                                                       │  │
│  │  registry.ts   wrapper.ts   token.ts   zama.ts        │  │
│  │  erc20.ts      allowance.ts wagmi.ts   constants.js   │  │
│  │  abi/          utils.ts                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
   ┌──────────────────┐  ┌─────────┐  ┌────────────┐
   │  Wrappers        │  │  Zama   │  │  Sepolia   │
   │  Registry        │  │  KMS /  │  │  Mainnet   │
   │  (onchain)       │  │  Relayer│  │   RPC      │
   └──────────────────┘  └─────────┘  └────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vite + React + TypeScript |
| Routing | TanStack Router (file-based) |
| Onchain reads/writes | Wagmi v2 + Viem |
| FHE operations | `@zama-fhe/sdk` + `@zama-fhe/react-sdk` |
| Wallet connection | Wagmi injected connector (MetaMask) |
| Styling | Tailwind CSS + shadcn/ui |
| State management | TanStack Query |

---

## Registry: How Pairs Are Sourced

WrapLayer uses a **hybrid registry model**: the onchain Wrappers Registry is the primary source of truth, with an optional local config layer for development or custom pairs.

### Source Priority

```
┌─────────────────────────────────────────┐
│           Token Pair Resolution         │
│                                         │
│  1. Onchain Registry (primary)          │
│     └─ reads getTokenConfidentialToken- │
│          Pairs() via multicall          │
│     └─ filters isValid === true         │
│     └─ enriches with name/symbol/       │
│          decimals from ERC-20 contract  │
│                                         │
│  2. LOCAL_CONFIG_PAIRS (secondary)      │
│     └─ defined in src/lib/token.ts      │
│     └─ merged at runtime                │
│     └─ tagged isLocalDevAsset: true     │
│     └─ shown with "Custom" badge in UI  │
│                                         │
│  Final list = onchain pairs             │
│             + local config pairs        │
│             (deduplicated by address)   │
└─────────────────────────────────────────┘
```

### Onchain Registry Call

```typescript
// src/lib/registry.ts
const pairs = await publicClient.readContract({
  address: REGISTRY_ADDRESS,         // Sepolia registry(or mainnet too)
  abi: registryAbi,
  functionName: 'getTokenConfidentialTokenPairs',
})
// Returns: { tokenAddress, confidentialTokenAddress, isValid }[]
// Always filter: pairs.filter(p => p.isValid)
```

---

## Adding a New Token Pair

To add a custom ERC-20 ↔ ERC-7984 pair (development, testing, or unofficial wrappers), edit `src/lib/registry.ts`:

```typescript
// src/lib/token.ts

const LOCAL_CONFIG_PAIRS: RegistryTokenPair[] = [
  /* Uncomment and fill in to add a custom pair:

  {
    tokenAddress: "0xYourERC20TokenAddressHere",
      // The standard ERC-20 asset

    confidentialTokenAddress: "0xYourERC7984TokenAddressHere",
      // The wrapped confidential asset

    name: "My Custom Token",
      // Human-readable name shown in the UI

    symbol: "mCTK",
      // Token symbol (e.g. "USDC", "WETH")

    decimals: 18,
      // Decimal precision of the ERC-20 (NOT the wrapper — wrapper is always ≤6)

    logo: "/tokens/default.svg",
      // Optional: drop a file into /public/tokens/ and reference it here

    isLocalDevAsset: true,
      // REQUIRED: marks this as a local pair — shows "Custom" badge in registry UI

    isValid: true,
      // REQUIRED: set false to hide the pair without deleting it
  }

  */
];
```

### What happens after you add the pair

```
Edit LOCAL_CONFIG_PAIRS in token.ts
            │
            ▼
    useRegistry hook merges
    onchain pairs + local pairs
            │
            ▼
    Registry page renders
    pair with "Custom" badge
            │
            ▼
    Wrap / Unwrap / Decrypt
    all work identically to
    onchain registry pairs
```

### Rules for adding a pair

- `tokenAddress` must be a valid ERC-20 that implements `approve()` and `balanceOf()`
- `confidentialTokenAddress` must be a valid ERC-7984 wrapper deployed against Zama FHEVM
- `decimals` should match the ERC-20's actual decimals — the wrapper always normalizes to ≤6 internally
- Set `isLocalDevAsset: true` — this is how the UI distinguishes your pair from official onchain pairs
- The pair is visible **only in your local build** — it is not written onchain

---

## Wrap Flow

Wrapping converts a public ERC-20 into its confidential ERC-7984 equivalent. Your balance becomes encrypted onchain.

### Flow Diagram

```
User enters amount
        │
        ▼
Check ERC-20 balance
  ┌─────┴─────┐
  │ Sufficient│         Insufficient
  │           │──────────────────────► Show error: "Insufficient balance" : (MINT VIA FAUCET)
  ▼           │
Check allowance
  ┌─────┴─────┐
  │Allowance  │         No allowance
  │sufficient │─────────────────────┐
  │           │                     │
  ▼           │                     ▼
 wrap()       │             approve(wrapperAddr, amount)
  │           │                     │
  │           │◄────────────────────┘
  ▼           │
Wait for tx confirmation
  (Wrap event emitted)
        │
        ▼
Update ERC-20 balance (decreases)
Update encrypted cToken balance
        │
        ▼
        ✓ Done
```

### Code path

```
WrapPanel (registry.tsx)
  └─ useAllowance hook
       └─ reads allowance via readContract
  └─ useWrap hook
       └─ Step 1: writeContract → ERC-20.approve(wrapperAddr, amount)
       └─ useWaitForTransactionReceipt → wait for confirmation
       └─ Step 2: writeContract → ConfidentialWrapper.wrap(userAddr, amount)
       └─ useWaitForTransactionReceipt → wait for confirmation
```

### Key contract calls

```typescript
// Step 1 — Approve (standard ERC-20)
erc20.approve(wrapperAddress, amountInERC20Decimals)

// Step 2 — Wrap
// amount is in ERC-20 precision (e.g. 1_000_000 for 1 USDC with 6 decimals)
// Excess tokens are automatically refunded if amount is not divisible by rate
confidentialWrapper.wrap(recipientAddress, amount)
```

> **Note on decimals:** The wrapper has a `rate()` that converts between ERC-20 decimals (e.g. 18) and wrapper decimals (max 6). For 18-decimal tokens, `rate = 10^12`. WrapLayer handles this conversion automatically — you always enter amounts in the ERC-20's native units.

---

## Unwrap Flow

Unwrapping is a **two-step async process**. This is the hardest part of FHEVM integration — the KMS must publicly decrypt the amount before the ERC-20 can be released.

### Flow Diagram

```
User enters amount to unwrap
        │
        ▼
Step 1: unwrap() call
  ConfidentialWrapper.unwrap(from, to, encryptedAmount)
        │
        ▼
  UnwrapRequested event emitted
  { receiver, unwrapRequestId, encryptedAmount }
        │
        ▼
Step 2: Wait for KMS public decryption
  Relayer calls publicDecrypt([encryptedAmount])
        │
        │  ← this takes 30–90 seconds on Sepolia
        ▼
  KMS returns { cleartextAmount, decryptionProof }
        │
        ▼
Step 3: finalizeUnwrap() (permissionless — anyone can call)
  ConfidentialWrapper.finalizeUnwrap(
    unwrapRequestId,
    cleartextAmount,
    decryptionProof
  )
        │
        ▼
  UnwrapFinalized event emitted
  ERC-20 transferred to receiver
        │
        ▼
  ERC-20 balance updated ✓
```

### Status states shown in UI

| State | Description |
|---|---|
| `idle` | No unwrap in progress |
| `requesting` | unwrap() tx sent, waiting for confirmation |
| `decrypting` | Waiting for KMS to publicly decrypt the amount |
| `finalizing` | finalizeUnwrap() tx sent |
| `done` | ERC-20 balance updated |
| `error` | Something failed — message shown with remediation |

### Why two steps?

ERC-7984 balances are encrypted. To release the underlying ERC-20, the contract needs to know the **plaintext amount** — but only the KMS can decrypt it. The `unwrap()` call locks the encrypted amount, the KMS decrypts it publicly (so anyone can verify it), then `finalizeUnwrap()` uses the proof to release the ERC-20.

---

## Decrypt Flow (EIP-712)

Decryption lets you view the plaintext balance of **any** ERC-7984 token — not just registry tokens. Your private key never leaves your device.

### Flow Diagram

```
User pastes any ERC-7984 address
(or selects from registry)
        │
        ▼
SDK reads encrypted balance handle
from contract: balanceOf(userAddr) → bytes32 ciphertext
        │
        ▼
SDK generates ephemeral keypair
(in browser, never sent anywhere)
        │
        ▼
EIP-712 signature request shown in MetaMask
User signs → permits re-encryption
        │
        ▼
Signed request sent to Zama Relayer
relayer.testnet.zama.cloud
        │
        ▼
KMS re-encrypts ciphertext under
user's ephemeral public key
        │
        ▼
SDK decrypts locally using
ephemeral private key
        │
        ▼
Plaintext balance shown in UI ✓
(never touches a server)
```

### Code path

```typescript
// src/hooks/useDecrypt.ts
const token = sdk.createToken(erc7984Address)
const balance: bigint = await token.balanceOf()
// ↑ This single call handles the entire EIP-712 flow above
```

### Privacy guarantee

The user's **wallet private key** is never used for decryption — only for the EIP-712 signature that authorizes the re-encryption. The actual decryption uses a throwaway keypair generated fresh in the browser. The Zama KMS never sees the plaintext.

---

## Faucet

The faucet mints test ERC-20 tokens from the official `cTokenMock` contracts on Sepolia.

### Which tokens have a faucet?

Only **Mock** tokens support public minting. Non-mock tokens (e.g. `ctGBP` without the "Mock" suffix) have restricted mint access and are excluded from the faucet UI.

```
Token name contains "Mock"?
        │
   Yes  │  No
   ▼    │   ▼
 Show   │  Hide from
 faucet │  faucet
        │  (show in registry only)
```

### Faucet call

```typescript
// Each cTokenMock implements a public mint function:
cTokenMock.mint(userAddress, 1000_000000n) // 1,000 tokens (6 decimals)
```

---

## Contract Addresses

### Sepolia FHEVM Infrastructure

| Contract | Address |
|---|---|
| ACL | `0x687820221192C5B662b25367F70076A37bc79b6c` |
| KMS Verifier | `0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC` |
| Input Verifier | `0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4` |
| Decryption Verifier | `0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1` |
| Input Verification | `0x7048C39f048125eDa9d678AEbaDfB22F7900a29F` |

### Sepolia Endpoints

| Service | URL |
|---|---|
| Relayer | `https://relayer.testnet.zama.cloud` |
| RPC | `https://eth-sepolia.public.blastapi.io` |
| Chain ID | `11155111` |
| Gateway Chain ID | `55815` |

### Sepolia Wrappers Registry

The registry address is sourced from `src/lib/constants.js`. The registry contract exposes:

```solidity
getTokenConfidentialTokenPairs()     // all pairs
getTokenConfidentialTokenPairsLength() // count
isConfidentialTokenValid(address)    // validity check
getConfidentialTokenAddress(erc20)   // erc20 → wrapper
getTokenAddress(wrapper)             // wrapper → erc20
```

---

## Local Development

### Prerequisites

- Node.js 18+ or Bun
- MetaMask with Sepolia / Mainnet network added
* "Mainnet architecture is supported in the config but disabled — Zama's mainnet cUSDC, cUSDT, and cWETH wrappers are temporarily paused following a Circle blacklist on May 30, 2026. WrapLayer will enable mainnet automatically once Zama restores wrapper access."
- Sepolia ETH (from [sepoliafaucet.com](https://sepoliafaucet.com))

### Setup

```bash
git clone https://github.com/Yash-arch-ui/WrapLayer
cd WrapLayer
bun install        # or npm install
cp .env.local.example .env.local
bun dev            # or npm run dev
```

### Environment variables

```env
# .env.local
```

### Project structure

```
src/
├── components/
│   ├── app/
│   │   └── AppShell.tsx          # Root layout + providers wrapper
│   ├── marketing/
│   │   ├── HeroNodes.tsx         # Animated node graph on landing page
│   │   ├── MarketingNavbar.tsx   # Landing page navbar
│   │   └── MarketingFooter.tsx   # Landing page footer
│   └── ui/                       # shadcn/ui primitives
│       └── ConnectWallet.tsx
│       └── UnwrapPanel.tsx
├── hooks/
│   ├── useRegistry.tsx           # Reads + merges onchain + local pairs
│   ├── useWrapper.tsx            # wrap() / unwrap() / finalizeUnwrap()
│   ├── useDecrypt.ts             # EIP-712 user decryption via Zama SDK
│   ├── useFaucet.ts              # cTokenMock.mint()
│   └── useAllowance.ts           # ERC-20 allowance reads
├── lib/
│   ├── abi/
│   │   └── registry.ts           # Wrappers Registry ABI
│   ├── registry.ts               # Registry read functions
│   ├── token.ts                  # LOCAL_CONFIG_PAIRS + pair merging
│   ├── wrapper.ts                # ConfidentialWrapper interactions
│   ├── erc20.ts                  # ERC-20 read/write helpers
│   ├── allowance.ts              # Allowance check + approve flow
│   ├── zama.ts                   # ZamaSDK + RelayerWeb initialization
│   ├── wagmi.ts                  # Wagmi config (Sepolia chain)
│   └── constants.js              # Registry address + token list
├── routes/
│   ├── index.tsx                 # Landing page (marketing)
│   ├── dashboard.tsx             # Portfolio overview + quick actions
│   ├── registry.tsx              # Registry browser + wrap/unshield per pair
│   ├── faucet.tsx                # cTokenMock faucet
│   ├── decrypt.tsx               # Universal balance decrypter
│   └── docs.tsx                  # Integration documentation
├── providers/
│   └── providers.tsx             # ZamaProvider + WagmiProvider + QueryClientProvider
└── router.tsx                    # TanStack Router config
```

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

No server required — WrapLayer is a fully static SPA. All onchain reads go directly to Sepolia RPC from the browser.

### Build for production

```bash
bun run build      # outputs to dist/
bun run preview    # preview the production build locally
```

---

## How WrapLayer reduces ecosystem fragmentation

Before WrapLayer, every team building on Zama FHEVM would:

1. Deploy their own ERC-20 on Sepolia
2. Deploy their own ERC-7984 wrapper
3. Write their own frontend to interact with it

This meant every integration targeted a different set of token addresses. Nothing composed.

WrapLayer makes the **official Zama Wrappers Registry** the path of least resistance:

- Developers use the canonical tokens instead of deploying their own
- Users have one place to wrap, unwrap, and decrypt
- Integrations build against addresses that are stable and officially maintained
- Custom pairs can still be added via local config without deploying new contracts

---

## License

MIT — see [LICENSE](./LICENSE)

---

*Built for the Zama Developer Program · Sepolia · Mainnet · FHEVM*
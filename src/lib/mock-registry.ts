export type WrapperPair = {
  id: string;
  underlyingSymbol: string;
  underlyingName: string;
  wrapperSymbol: string;
  wrapperName: string;
  underlyingAddress: string;
  wrapperAddress: string;
  tvl: string;
  chain: "Sepolia" | "Zama Devnet";
};

export const MOCK_PAIRS: WrapperPair[] = [
  {
    id: "1",
    underlyingSymbol: "USDC",
    underlyingName: "USD Coin",
    wrapperSymbol: "cUSDC",
    wrapperName: "Confidential USDC",
    underlyingAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    wrapperAddress: "0x7984c0nfUSDC0011223344556677889900aabbcc",
    tvl: "$4.82M",
    chain: "Sepolia",
  },
  {
    id: "2",
    underlyingSymbol: "WETH",
    underlyingName: "Wrapped Ether",
    wrapperSymbol: "cWETH",
    wrapperName: "Confidential WETH",
    underlyingAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    wrapperAddress: "0x7984c0nfWETHaabbccddeeff00112233445566",
    tvl: "$12.14M",
    chain: "Sepolia",
  },
  {
    id: "3",
    underlyingSymbol: "DAI",
    underlyingName: "Dai Stablecoin",
    wrapperSymbol: "cDAI",
    wrapperName: "Confidential DAI",
    underlyingAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    wrapperAddress: "0x7984c0nfDAI99887766554433221100ffeeddcc",
    tvl: "$2.30M",
    chain: "Zama Devnet",
  },
  {
    id: "4",
    underlyingSymbol: "WBTC",
    underlyingName: "Wrapped BTC",
    wrapperSymbol: "cWBTC",
    wrapperName: "Confidential WBTC",
    underlyingAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    wrapperAddress: "0x7984c0nfWBTC00aabbccddeeff112233445566",
    tvl: "$7.90M",
    chain: "Sepolia",
  },
  {
    id: "5",
    underlyingSymbol: "LINK",
    underlyingName: "Chainlink",
    wrapperSymbol: "cLINK",
    wrapperName: "Confidential LINK",
    underlyingAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    wrapperAddress: "0x7984c0nfLINK1122aabbccddeeff33445566778",
    tvl: "$1.05M",
    chain: "Sepolia",
  },
  {
    id: "6",
    underlyingSymbol: "UNI",
    underlyingName: "Uniswap",
    wrapperSymbol: "cUNI",
    wrapperName: "Confidential UNI",
    underlyingAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    wrapperAddress: "0x7984c0nfUNI9988aabbccddeeff1122334455667",
    tvl: "$640K",
    chain: "Zama Devnet",
  },
];

export function shortAddress(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

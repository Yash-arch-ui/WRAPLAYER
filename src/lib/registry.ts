import { getAddress } from "viem";
console.log("registry.ts loaded");

export interface RegistryTokenPair {
  tokenAddress: `0x${string}`;
  confidentialTokenAddress: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  logo:string;
  isLocalDevAsset: boolean;
  isValid: boolean;
  
}
const TOKEN_LOGOS: Record<string, string> = {
  USDCMock: "/tokens/usdc.png",
  USDTMock: "/tokens/usdt.png",
  WETHMock: "/tokens/weth.png",
  BRONMock: "/tokens/bron.png",
  ZAMAMock: "/tokens/zama.png",
  XAUtMock: "/tokens/xAut.png",
  TGBPMock: "/tokens/tgBPmocK.png",
  TGBP: "/tokens/tgbp.png",
  STEAKCUSDC:"/tokens/SteakhouseConfidentialprimeusdc.png",
};
// See Readme.md for instructions on how to add local development pairs
const LOCAL_CONFIG_PAIRS: RegistryTokenPair[] = [/*

  {
    tokenAddress: "0xYourERC20TokenAddressHere",               // The standard ERC-20 asset
    confidentialTokenAddress: "0xYourERC7984TokenAddressHere", // The wrapped confidential asset
    name: "My Custom Token",
    symbol: "mCTK",
    decimals: 18,
    logo:"/tokens/default.svg"// can add by your own also
    isLocalDevAsset: true,
    isValid: true,
  }
    */
];

export async function getRegistryPairs(sdk: any): Promise<RegistryTokenPair[]> {
  console.log("getRegistryPairs called");

  if (!sdk?.registry) {
    return [];
  }
  try {
    console.log("2. Requesting pairs from Zama on-chain registry...");    
    const onchainPage = await sdk.registry.listPairs({
      page: 1,
      pageSize: 100,
      metadata: true,
    });
    console.log("3. Raw response from Zama contract:", onchainPage);

    const items = Array.isArray(onchainPage)
      ? onchainPage
      : onchainPage?.items ?? [];
    console.log("4. Total items found on-chain:", items.length);
    if (items.length === 0) {
      console.warn("CRITICAL: The contract returned 0 tokens. The registry is empty on this network.");
    }
    const formattedOnchainPairs: RegistryTokenPair[] = items
      .map((item: any) => {
      const underlying = item?.tokenAddress ?? item?.underlying?.address;
        const confidential = item?.confidentialTokenAddress ?? item?.confidential?.address;  
        if (!underlying || !confidential) {
          console.warn("Skipping malformed token missing addresses:", item);
          return null;
        }
        const symbol = item?.underlying?.symbol??item?.symbol??"UNKNOWN";
        const normalizedSymbol= symbol.toUpperCase();
        console.log(`Checking token symbol from ZAMA : "${symbol}" (Normalized: "${normalizedSymbol}")`);
        return {
          tokenAddress: getAddress(underlying),
          confidentialTokenAddress: getAddress(confidential),
          name: item?.underlying?.name ?? item?.name ?? "Unknown Token",
          symbol:symbol,
          decimals:item?.underlying?.decimals ??item?.decimals ??18,
          logo: TOKEN_LOGOS[item?.underlying?.symbol] || "/tokens/default.png",
          isLocalDevAsset: false,
          isValid: item?.isValid ??true,
        };
        console.log(`Checking tokensymbol from ZAMA : "${symbol}"`);
      })
      .filter(
        (pair: any): pair is RegistryTokenPair => pair !== null
      );
    const combinedPairs = [...formattedOnchainPairs];
    for (const localPair of LOCAL_CONFIG_PAIRS) {
      const exists = combinedPairs.some(
        (pair: RegistryTokenPair) =>
          pair.tokenAddress.toLowerCase() ===
            localPair.tokenAddress.toLowerCase() &&
          pair.confidentialTokenAddress.toLowerCase() ===
            localPair.confidentialTokenAddress.toLowerCase()
      );

      if (!exists) {
        combinedPairs.push(localPair);
      }
    }
 console.log("5. Returning final combined pairs array size:", combinedPairs.length);
    return combinedPairs;
  } catch (error) {
    console.error("6. CATCH BLOCK HIT! Error fetching registry:", error);
    return LOCAL_CONFIG_PAIRS;
  }
}
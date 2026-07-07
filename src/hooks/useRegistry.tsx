import { useAccount, useReadContract } from "wagmi";
import { registryAbi } from "../lib/abi/registry";
import { useAllowance } from "./useAllowance";
import { useWrapper } from "./useWrapper";
import { useDecrypt } from "./useDecrypt";

export function useRegistry(erc20Address?: `0x${string}`) {
    const REGISTRY_ADDRESS = "0x2f0750Bbb0A246059d80e94c454586a7F27a128e";
  const { address: walletAddress } = useAccount();
  const { data: confidentialTokenAddress, isPending: isRegistryLoading, refetch: refreshRegistry } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    functionName: "getWrapperFor", 
    args: erc20Address ? [erc20Address] : undefined,
    query: { enabled: !!erc20Address },
  });

  const wrapperAddress = confidentialTokenAddress as `0x${string}` | undefined;

  // 2. Initialize Domain Hooks using the resolved addresses
  const { allowance, fetchAllowance, isPending: isAllowancePending } = useAllowance(erc20Address || null);
  const { shield, unshield,  isPending: isWrapperPending,error:wrapperError } = useWrapper(wrapperAddress || undefined);
  const { decryptedBalance, fetchPrivateBalance, isDecrypting } = useDecrypt(wrapperAddress || undefined);

  // 3. Coordinate action handlers for registry.tsx
  const triggerRefreshAllowance = async () => {
    if (!walletAddress || !wrapperAddress) return;
    await fetchAllowance(walletAddress, wrapperAddress);
  };

  const triggerOnChainWrap = async (amount: bigint) => {
    if (!wrapperAddress) throw new Error("Wrapper address not verified");
    await shield(amount);
    await triggerRefreshAllowance(); 
  }; 

  const triggerOnChainUnwrap = async (amount: bigint) => {
    if (!wrapperAddress) throw new Error("Wrapper address not verified");
    await unshield(amount);
  };

  const triggerDecryptBalance = async () => {
    if (!wrapperAddress) throw new Error("Wrapper address not verified");
    await fetchPrivateBalance();
  };

  return {
    confidentialTokenAddress: wrapperAddress,
    allowance,
    decryptedValue: decryptedBalance,
    
    // Aggregated Loading States
    isLoading: isRegistryLoading || isAllowancePending || isWrapperPending || isDecrypting,
    isDecrypting,
    isTxPending: isWrapperPending,
    refreshRegistry,
    triggerRefreshAllowance,
    triggerOnChainWrap,
    triggerOnChainUnwrap,
  
    triggerDecryptBalance,
  };
}
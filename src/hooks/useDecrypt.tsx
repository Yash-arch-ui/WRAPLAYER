import { useState } from "react";
import { useZamaSDK } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

export function useDecrypt(confidentialTokenAddress?: `0x${string}`) {
  const sdk = useZamaSDK();
  const { address } = useAccount();
  const [decryptedBalance, setDecryptedBalance] = useState<bigint | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const fetchPrivateBalance = async () => {
    if (!sdk || !confidentialTokenAddress || !address) return null;
    setIsDecrypting(true);
    try {
      const token = sdk.createWrappedToken(confidentialTokenAddress); 
      const balance = await token.balanceOf(address); //
      setDecryptedBalance(balance);
      setIsDecrypting(false);
      return balance;
    } catch (error) {
      console.error("Decryption pipeline failure:", error);
      setIsDecrypting(false);
      return null;
    }
  };

  return { decryptedBalance, fetchPrivateBalance, isDecrypting };
}
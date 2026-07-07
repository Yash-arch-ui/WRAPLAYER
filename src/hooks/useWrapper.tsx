import { useState } from "react";
import { useZamaSDK } from "@zama-fhe/react-sdk";

export  function useWrapper(confidentialTokenAddress?: `0x${string}`) {
  const sdk = useZamaSDK();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const shield = async (amount: bigint) => {
    if (!sdk || !confidentialTokenAddress) throw new Error("SDK or Token address missing");
    setIsPending(true);
    setError(null);
    try {
      const token = sdk.createWrappedToken(confidentialTokenAddress); //
      const result = await token.shield(amount, { approvalStrategy: "exact", 
       // @ts-ignore: Forcing gas parameters through the SDK's strict types
        gasLimit: 30000000n ,
        // @ts-ignore: viem uses 'gas' instead of 'gasLimit', passing both to be safe
      gas: 30000000n}); //
      setIsPending(false);
      return result.txHash;
    } catch (err: any) {
      setError(err);
      setIsPending(false);
      throw err;
    }
  };

  const unshield = async (amount: bigint) => {
    if (!sdk || !confidentialTokenAddress) throw new Error("SDK or Token address missing");
    setIsPending(true);
    setError(null);
    try {
      const token = sdk.createWrappedToken(confidentialTokenAddress); //
      const result = await token.unshield(amount); //
      setIsPending(false);
      return result.txHash;
    } catch (err: any) {
      setError(err);
      setIsPending(false);
      throw err;
    }
  };
/*
  const transfer = async (recipient: `0x${string}`, amount: bigint) => {
    if (!sdk || !confidentialTokenAddress) throw new Error("SDK or Token address missing");
    setIsPending(true);
    setError(null);
    try {
      const token = sdk.createWrappedToken(confidentialTokenAddress); //
      const result = await token.confidentialTransfer(recipient, amount); //
      setIsPending(false);
      return result.txHash;
    } catch (err: any) {
      setError(err);
      setIsPending(false);
      throw err;
    }
  };
  */

  return { shield, unshield, isPending, error };
}
import { useState } from "react";
import { getAllowanceQuery } from "../lib/allowance";

export function useAllowance(tokenAddress: `0x${string}` | null) {
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [isPending, setIsPending] = useState(false);

  const fetchAllowance = async (owner: `0x${string}`, spender: `0x${string}`) => {
    if (!tokenAddress) return;
    try {
      const currentAllowance = await getAllowanceQuery(tokenAddress, owner, spender);
      setAllowance(currentAllowance);
    } catch (error) {
      console.error("Failed to fetch allowance:", error);
    }
  };

  return { allowance, fetchAllowance, isPending };
}
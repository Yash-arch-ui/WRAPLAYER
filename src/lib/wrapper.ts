import { ZamaSDK } from "@zama-fhe/sdk";
export class WrapperEngine {
  private sdk: ZamaSDK;

  constructor(sdkInstance: ZamaSDK) {
    this.sdk = sdkInstance;
  }

  async shieldToken(confidentialTokenAddress: `0x${string}`, amount: bigint) {
    console.log(`[Zama SDK V3.1] Initiating shield for: ${amount.toString()}`);
    const wrappedToken = this.sdk.createWrappedToken(confidentialTokenAddress);
    
    const result = await wrappedToken.shield(amount, {
      approvalStrategy: "exact" 
    });
    
    return result.txHash;
  }
  async unshieldToken(confidentialTokenAddress: `0x${string}`, amount: bigint) {
    console.log(`[Zama SDK V3.1] Initiating unshield for: ${amount.toString()}`);
    const wrappedToken = this.sdk.createWrappedToken(confidentialTokenAddress);
    
    const result = await wrappedToken.unshield(amount);
    return result.txHash;
  }
  async privateTransfer(confidentialTokenAddress: `0x${string}`, recipient: `0x${string}`, amount: bigint) {
    console.log(`[Zama SDK V3.1] Executing confidential transfer to ${recipient}`);
    const wrappedToken = this.sdk.createWrappedToken(confidentialTokenAddress);
    
    const result = await wrappedToken.confidentialTransfer(recipient, amount);
    return result.txHash;
  }
}
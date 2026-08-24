// wagmi v2 augmented the global Window with an `ethereum` provider; v3 no longer does.
// src/BlockchainAPI.ts talks to the injected provider directly (outside wagmi), so the
// declaration lives here instead.
declare global {
  interface Window {
    ethereum?: any;
  }
}

export {};

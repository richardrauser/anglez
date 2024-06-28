import { http, createConfig } from 'wagmi';
import { sepolia, baseSepolia, base } from 'wagmi/chains';
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors';

const projectId = 'c9ea9ca2a0aede9f6aca19cb4992b402';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [],
  connectors: [coinbaseWallet()],
  transports: {
    // [base.id]: http(),
    // [sepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
});

import { http, createConfig } from 'wagmi';
import { sepolia, baseSepolia, base, mainnet } from 'wagmi/chains';
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors';

const projectId = 'c9ea9ca2a0aede9f6aca19cb4992b402';

export const config = createConfig({
  chains: [mainnet, sepolia, base, baseSepolia],
  // connectors: [],
  connectors: [
    coinbaseWallet({
      appName: 'anglez',
      appLogoUrl: 'https://anglez.xyz/anglez-logo-treatment-2.png',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
});

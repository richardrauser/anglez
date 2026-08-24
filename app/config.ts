import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    // Inside a Farcaster client this connects straight to the user's Farcaster wallet,
    // which is what lets the Mini App mint without a separate wallet handshake. It is
    // inert outside Farcaster, so it is safe to register unconditionally - the Coinbase
    // connector below still drives the normal web flow.
    farcasterMiniApp(),
    coinbaseWallet({
      appName: 'anglez',
      appLogoUrl: 'https://anglez.xyz/anglez-logo-treatment-2.png',
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

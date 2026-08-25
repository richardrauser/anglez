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
    // Coinbase Smart Wallet specifically - the passkey-based smart account, which the
    // SDK calls the `scw` signer. This connector can also reach the Coinbase Wallet
    // browser extension (the `walletlink` signer, a conventional EOA), and wagmi's
    // default preference of `all` lets it pick. That is why a menu entry labelled
    // "Coinbase Smart Wallet" could hand the request to a locked extension and fail.
    // The extension is a separate product and still appears in the list on its own via
    // EIP-6963 discovery when it is installed.
    coinbaseWallet({
      appName: 'anglez',
      appLogoUrl: 'https://anglez.xyz/anglez-logo-treatment-2.png',
      preference: { options: 'smartWalletOnly' },
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

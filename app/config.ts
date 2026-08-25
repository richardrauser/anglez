import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { baseAccount } from 'wagmi/connectors';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    // Inside a Farcaster client this connects straight to the user's Farcaster wallet,
    // which is what lets the Mini App mint without a separate wallet handshake. It is
    // registered unconditionally because whether we're inside a Farcaster client can
    // only be answered after mount, well after this config is built - but it is NOT
    // harmless to offer outside one: its requests go to a host that isn't there and come
    // back as an opaque internal JSON-RPC error. ConnectButton is what keeps it out of
    // the menu on the open web, where the connectors below drive the normal flow.
    farcasterMiniApp(),
    // Base Account - the passkey-based smart account formerly called Coinbase Smart
    // Wallet, on its current SDK (@base-org/account). It reports itself as "Base
    // Account", so the menu needs no relabelling.
    //
    // This also restores the Coinbase Wallet extension to the list. wagmi drops any
    // EIP-6963 provider whose rdns a declared connector already claims, and
    // coinbaseWallet claims com.coinbase.wallet - so once that connector was narrowed to
    // the smart wallet, it was still suppressing the extension it no longer served.
    // baseAccount claims app.base.account instead, leaving the extension to be
    // discovered and listed in its own right.
    baseAccount({
      appName: 'anglez',
      appLogoUrl: 'https://anglez.xyz/anglez-logo-treatment-2.png',
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

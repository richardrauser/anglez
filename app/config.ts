import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { baseAccount } from 'wagmi/connectors';
import { farcasterMiniAppWhenHosted } from '@/src/farcaster/miniAppConnector';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    // Inside a Farcaster client this connects straight to the user's Farcaster wallet,
    // which is what lets the Mini App mint without a separate wallet handshake.
    //
    // It has to be registered unconditionally, because whether a Farcaster host is there
    // can only be settled after mount - long after this config is built. The wrapper is
    // what makes that safe: outside a host it produces no provider, so wagmi skips it
    // instead of hanging on it. ConnectButton separately keeps it out of the wallet menu
    // where it could not work, leaving the connectors below to drive the normal web flow.
    farcasterMiniAppWhenHosted(),
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

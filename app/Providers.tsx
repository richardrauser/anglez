'use client';

import { WagmiProvider } from 'wagmi';
import { config } from './config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { OnchainKitProvider } from '@coinbase/onchainkit';
import { sepolia, base } from 'viem/chains';

const queryClient = new QueryClient();

export function Providers({ children }: { children: any }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* <OnchainKitProvider apiKey="ikCoAA-DxC0DMH4Y0xAT6tqPNjjMhftE" chain={base}> */}
        {children}
        {/* </OnchainKitProvider> */}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

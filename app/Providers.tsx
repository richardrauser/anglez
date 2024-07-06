'use client';

import { WagmiProvider } from 'wagmi';
import { config } from './config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { sepolia, base, baseSepolia } from 'viem/chains';
import { Shield3Provider } from '@shield3/react-sdk';

const queryClient = new QueryClient();

export function Providers({ children }: { children: any }) {
  const chain = baseSepolia;

  return (
    <WagmiProvider config={config}>
      <Shield3Provider apiKey="j5MPcHyLBf3HHwTaV0BDg7nlamF9l6yvaLIMl9Be">
        <QueryClientProvider client={queryClient}>
          <OnchainKitProvider apiKey="ikCoAA-DxC0DMH4Y0xAT6tqPNjjMhftE" chain={chain}>
            {children}
          </OnchainKitProvider>
        </QueryClientProvider>
      </Shield3Provider>
    </WagmiProvider>
  );
}

'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Shield3Provider } from '@shield3/react-sdk';
import { config } from './config';

const queryClient = new QueryClient();

export function Providers({ children }: { children: any }) {
  return (
    <WagmiProvider config={config}>
      <Shield3Provider apiKey="j5MPcHyLBf3HHwTaV0BDg7nlamF9l6yvaLIMl9Be">
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Shield3Provider>
    </WagmiProvider>
  );
}

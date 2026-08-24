'use client';

import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http, toCoinType, type Address } from 'viem';
import { base, mainnet } from 'viem/chains';

/**
 * Resolves the friendly name for an address, replacing OnchainKit's `<Identity>`.
 *
 * Two lookups, in priority order:
 *   1. Basename - the Base-native name, resolved per ENSIP-19 by passing Base's coinType
 *      to an otherwise ordinary ENS reverse lookup.
 *   2. Mainnet ENS - the plain `.eth` name.
 *
 * Both resolve against mainnet, because that is where the ENS registry lives; Base names
 * are reached from there through the ENSIP-19 cross-chain path. Callers fall back to a
 * shortened address when this returns null, so a failed or slow lookup is never fatal.
 *
 * Note: ENSIP-19 resolution leans on CCIP-read and state proofs, which public RPCs often
 * rate-limit. Set NEXT_PUBLIC_MAINNET_RPC_URL to a dedicated endpoint if Basenames stop
 * resolving in production.
 */

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL),
});

const baseCoinType = toCoinType(base.id);

export function shortenAddress(address?: string): string {
  if (!address) {
    return '';
  }
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

async function resolveName(address: Address): Promise<string | null> {
  // Prefer the Base name, but never let a failure on that path hide a usable .eth name.
  try {
    const basename = await mainnetClient.getEnsName({ address, coinType: baseCoinType });
    if (basename) {
      return basename;
    }
  } catch (error) {
    console.warn('Basename lookup failed', error);
  }

  try {
    return await mainnetClient.getEnsName({ address });
  } catch (error) {
    console.warn('ENS lookup failed', error);
    return null;
  }
}

export function useOnchainName(address?: Address) {
  const { data } = useQuery({
    queryKey: ['onchain-name', address],
    queryFn: () => resolveName(address as Address),
    enabled: Boolean(address),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    name: data ?? null,
    displayName: data ?? shortenAddress(address),
  };
}

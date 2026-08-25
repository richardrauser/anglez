'use client';

import React, { useEffect, useState } from 'react';
import '@/src/BlockchainAPI';
import { ActionIcon, Button, Group, Menu, Text, rem } from '@mantine/core';
import { IconChevronDown, IconMoneybag, IconReload, IconWallet } from '@tabler/icons-react';
import { useAccount, useBalance, useDisconnect, useConnect, type Connector } from 'wagmi';
import { formatUnits } from 'viem';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { handleError } from '@/src/ErrorHandler';
import { AnglezCurrentNetworkExplorerUrl } from '@/src/Constants';
import classes from '@/styles/SplitButton.module.css';
import { useOnchainName, shortenAddress } from '@/src/useOnchainName';
import { useIsInMiniApp } from '@/src/farcaster/useIsInMiniApp';
import { canOpenWalletPopup } from '@/src/canOpenWalletPopup';

// declare global {
//   interface Window {
//     ethereum?: any;
//   }
// }

export default function ConnectButton() {
  const { address, status } = useAccount();
  const balanceResult = useBalance({ address });
  // wagmi 3 dropped `formatted` from useBalance().data, which now carries only
  // { decimals, symbol, value }.
  const formattedBalance = balanceResult.data
    ? formatUnits(balanceResult.data.value, balanceResult.data.decimals)
    : undefined;
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { name: onchainName } = useOnchainName(address);
  const isInMiniApp = useIsInMiniApp();
  // const chainId = useChainId();

  // Each of the two declared connectors needs something from its surroundings that it
  // cannot check for itself, and offering one where that thing is missing produces a
  // dead end the person who clicked can do nothing about. So each is asked for
  // separately, rather than partitioned by environment - the environments overlap.
  //
  // Farcaster's in-app browser is the case that makes the difference: it is NOT a Mini
  // App host, so the Mini App connector has nobody to talk to, but it does inject its own
  // wallet for the page to discover. The injected entry is the one that works there, and
  // it is Base Account that has to go.
  const availableConnectors = connectors.filter((connector) => {
    // Needs a Farcaster host on the other end of the bridge. See
    // `farcasterMiniAppWhenHosted` for what happens when there isn't one.
    if (connector.type === farcasterMiniApp.type) {
      return isInMiniApp;
    }
    // Needs a popup that keeps its opener. `baseAccount` is the connector's own declared
    // type; the wagmi factory does not expose it as a constant the way Farcaster's does.
    if (connector.type === 'baseAccount') {
      return canOpenWalletPopup();
    }
    // Anything else here was announced to the page over EIP-6963 - by an extension, or by
    // the app whose browser we are running in. Whoever announced it can serve it.
    return true;
  });

  // This only tracks whether we've hydrated - it is deliberately NOT a copy of the
  // wallet state. The connection state itself is derived from `status` during render,
  // because mirroring it into state via an effect lags a render behind and drifts out
  // of sync with what the rest of the app reads from `useAccount()` - which is how this
  // button could claim to be connected while ArtBoard simultaneously warned that it
  // wasn't. wagmi restores its persisted connection during the first client render, so
  // rendering the real state before mount would disagree with the server's markup.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // `isConnected` alone is not safe to branch on: wagmi reports it as indeterminate
  // while `status` is 'reconnecting', so treat only 'connected' as connected and show
  // the in-between states as pending rather than as "no wallet".
  const isPending = !mounted || status === 'connecting' || status === 'reconnecting';
  const etherscanUrl = `${AnglezCurrentNetworkExplorerUrl}/address/${address}`;

  const connectWallet = (connector: Connector) => {
    connect(
      { connector },
      {
        onError: (error) => {
          // Logged with the connector id: provider errors reuse a small set of EIP-1193
          // codes, so the message and cause chain are what actually identify a failure.
          console.error('Wallet connection failed', connector.id, error);
          handleError(error);
        },
      }
    );
  };

  const disconnectWallet = () => {
    console.log('Disconnecting wallet..');
    disconnect();
  };

  const navToEtherscan = () => {
    window.open(etherscanUrl, '_blank');
  };

  const refreshWallet = () => {
    // TODO: Implement refresh wallet
    // fetchDetails();
  };

  // Wallet discovery/reconnect is still in flight - don't claim either state yet.
  if (isPending) {
    return (
      <Button loading disabled>
        Connecting…
      </Button>
    );
  }

  if (status !== 'connected') {
    return (
      <Menu transitionProps={{ transition: 'pop' }} position="bottom-end" withinPortal>
        <Menu.Target>
          <Button>Connect Wallet</Button>
        </Menu.Target>
        <Menu.Dropdown>
          {/* Filtering can legitimately leave nothing - an app's in-app browser that
              injects no wallet of its own has none of the three on offer. Say so, rather
              than opening an empty dropdown. */}
          {availableConnectors.length === 0 ? (
            <Menu.Item disabled>No wallet available in this browser</Menu.Item>
          ) : (
            availableConnectors.map((connector) => (
              <Menu.Item key={connector.id} onClick={() => connectWallet(connector)}>
                {connector.name}
              </Menu.Item>
            ))
          )}
        </Menu.Dropdown>
      </Menu>
    );
  } else {
    return (
      <Group wrap="nowrap" gap={1}>
        <Button className={classes.button} onClick={disconnectWallet}>
          Disconnect Wallet
        </Button>
        <Menu transitionProps={{ transition: 'pop' }} position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="filled"
              // color={theme.primaryColor}
              size={36}
              className={classes.menuControl}
            >
              <IconChevronDown style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              onClick={navToEtherscan}
              leftSection={
                <IconWallet
                  style={{ width: rem(16), height: rem(16) }}
                  stroke={1.5}
                  // color={theme.colors.blue[5]}
                />
              }
            >
              <div>
                {onchainName && <Text size="sm">{onchainName}</Text>}
                <Text size="xs" c="dimmed">
                  {shortenAddress(address)}
                </Text>
              </div>
            </Menu.Item>
            <Menu.Item
              onClick={navToEtherscan}
              leftSection={
                <IconMoneybag
                  style={{ width: rem(16), height: rem(16) }}
                  stroke={1.5}
                  // color={theme.colors.blue[5]}
                />
              }
            >
              {formattedBalance} {balanceResult.data?.symbol}
            </Menu.Item>
            <Menu.Item
              onClick={refreshWallet}
              leftSection={
                <IconReload
                  style={{ width: rem(16), height: rem(16) }}
                  stroke={1.5}
                  // color={theme.colors.blue[5]}
                />
              }
            >
              Refresh
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    );
  }
}

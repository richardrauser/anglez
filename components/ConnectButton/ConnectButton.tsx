'use client';

import React, { useEffect, useState } from 'react';
import { Identity } from '@coinbase/onchainkit/identity';
import { Address } from '@coinbase/onchainkit/identity';
import { Name } from '@coinbase/onchainkit/identity';
import classes from '@/styles/SplitButton.module.css';
import '@/src/BlockchainAPI';
import { handleError } from '@/src/ErrorHandler';
import { AnglezCurrentNetworkExplorerUrl, AnglezCurrentNetworkID } from '@/src/Constants';
import styles from './ConnectButton.module.css';
import { ActionIcon, ActionIconGroup, Button, Group, Menu, Text, rem } from '@mantine/core';
import {
  IconChevronDown,
  IconMoneybag,
  IconReload,
  IconStar,
  IconWallet,
} from '@tabler/icons-react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { Connector, useConnect } from 'wagmi';
import { useChainId } from 'wagmi';
import { useSwitchChain } from 'wagmi';

// declare global {
//   interface Window {
//     ethereum?: any;
//   }
// }

export default function ConnectButton() {
  const { address, status } = useAccount();
  const balanceResult = useBalance({ address: address });
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  // const chainId = useChainId();

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
  const etherscanUrl = AnglezCurrentNetworkExplorerUrl + '/address/' + address;

  const visitWalletWebsite = async () => {
    window.open('https://metamask.io', '_blank');
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
          {connectors.map((connector) => (
            <Menu.Item
              className={styles.shimmer}
              key={connector.id}
              onClick={() => connect({ connector })}
            >
              {/* <IconStar style={{ width: rem(16), height: rem(16) }} stroke={1.5} /> */}
              {connector.id != 'coinbaseWalletSDK' ? connector.name : 'Coinbase Smart Wallet ⭐️'}
            </Menu.Item>
          ))}
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
              <Identity
                address={address}
                schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
              >
                <Name />
                <Address />
              </Identity>{' '}
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
              {balanceResult.data?.formatted} {balanceResult.data?.symbol}
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

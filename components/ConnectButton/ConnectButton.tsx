'use client';

import React, { use, useEffect, useState } from 'react';
import { Identity } from '@coinbase/onchainkit/identity';
import { Address } from '@coinbase/onchainkit/identity';
import { Name } from '@coinbase/onchainkit/identity';
import classes from '@/styles/SplitButton.module.css';
import '@/src/BlockchainAPI';
import { handleError } from '@/src/ErrorHandler';
import { AnglezCurrentNetworkExplorerUrl, AnglezCurrentNetworkID } from '@/src/Constants';
import styles from './ConnectButton.module.css';
import { ActionIcon, ActionIconGroup, Button, Group, Menu, Text, rem } from '@mantine/core';
import { IconChevronDown, IconMoneybag, IconReload, IconWallet } from '@tabler/icons-react';
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
  const [etherscanUrl, setEtherscanUrl] = useState('');

  const { address, isConnected } = useAccount();
  const balanceResult = useBalance({ address: address });
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const chainId = useChainId();
  const [showConnectWallet, setShowConnectWallet] = useState(true);

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

  useEffect(() => {
    console.log('Running ConnectButton useEffect..');
    console.log('isConnected: ' + isConnected);

    setShowConnectWallet(!isConnected);

    // const hasWallet = window.ethereum !== undefined && window.ethereum !== null;
    console.log('Address: ' + address);

    console.log('Current chain ID: ' + chainId);

    if (chainId != undefined && chainId != AnglezCurrentNetworkID) {
      console.log('On wrong network.  Switching chain..');
      switchChain({ chainId: AnglezCurrentNetworkID });
    } else {
      console.log('On correct network.');
    }
  }, [isConnected]);

  if (showConnectWallet) {
    return (
      <Menu transitionProps={{ transition: 'pop' }} position="bottom-end" withinPortal>
        <Menu.Target>
          <Button>Connect Wallet</Button>
        </Menu.Target>
        <Menu.Dropdown>
          {connectors.map((connector) => (
            <Menu.Item key={connector.id} onClick={() => connect({ connector })}>
              {connector.name}
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

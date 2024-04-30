import React, { useEffect, useState } from 'react';

// import NavDropdown from 'react-bootstrap/NavDropdown';
// import Spinner from 'react-bootstrap/Spinner';
// import Button from 'react-bootstrap/Button';
import Image from 'next/image';
// import { Wallet2 } from 'react-bootstrap-icons';

import {
  fetchAccountDetails,
  fetchCachedAccountDetails,
  clearCachedAccountDetails,
  hasAccount,
} from '@/src/BlockchainAPI';
import classes from '@/styles/SplitButton.module.css';
import '@/src/BlockchainAPI';
import { handleError } from '@/src/ErrorHandler';
import * as Errors from '@/src/ErrorMessages';
import { CosmicWorldsCurrentNetworkExplorerUrl } from '@/src/Constants';
import ethereum from '../images/ethereum.svg';
import styles from './ConnectButton.module.css';
import { ActionIcon, Button, Group, Menu, rem } from '@mantine/core';
import {
  IconBookmark,
  IconCalendar,
  IconChevronDown,
  IconMoneybag,
  IconReload,
  IconTrash,
  IconWallet,
} from '@tabler/icons-react';

export default function ConnectButton(props) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  const [accountEthAddress, setAccountEthAddress] = useState('');
  const [accountEthBalance, setAccountEthBalance] = useState('');
  const [etherscanUrl, setEtherscanUrl] = useState('');

  const connectWallet = async () => {
    console.log('Attempting to connect wallet..');
    // const metaMaskUnlocked = (await window.ethereum._metamask.isUnlocked());
    // console.log("Metamask unlocked? " + metaMaskUnlocked);

    // if (window.ethereum.isMetaMask && !metaMaskUnlocked) {
    //   console.log("Metamask lockiepooed.");
    //   showErrorMessage("Please unlock MetaMask.");
    // } else {
    try {
      const accountDetails = await fetchAccountDetails();
      updateAccountDetails(accountDetails);
    } catch (err) {
      console.log('ERROR: ' + err.message);
      handleError(err);
    }
    // }
  };

  const fetchDetails = async () => {
    setIsLoading(true);
    setAccountEthAddress('');
    setAccountEthBalance('');
    setEtherscanUrl('');

    try {
      const connected = await hasAccount();

      if (!connected) {
        console.log('Not connected..');
        updateAccountDetails(null);
        return;
      }

      const cachedDetails = fetchCachedAccountDetails();
      if (cachedDetails !== undefined && cachedDetails !== null) {
        console.log(
          'Got address (' +
            cachedDetails.address +
            ') and balance (' +
            cachedDetails.displayBalance +
            ').'
        );
        updateAccountDetails(cachedDetails);
        return;
      }

      const accountDetails = await fetchAccountDetails();
      updateAccountDetails(accountDetails);
    } catch (error) {
      console.log('Error occurred fetching account details. ' + error);
      setIsLoading(false);
      // only display error if wallet is connected
      if (isWalletConnected == true) {
        handleError(error);
      }
      updateAccountDetails(null);
    }
  };

  const disconnectWallet = () => {
    console.log('Disconnecting wallet..');
    clearCachedAccountDetails();
    updateAccountDetails(null);
  };

  const navToEtherscan = () => {
    window.open(etherscanUrl, '_blank');
  };

  const refreshWallet = () => {
    fetchDetails();
  };

  const updateAccountDetails = (accountDetails) => {
    console.log('Updating account details..');
    const hasWallet = window.ethereum !== undefined && window.ethereum !== null;
    setIsLoading(false);
    if (accountDetails != null && hasWallet) {
      console.log('Has details and wallet.');
      setIsWalletInstalled(true);
      setIsWalletConnected(true);
      setAccountEthAddress(accountDetails.shortenedAddress);
      setAccountEthBalance(accountDetails.displayBalance.toString());
      setEtherscanUrl(
        CosmicWorldsCurrentNetworkExplorerUrl.CurrentNetworkExplorerUrl +
          'address/' +
          accountDetails.fullAddress
      );

      console.log('Address: ', accountDetails.address);
      console.log('Balance: ', accountDetails.displayBalance);
    } else {
      console.log('No details or wallet.');
      setIsWalletInstalled(hasWallet);
      setIsWalletConnected(false);
      setAccountEthAddress('');
      setAccountEthBalance('');
      setEtherscanUrl('');
    }
  };

  useEffect(() => {
    if (window.etherum != null) {
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Accounts changed.');
        clearCachedAccountDetails();
        disconnectWallet();
        // Is this causing multiple reloads?!
        fetchDetails();
      });

      // Is this causing multiple reloads?!
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed.');
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.
        clearCachedAccountDetails();
        disconnectWallet();

        // Is this causing multiple reloads?!
        // window.location.reload();
      });
    }

    async function fetchData() {
      await fetchDetails();
    }
    fetchData();
  }, []);

  // if (typeof window.ethereum === 'undefined') {
  //     setIsLoading(false);
  //     setIsWalletInstalled(false);
  // }

  return (
    <div>
      {isLoading ? (
        <div className={styles.spinnerContainer}>{/* <Spinner variant='dark' /> */}</div>
      ) : (
        <div>
          {!isWalletInstalled ? (
            <Button target="_blank" href="https://metamask.io">
              Install MetaMask
            </Button>
          ) : (
            <div>
              {!isWalletConnected ? (
                <Button onClick={connectWallet}>Connect wallet</Button>
              ) : (
                <Group wrap="nowrap" gap={0}>
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
                        {accountEthAddress}
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
                        {accountEthBalance}
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
                // <NavDropdown title="Your Details" id="basic-nav-dropdown">
                //   <NavDropdown.Item href={etherscanUrl} target="_blank" className={styles.item}>
                //     <div className={styles.navDropdownIcon}>
                //       <Wallet2 /> {accountEthAddress}
                //     </div>
                //   </NavDropdown.Item>
                //   <NavDropdown.Item href={etherscanUrl} target="_blank" className={styles.item}>
                //     <div className={styles.navDropdownIcon}>
                //       <Image src={ethereum} alt="ethereum logo" /> {accountEthBalance}
                //     </div>
                //   </NavDropdown.Item>
                //   <NavDropdown.Divider />
                //   <NavDropdown.Item onClick={refreshWallet}>Refresh</NavDropdown.Item>
                //   <NavDropdown.Item onClick={disconnectWallet}>Disconnect</NavDropdown.Item>
                // </NavDropdown>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

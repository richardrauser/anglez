import React, { useEffect, useState } from 'react';

import {
  fetchCurrentAccount,
  loadAccountDetails,
  fetchCachedAccountDetails,
  clearCachedAccountDetails,
  hasAccount,
  connectAccount,
} from '@/src/BlockchainAPI';
import classes from '@/styles/SplitButton.module.css';
import '@/src/BlockchainAPI';
import { handleError } from '@/src/ErrorHandler';
import { AnglezCurrentNetworkExplorerUrl } from '@/src/Constants';
import styles from './ConnectButton.module.css';
import { ActionIcon, Button, Group, Menu, rem } from '@mantine/core';
import { IconChevronDown, IconMoneybag, IconReload, IconWallet } from '@tabler/icons-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function ConnectButton() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  const [accountEthAddress, setAccountEthAddress] = useState('');
  const [accountEthBalance, setAccountEthBalance] = useState('');
  const [etherscanUrl, setEtherscanUrl] = useState('');

  const visitWalletWebsite = async () => {
    window.open('https://metamask.io', '_blank');
  };

  const connectWallet = async () => {
    console.log('Attempting to connect wallet..');
    // const metaMaskUnlocked = (await window.ethereum._metamask.isUnlocked());
    // console.log("Metamask unlocked? " + metaMaskUnlocked);

    // if (window.ethereum.isMetaMask && !metaMaskUnlocked) {
    //   console.log("Metamask lockiepooed.");
    //   showErrorMessage("Please unlock MetaMask.");
    // } else {
    try {
      const account = await connectAccount();
      const accountDetails = await loadAccountDetails(account);
      updateAccountDetails(accountDetails);
    } catch (err: any) {
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
      // const connected = await hasAccount();
      // if (!connected) {
      //   console.log('Not connected..');
      //   updateAccountDetails(null);
      //   return;
      // }
      const cachedDetails = fetchCachedAccountDetails();
      if (cachedDetails !== undefined && cachedDetails !== null) {
        console.log('Got cached details: ' + JSON.stringify(cachedDetails));
        updateAccountDetails(cachedDetails);
        return;
      }

      const account = await fetchCurrentAccount();
      if (account) {
        const accountDetails = await loadAccountDetails(account);
        updateAccountDetails(accountDetails);
      } else {
        updateAccountDetails(null);
      }
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

  const updateAccountDetails = (accountDetails: any) => {
    console.log('Updating account details: ' + JSON.stringify(accountDetails));
    const hasWallet = window.ethereum !== undefined && window.ethereum !== null;
    setIsLoading(false);
    if (accountDetails != null && hasWallet) {
      console.log('Has details and wallet.');
      setIsWalletInstalled(true);
      setIsWalletConnected(true);
      setAccountEthAddress(accountDetails.shortenedAddress);
      setAccountEthBalance(accountDetails.displayBalance.toString());
      setEtherscanUrl(AnglezCurrentNetworkExplorerUrl + 'address/' + accountDetails.fullAddress);

      console.log('Address: ', accountDetails.shortenedAddress);
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
    console.log('Running ConnectButton useEffect..');
    if (window.ethereum != null) {
      window.ethereum.on('accountsChanged', (accounts: any) => {
        console.log('Accounts changed.');
        clearCachedAccountDetails();
        disconnectWallet();
        // Is this causing multiple reloads?!
        // fetchDetails();
      });

      // Is this causing multiple reloads?!
      window.ethereum.on('chainChanged', (chainId: any) => {
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

    fetchDetails();
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
            <Button onClick={visitWalletWebsite}>Install wallet</Button>
          ) : (
            <div>
              {!isWalletConnected ? (
                <Button onClick={connectWallet}>Connect wallet</Button>
              ) : (
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

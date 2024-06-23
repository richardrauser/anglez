import { ethers, JsonRpcProvider } from 'ethers';
import Anglez from '../contract/Anglez.json';
import * as Errors from './ErrorMessages';
import {
  AnglezContractAddress,
  AnglezCurrentNetworkID,
  AnglezCurrentNetworkName,
  AnglezCurrentNetworkCurrencySymbol,
  AnglezCurrentNetworkRpcUrl,
  AnglezCurrentNetworkExplorerUrl,
} from './Constants';
import { showInfoMessage } from './UIUtils';
import { formatEther } from 'ethers';
import { TokenParams } from './anglez';

export interface AccountDetails {
  shortenedAddress: string;
  fullAddress: string;
  weiBalance: string;
  displayBalance: string;
}

// class AccountDetails {
//   constructor(shortenedAddress, fullAddress, weiBalance, displayBalance) {
//     this.shortenedAddress = shortenedAddress;
//     this.fullAddress = fullAddress;
//     this.weiBalance = weiBalance;
//     this.displayBalance = displayBalance; // ETH
//   }
// }

const AccountDetailsKey = 'DS_ACCOUNT_DETAILS_KEY';

async function getJsonRpcProvider() {
  // return new ethers.JsonRpcProvider("https://api.mycryptoapi.comx/eth");
  let provider;

  if (AnglezCurrentNetworkName == 'localhost') {
    // console.log("Returning JsonRpcProvider..");
    // this will be readonly as it is not connected to a browser's ethereum wallet.
    // TODO: specify URLS from infura, etc to get this working: https://docs.ethers.org/v6/getting-started/#starting-connecting
    // provider = new ethers.JsonRpcProvider();

    console.log('returning default provider pointing locally');
    // provider = ethers.getDefaultProvider("http://localhost:8545");
    // provider = ethers.getDefaultProvider("http://127.0.0.1:8545/");
    provider = new ethers.JsonRpcProvider(); // will point locally
    console.log('got default provider.');
  } else {
    provider = new ethers.JsonRpcProvider(); // getAlchemyProvider();
    console.log('TODO: handle this!!!');
  }

  return provider;
}

async function getProvider() {
  console.log('Returning default provider..');

  console.log('Current network: ' + AnglezCurrentNetworkName);

  let provider;

  if (typeof window === 'undefined') {
    console.log('No window.. not in browser.');
    return getJsonRpcProvider();
  } else {
    console.log('Have window.. in browser.');
    if (!window.ethereum) {
      // this is fine for read only contracts, but not read write (as user needs wallet)
      console.log('No Ethereum wallet found. Getting JSON RPC provider..');
      return getJsonRpcProvider();
      // throw Error(Errors.DS_NO_ETH_WALLET);
    }
    console.log('Window.ethereum exists. Providers: ' + window.ethereum.providers);

    // if (window.ethereum.providers) {
    //   console.log("Window.ethereum.providers exists. Let's see what's in there..");
    //   // for (let i = 0; i < window.ethereum.providers.length; i++) {
    //   //   console.log('Provider ' + i + ': ' + window.ethereum.providers[i].chainId);
    //   // }
    //   const metamaskProviders = window.ethereum.providers.filter((provider) => {
    //     provider.isMetaMask === true;
    //   });

    //   provider = metamaskProviders[0];
    // }

    console.log('Got window.ethereum.. returning browser provider..');
    provider = new ethers.BrowserProvider(window.ethereum);
  }

  console.log('Got provider.. now checking network.');

  // Check we are on expected network
  // const network = await provider.getNetwork();

  // console.log('Desired chain ID: ' + AnglezCurrentNetworkID);
  // console.log('Current chain ID: ' + network.chainId);

  // if (network.chainId != AnglezCurrentNetworkID) {
  //   console.log('Wrong network!');
  //   throw Error(Errors.DS_WRONG_ETH_NETWORK);
  // }

  // switchToCurrentNetwork();
  console.log('Returning provider..');
  return provider;
}

export async function switchToCurrentNetwork() {
  // will attempt to add current network, behaviour is to switch if already present in MetaMask
  console.log('Switching to ' + AnglezCurrentNetworkName + '...');

  const provider = new ethers.BrowserProvider(window.ethereum);
  // const network = await provider.getNetwork();

  // if (network.chainId == AnglezCurrentNetworkID) {
  //   showInfoMessage("You're already on the " + AnglezCurrentNetworkName + ' network. Yay.');
  //   return;
  // }

  const data = [
    {
      chainId: '0x' + AnglezCurrentNetworkID.toString(16),
      // chainName: AnglezCurrentNetworkName,
      // nativeCurrency: {
      //   name: AnglezCurrentNetworkCurrencySymbol,
      //   symbol: AnglezCurrentNetworkCurrencySymbol,
      //   decimals: 18,
      // },
      // rpcUrls: [AnglezCurrentNetworkRpcUrl],
      // blockExplorerUrls: [AnglezCurrentNetworkExplorerUrl],
    },
  ];

  console.log(data);

  const tx = await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: data });
  if (tx) {
    console.log(tx);
  }
  // const tx = await window.ethereum.request({ method: 'wallet_addEthereumChain', params: data });
  // if (tx) {
  //   console.log(tx);
  // }
}

export async function getReadOnlyContract() {
  console.log('Getting read-only contract..');
  const provider = await getProvider();

  console.log('CONTRACT ADDRESS: ' + AnglezContractAddress);

  return new ethers.Contract(AnglezContractAddress, Anglez.abi, provider);
}

export async function getReadWriteContract() {
  console.log('Getting read/write contract..');

  if (!window.ethereum) {
    console.log('No Ethereum wallet found. Throwing error NO_ETH_WALLET');
    throw Error(Errors.AGLZ_NO_ETH_WALLET);
  }

  const provider = await getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(AnglezContractAddress, Anglez.abi, signer);
}

export async function isAccountConnected() {
  const provider = await getProvider();
  const [account] = await provider.listAccounts();

  console.log('isAccountConnected, account: ' + account);
  if (account === undefined || account === null) {
    return false;
  }
  return true;
}

export async function hasAccount() {
  console.log('Checking if user has account..');
  if (!window.ethereum) {
    console.log('No Ethereum wallet found.');
    return false;
  }

  const provider = await getProvider();
  const hasAccount = provider.getSigner() !== null;
  console.log('Has account: ' + hasAccount);
  return hasAccount;
}

export async function fetchAccount() {
  console.log('Fetching account..');
  const provider = await getProvider();
  // var [account] = await provider.listAccounts();
  var account = await provider.getSigner(); // TODO: really what you want?

  console.log('GOT ACCOUNT: ' + account);
  if (account === undefined || account === null) {
    [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    console.log('ACCOUNT FROM ETH_REQUESTACCOUNTS: ' + account);
  }

  if (account === undefined || account === null) {
    throw Error(Errors.AGLZ_NO_ETH_ACCOUNT);
  }
  return account;
}
export function shortenAddress(fullAddress: string) {
  var shortenedAddress = fullAddress;
  if (shortenedAddress.length > 10) {
    shortenedAddress = shortenedAddress.substring(0, 6) + '...' + shortenedAddress.slice(-4);
  }
  return shortenedAddress;
}

export async function fetchAccountDetails() {
  console.log('Fetching account details from blockchain..');

  // const account = await fetchAccount();
  // const provider = await getProvider();

  // const fullAddress = account.address;
  // var shortenedAddress = shortenAddress(fullAddress);
  // console.log('Getting details of account: ' + fullAddress);

  // const weiBalance = await provider.getBalance(account);
  // const displayBalance = Number(formatEther(weiBalance)).toFixed(4).toString();

  // var accountDetails: AccountDetails = {
  //   shortenedAddress,
  //   fullAddress,
  //   weiBalance: weiBalance.toString(),
  //   displayBalance,
  // };

  // localStorage.setItem(AccountDetailsKey, JSON.stringify(accountDetails));

  // fetchCachedAccountDetails();

  // return accountDetails;
}

export function fetchCachedAccountDetails() {
  const accountDetailsJson = localStorage.getItem(AccountDetailsKey);
  if (accountDetailsJson === null) {
    console.log('details are null.');
    return null;
  }
  const accountDetails = JSON.parse(accountDetailsJson);

  if (accountDetails === null) {
    console.log('details are null.');
    return null;
  }

  if (
    accountDetails.shortenedAddress === undefined ||
    accountDetails.fullAddress === undefined ||
    accountDetails.weiBalance === undefined ||
    accountDetails.displayBalance === undefined
  ) {
    console.log('some element of details is null. ' + accountDetails);
    console.log('shortened address: ' + accountDetails.shortenedAddress);
    console.log('full address: ' + accountDetails.fullAddress);
    console.log('wei balance: ' + accountDetails.weiBalance);
    console.log('display balance ' + accountDetails.displayBalance);
    clearCachedAccountDetails();
    return null;
  } else {
    return accountDetails;
  }
}

export function clearCachedAccountDetails() {
  localStorage.removeItem(AccountDetailsKey);
}

// export async function isCurrentAccountOwner() {
//   console.log("Checking current account owner status..");

//   const connected = await isAccountConnected();
//   if (!connected) {
//     console.log("NOT CONNECTED.");
//     return false;
//   }

//   const account = await fetchAccount();

//   const ethAddress = account.toString().toLowerCase();
//   const contract = await getReadOnlyContract();
//   const ownerAddress = (await contract.owner()).toString().toLowerCase();
//   console.log("connected account address: " + ethAddress);
//   console.log("owner address: " + ownerAddress);

//   return (ethAddress === ownerAddress);
// }

export async function fetchRandomMintPrice() {
  const contract = await getReadOnlyContract();
  const mintPrice = await contract.getRandomMintPrice();

  return formatEther(mintPrice);
}

export async function fetchCustomMintPrice() {
  const contract = await getReadOnlyContract();
  const mintPrice = await contract.getCustomMintPrice();

  return formatEther(mintPrice);
}

export async function mintRandomAnglez(randomSeed: number) {
  const contract = await getReadWriteContract();

  const isSeedUsed = await contract.isSeedMinted(randomSeed);
  if (isSeedUsed) {
    console.log('Seed already used!');
    throw Error(Errors.AGLZ_SEED_USED);
  }

  const mintTx = await contract.mintRandom(randomSeed);
  const receipt = await mintTx.wait();

  return receipt;
}

export async function mintCustomAnglez(tokenParams: TokenParams) {
  console.log('Minting custom Anglez with params  ' + tokenParams);

  const contract = await getReadWriteContract();
  //     function mintCustom(uint24 seed, uint8 shapeCount, uint8 tintRed, uint8 tintGreen, uint8 tintBlue, uint8 tintAlpha, bool isCyclic) public payable {

  const isSeedUsed = await contract.isSeedMinted(tokenParams.seed);
  if (isSeedUsed) {
    console.log('Seed already used!');
    throw Error(Errors.AGLZ_SEED_USED);
  }

  const alpha = Math.round(tokenParams.tintColour.a * 255);
  // console.log('Alpha255 blockchainAPI: ' + alpha);

  const mintPrice = await contract.getCustomMintPrice();
  console.log('Mint price: ' + mintPrice.toString());

  const overrides = {
    // gasLimit: 200000,
    value: mintPrice,
  };

  const mintTx = await contract.mintCustom(
    tokenParams.seed,
    tokenParams.shapeCount,
    tokenParams.tintColour.r,
    tokenParams.tintColour.g,
    tokenParams.tintColour.b,
    alpha,
    tokenParams.isCyclic,
    tokenParams.isChaotic,
    overrides
  );

  console.log('Mint tx: ' + mintTx.hash);
  const receipt = await mintTx.wait();

  return receipt;
}

export async function fetchTotalSupply() {
  const contract = await getReadOnlyContract();
  console.log('Got contract.');
  const tokenCount = await contract.totalSupply();
  console.log('Token count: ' + tokenCount);

  return tokenCount;
}

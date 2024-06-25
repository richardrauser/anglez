import { ethers, formatEther, JsonRpcProvider, JsonRpcSigner } from 'ethers';
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
import { TokenParams } from './anglez';

export interface AccountDetails {
  shortenedAddress: string;
  fullAddress: string;
  weiBalance: string;
  displayBalance: string;
}

const AccountDetailsKey = 'NGLZ_ACCOUNT_DETAILS_KEY';

// async function getJsonRpcProvider() {
//   // return new ethers.JsonRpcProvider("https://api.mycryptoapi.comx/eth");
//   let provider;

//   if (AnglezCurrentNetworkName == 'localhost') {
//     // console.log("Returning JsonRpcProvider..");
//     // this will be readonly as it is not connected to a browser's ethereum wallet.
//     // TODO: specify URLS from infura, etc to get this working: https://docs.ethers.org/v6/getting-started/#starting-connecting
//     // provider = new ethers.JsonRpcProvider();

//     console.log('returning default provider pointing locally');
//     // provider = ethers.getDefaultProvider("http://localhost:8545");
//     // provider = ethers.getDefaultProvider("http://127.0.0.1:8545/");
//     provider = new ethers.JsonRpcProvider(); // will point locally
//     console.log('got default provider.');
//   } else {
//     provider = new ethers.JsonRpcProvider(); // getAlchemyProvider();
//     console.log('TODO: handle this!!!');
//   }

//   return provider;
// }

async function getProvider() {
  console.log('Returning default provider..');

  console.log('Current network: ' + AnglezCurrentNetworkName);

  let provider;

  if (typeof window === 'undefined') {
    console.log('No window.. not in browser.');
    throw Error('Not in browser.');
  } else {
    console.log('Have window.. in browser.');
    if (!window.ethereum) {
      throw Error(Errors.NGLZ_NO_ETH_WALLET);
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
    if (window.ethereum.providers && window.ethereum.providers.length > 0) {
      provider = new ethers.BrowserProvider(window.ethereum.providers[0]);
    } else {
      provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  console.log('Got provider.. now checking network.');

  // Check we are on expected network
  const network = await provider.getNetwork();

  console.log('Desired chain ID: ' + AnglezCurrentNetworkID);
  console.log('Current chain ID: ' + network.chainId);

  if (network.chainId != AnglezCurrentNetworkID) {
    console.log('Wrong network!');
    throw Error(Errors.NGLZ_WRONG_ETH_NETWORK);
  }

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
    throw Error(Errors.NGLZ_NO_ETH_WALLET);
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

export async function fetchCurrentAccount() {
  console.log('Fetching account..');
  const provider = await getProvider();
  var accounts = await provider.listAccounts();
  var account = accounts[0];
  // var account = await provider.getSigner(); // TODO: really what you want?

  if (account) {
    console.log('GOT ACCOUNT: ' + account);
  } else {
    console.log('NO ACCOUNT CURRENTLY CONNECTED.');
  }

  return account;
}

export async function connectAccount() {
  const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

  console.log('ACCOUNT FROM ETH_REQUESTACCOUNTS: ' + account);

  if (account === undefined || account === null) {
    throw Error(Errors.NGLZ_NO_ETH_ACCOUNT);
  }

  return account;
}

export function shortenAddress(fullAddress: string) {
  console.log('Shortening address: ' + fullAddress);
  var shortenedAddress = fullAddress;
  if (shortenedAddress.length > 10) {
    shortenedAddress = shortenedAddress.substring(0, 6) + '...' + shortenedAddress.slice(-4);
  }
  return shortenedAddress;
}

export async function loadAccountDetails(account: JsonRpcSigner) {
  console.log('Fetching account details from blockchain..');
  console.log('Account: ' + account);

  const provider = await getProvider();

  const fullAddress = account.toString();
  var shortenedAddress = shortenAddress(fullAddress);
  console.log('Getting details of account: ' + fullAddress);

  const weiBalance = await provider.getBalance(account);
  const displayBalance = Number(formatEther(weiBalance)).toFixed(4).toString();

  var accountDetails: AccountDetails = {
    shortenedAddress,
    fullAddress,
    weiBalance: weiBalance.toString(),
    displayBalance,
  };

  localStorage.setItem(AccountDetailsKey, JSON.stringify(accountDetails));

  // fetchCachedAccountDetails();

  return accountDetails;
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

export async function mintRandomAnglez(randomSeed: number) {
  const contract = await getReadWriteContract();

  const isSeedUsed = await contract.isSeedMinted(randomSeed);
  if (isSeedUsed) {
    console.log('Seed already used!');
    throw Error(Errors.NGLZ_SEED_USED);
  }

  const mintPrice = await contract.getRandomMintPrice();
  console.log('Mint price: ' + mintPrice.toString());

  const overrides = {
    // gasLimit: 200000,
    value: mintPrice,
  };

  const mintTx = await contract.mintRandom(randomSeed, overrides);
  const receipt = await mintTx.wait();

  return receipt;
}

export async function mintCustomAnglez(tokenParams: TokenParams) {
  console.log('Minting custom Anglez with params  ' + JSON.stringify(tokenParams));

  const contract = await getReadWriteContract();
  //     function mintCustom(uint24 seed, uint8 shapeCount, uint8 tintRed, uint8 tintGreen, uint8 tintBlue, uint8 tintAlpha, bool isCyclic) public payable {

  const isSeedUsed = await contract.isSeedMinted(tokenParams.seed);
  if (isSeedUsed) {
    console.log('Seed already used!');
    throw Error(Errors.NGLZ_SEED_USED);
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

export async function fetchYourTokens() {
  const contract = await getReadOnlyContract();

  const address = await fetchCurrentAccount();

  if (address === undefined || !address) {
    return null;
  }

  const tokens = await contract.tokensOfOwner(address);
  console.log('fetchYourTokens- tokens: ' + tokens);

  return tokens.toArray().reverse();
}

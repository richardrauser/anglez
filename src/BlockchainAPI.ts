import { ethers, JsonRpcProvider } from 'ethers';
import Planes from '../contract/Planes.json';
import * as Errors from './ErrorMessages';
import {
  CosmicWorldsContractAddress,
  CosmicWorldsCurrentNetworkID,
  CosmicWorldsCurrentNetworkName,
  CosmicWorldsCurrentNetworkCurrencySymbol,
  CosmicWorldsCurrentNetworkRpcUrl,
  CosmicWorldsCurrentNetworkExplorerUrl,
} from './Constants';
import { showInfoMessage } from './UIUtils';
import { formatEther } from 'ethers';

const AccountDetailsKey = 'DS_ACCOUNT_DETAILS_KEY';

async function getProvider() {
  console.log('Returning default provider..');

  console.log('Current network: ' + CosmicWorldsCurrentNetworkName);

  let provider;

  if (typeof window === 'undefined') {
    console.log('No window.. not in browser.');
    // return new ethers.JsonRpcProvider("https://api.mycryptoapi.comx/eth");
    if (CosmicWorldsCurrentNetworkName == 'localhost') {
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
      console.log('Returning Alchemy provider');
      provider = new ethers.AlchemyProvider(
        CosmicWorldsCurrentNetworkID,
        process.env.ALCHEMY_API_KEY
      );
    }
  } else {
    console.log('Have window.. in browser.');
    if (!window.ethereum) {
      console.log('No Ethereum wallet found. Throwing error NO_ETH_WALLET');
      throw Error(Errors.DS_NO_ETH_WALLET);
    }
    provider = new ethers.BrowserProvider(window.ethereum);
  }

  console.log('Got provider.. now checking network.');

  // Check we are on expected network
  const network = await provider.getNetwork();

  console.log('Desired chain ID: ' + CosmicWorldsCurrentNetworkID);
  console.log('Current chain ID: ' + network.chainId);

  if (network.chainId != CosmicWorldsCurrentNetworkID) {
    console.log('Wrong network!');
    throw Error(Errors.DS_WRONG_ETH_NETWORK);
  }

  console.log('Returning provider..');
  return provider;
}

export async function switchToCurrentNetwork() {
  // will attempt to add current network, behaviour is to switch if already present in MetaMask
  console.log('Switching to ' + CosmicWorldsCurrentNetworkName + '...');

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId == CosmicWorldsCurrentNetworkID) {
    showInfoMessage("You're already on the " + CosmicWorldsCurrentNetworkName + ' network. Yay.');
    return;
  }

  const data = [
    {
      chainId: '0x' + CosmicWorldsCurrentNetworkID.toString(16),
      chainName: CosmicWorldsCurrentNetworkName,
      nativeCurrency: {
        name: CosmicWorldsCurrentNetworkCurrencySymbol,
        symbol: CosmicWorldsCurrentNetworkCurrencySymbol,
        decimals: 18,
      },
      rpcUrls: [CosmicWorldsCurrentNetworkRpcUrl],
      blockExplorerUrls: [CosmicWorldsCurrentNetworkExplorerUrl],
    },
  ];

  console.log(data);

  const tx = await window.ethereum.request({ method: 'wallet_addEthereumChain', params: data });
  if (tx) {
    console.log(tx);
  }
}

export async function getReadOnlyContract() {
  console.log('Getting read-only contract..');
  const provider = await getProvider();

  console.log('CONTRACT ADDRESS: ' + CosmicWorldsContractAddress);

  return new ethers.Contract(CosmicWorldsContractAddress, Planes.abi, provider);
}

export async function getReadWriteContract() {
  console.log('Getting read/write contract..');
  const provider = await getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(CosmicWorldsContractAddress, Planes.abi, signer);
}

export async function mintRandom(seed) {
  console.log('Minting Cosmic World with random seed..');
  const contract = await getReadWriteContract();
  const overrides = {
    gasLimit: 140000,
  };
  const transaction = await contract.mintRandom(seed, overrides);
  console.log('Tx hash: ' + transaction.hash);
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
  const hasAccount = provider.hasSigner();
  console.log('Has account: ' + hasAccount);
  return hasAccount;
}

export async function fetchAccount() {
  console.log('Fetching account..');
  const provider = await getProvider();
  // var [account] = await provider.listAccounts();
  var account = await provider.account;

  console.log('GOT ACCOUNT: ' + account);
  if (account === undefined || account === null) {
    [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    console.log('ACCOUNT FROM ETH_REQUESTACCOUNTS: ' + account);
  }

  if (account === undefined || account === null) {
    throw Error(Errors.DS_NO_ETH_ACCOUNT);
  }
  return account;
}

export async function fetchAccountDetails() {
  console.log('Fetching account details from blockchain..');

  const account = await fetchAccount();
  const provider = await getProvider();

  const fullAddress = account.toString();
  var shortenedAddress = fullAddress;
  console.log('Getting details of account: ' + fullAddress);

  if (shortenedAddress.length > 10) {
    shortenedAddress = shortenedAddress.substring(0, 6) + '...' + shortenedAddress.slice(-4);
  }

  const weiBalance = await provider.getBalance(account);
  const displayBalance = Number(formatEther(weiBalance)).toFixed(4);

  var accountDetails = new AccountDetails(
    shortenedAddress,
    fullAddress,
    weiBalance.toString(),
    displayBalance.toString()
  );

  localStorage.setItem(AccountDetailsKey, JSON.stringify(accountDetails));

  fetchCachedAccountDetails();

  return accountDetails;
}

export function fetchCachedAccountDetails() {
  const accountDetails = JSON.parse(localStorage.getItem(AccountDetailsKey));

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

class AccountDetails {
  constructor(shortenedAddress, fullAddress, weiBalance, displayBalance) {
    this.shortenedAddress = shortenedAddress;
    this.fullAddress = fullAddress;
    this.weiBalance = weiBalance;
    this.displayBalance = displayBalance; // ETH
  }
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

export async function mintTenCosmicWorlds() {
  console.log('Minting 10 Cosmic Worlds..');

  const contract = await getReadWriteContract();

  const overrides = {
    gasLimit: 580000,
  };

  var seeds = [];

  for (let i = 0; i < 10; i++) {
    console.log(`Generating seed ${i}...`);
    const seed = Math.trunc(Math.random() * 5_000_000);
    seeds.push(seed);
  }

  const transaction = await contract.mintMany(seeds, overrides);
  console.log('Tx hash: ' + transaction.hash);
}

export async function mintCosmicWorld(randomSeed) {
  console.log('Minting Cosmic World with seed: ' + randomSeed);

  const contract = await getReadWriteContract();

  const overrides = {
    gasLimit: 140000,
  };

  console.log('!!!!!');

  const transaction = await contract.mint(randomSeed, overrides);
  console.log('Tx hash: ' + transaction.hash);
}

export async function fetchTokenDetails(tokenId) {
  console.log('Getting metadata for token ID: ' + tokenId);

  if (tokenId === undefined || tokenId === null) {
    console.log('No token ID!');
    return;
  }
  const contract = await getReadOnlyContract();
  const metadataDataUri = await contract.tokenURI(tokenId);
  var metadataJson = '';

  if (metadataDataUri.startsWith('data:text/plain,')) {
    metadataJson = metadataDataUri.replace('data:text/plain,', '');
  } else if (metadataDataUri.startsWith('data:application/json,')) {
    metadataJson = metadataDataUri.replace('data:application/json,', '');
  } else if (metadataDataUri.startsWith('data:application/json;base64,')) {
    const metadataJsonBase64Encoded = metadataDataUri.replace('data:application/json;base64,', '');
    let buffer = new Buffer(metadataJsonBase64Encoded, 'base64');

    metadataJson = buffer.toString('utf-8');
  }

  console.log('METADATA: ' + metadataJson);

  const metadataObject = JSON.parse(metadataJson);

  const svg = metadataObject.image.replace('data:image/svg+xml,', '');
  const encodedSvg = encodeURIComponent(svg);
  const svgDataUri = `data:image/svg+xml,${encodedSvg}`;

  // console.log("SVG: " + svg);

  let seed = metadataObject.attributes.filter((attribute) => attribute.trait_type == 'seed')[0]
    .value;
  // let planetCount = metadataObject.attributes.filter(
  //   (attribute) => attribute.trait_type == 'planets'
  // )[0].value;
  // let starDensity = metadataObject.attributes.filter(
  //   (attribute) => attribute.trait_type == 'stars'
  // )[0].value;
  // let mountainRoughness = metadataObject.attributes.filter(
  //   (attribute) => attribute.trait_type == 'mountains'
  // )[0].value;
  // let waterChoppiness = metadataObject.attributes.filter(
  //   (attribute) => attribute.trait_type == 'water'
  // )[0].value;
  // let cloudType = metadataObject.attributes.filter(
  //   (attribute) => attribute.trait_type == 'clouds'
  // )[0].value;

  return {
    svg,
    svgDataUri,
    seed,
    // planetCount,
    // starDensity,
    // mountainRoughness,
    // waterChoppiness,
    // cloudType,
  };
}

export async function fetchTotalSupply() {
  const contract = await getReadOnlyContract();
  console.log('Got contract.');
  const tokenCount = await contract.totalSupply();
  console.log('Token count: ' + tokenCount);

  return tokenCount;
}

export async function fetchRecentTokenIds() {
  const contract = await getReadOnlyContract();

  const contractAddress = await contract.getAddress();
  console.log('fetchRecentTokens: Contract address: ' + contractAddress);

  const tokenCount = await contract.totalSupply();
  console.log('Token count: ' + tokenCount);

  const maxToDisplay = 12;

  var tokens = [];

  // because tokenCount is a BigInt
  const tokenCountInt = Number(tokenCount);
  for (var i = tokenCountInt - 1; i >= 0 && i >= tokenCountInt - maxToDisplay; i--) {
    console.log(i);
    // const tokenId = await contract.tokenByIndex(i);
    tokens.push(i);
  }

  return tokens;
}

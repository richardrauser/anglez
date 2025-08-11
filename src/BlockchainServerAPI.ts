'use server';

import { ethers } from 'ethers';
import { AnglezContractAddress, AnglezCurrentNetworkID } from './Constants';
import Anglez from '../contract/Anglez.json';
import { TokenDetails } from './TokenDetails';
import { formatEther } from 'ethers';

export async function getAlchemyProvider() {
  console.log('Returning Alchemy provider');
  // TODO: read key from environment variable
  return new ethers.AlchemyProvider(AnglezCurrentNetworkID, process.env.ALCHEMY_API_KEY);
}

export async function getReadOnlyContract() {
  console.log('Getting read-only contract..');
  const provider = await getAlchemyProvider();

  console.log('CONTRACT ADDRESS: ' + AnglezContractAddress);

  return new ethers.Contract(AnglezContractAddress, Anglez.abi, provider);
}

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

export async function fetchRecentTokenIds() {
  const contract = await getReadOnlyContract();

  const contractAddress = await contract.getAddress();
  console.log('fetchRecentTokens: Contract address: ' + contractAddress);

  const tokenCount = await contract.totalSupply();
  console.log('Token count: ' + tokenCount);

  const maxToDisplay = 10;

  var tokens: number[] = [];

  // because tokenCount is a BigInt
  const tokenCountInt = Number(tokenCount);
  for (var i = tokenCountInt - 1; i >= 0 && i >= tokenCountInt - maxToDisplay; i--) {
    console.log(i);
    // const tokenId = await contract.tokenByIndex(i);
    tokens.push(i);
  }

  return tokens;
}

export async function fetchYourTokens(address: string) {
  const contract = await getReadOnlyContract();

  // const address = await fetchCurrentAccount();

  if (address === undefined || !address) {
    return null;
  }

  const tokens = await contract.tokensOfOwner(address);
  console.log('fetchYourTokens- tokens: ' + tokens);

  return tokens.toArray().reverse();
}

export async function fetchTokenDetails(tokenId: number) {
  console.log('Getting metadata for token ID: ' + tokenId);

  if (tokenId === undefined || tokenId === null) {
    console.log('No token ID!');
    return null;
  }
  const contract = await getReadOnlyContract();
  const owner = await contract.ownerOf(tokenId);
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

  interface Attribute {
    trait_type: string;
    value: string;
  }

  let seed = metadataObject.attributes.filter(
    (attribute: Attribute) => attribute.trait_type == 'seed'
  )[0].value;

  let shapeCount = metadataObject.attributes.filter(
    (attribute: Attribute) => attribute.trait_type == 'shapes'
  )[0].value;
  let tintColor = metadataObject.attributes.filter(
    (attribute: Attribute) => attribute.trait_type == 'tint color'
  )[0].value;
  // let tintBlue = metadataObject.attributes.filter(
  //   (attribute) => attribute.trait_type == 'tintBlue'
  // )[0].value;
  // let tintGreen = metadataObject.attributes.filter(
  //   (attribute) => attribute.trait_type == 'tintGreen'
  // )[0].value;
  let tintOpacity = metadataObject.attributes.filter(
    (attribute: Attribute) => attribute.trait_type == 'tint opacity'
  )[0].value;
  // TODO: words from contract instead of true/false!
  let style = metadataObject.attributes.filter(
    (attribute: Attribute) => attribute.trait_type == 'style'
  )[0].value;
  let structure = metadataObject.attributes.filter(
    (attribute: Attribute) => attribute.trait_type == 'structure'
  )[0].value;
  let isCustom = metadataObject.attributes.filter(
    (attribute: Attribute) => attribute.trait_type == 'custom'
  )[0].value;
  // let waterChoppiness = metadataObject.attributes.filter(
  //   (attribute) => attribute.trait_type == 'water'
  // )[0].value;
  // let cloudType = metadataObject.attributes.filter(
  //   (attribute) => attribute.trait_type == 'clouds'
  // )[0].value;

  const tokenDetails: TokenDetails = {
    tokenId,
    owner,
    svg,
    svgDataUri,
    attributes: {
      seed,
      shapeCount,
      tintColor,
      tintOpacity,
      style,
      structure,
      isCustom,
    },
  };

  return tokenDetails;
}

export async function fetchTotalSupply() {
  const contract = await getReadOnlyContract();
  console.log('Got contract.');
  const tokenCount = await contract.totalSupply();
  console.log('Token count: ' + tokenCount);

  return tokenCount;
}

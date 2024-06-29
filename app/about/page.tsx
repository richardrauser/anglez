import { shortenAddress } from '@/src/BlockchainAPI';
import {
  AnglezContractAddress,
  AnglezCurrentNetworkExplorerUrl,
  AnglezCurrentNetworkName,
} from '@/src/Constants';
import { Text } from '@mantine/core';

export default function AboutPage() {
  return (
    <>
      <h1>About</h1>
      <div className="panel">
        <Text>
          anglez is colourful, abstract, on-chain generative NFT art. Each piece is completely
          unique, and can be generated at random or customized.
        </Text>
        <h2>how do I use this?</h2>
        <Text>
          From the Connect Wallet button, select the wallet you wish to use. Coinbase Smart Wallet
          is the easiest option because you won't have to configure anything or even get crypto..
          transaction fees are sponsorred! First, install a crypto wallet like{' '}
          <a href="https://metamask.io">MetaMask</a> or{' '}
          <a href="https://www.coinbase.com/wallet">Coinbase Wallet</a>.
        </Text>
        <Text>
          Next, you need Seploia ETH in order to mint anglez. You can get Sepolia ETH by using a
          Sepolia faucet. <br />
          Try this one: <a href="https://www.sepoliafaucet.io/">
            {' '}
            https://www.sepoliafaucet.io/
          </a>{' '}
          <br />
          Or search google:{' '}
          <a href="https://www.google.com/search?q=Sepolia+faucet">
            https://www.google.com/search?q=sepolia+faucet
          </a>
        </Text>
        <Text>Failing that, contact RR and I'll send you some Sepolia ETH to get you started.</Text>
        <h2>contract</h2>
        <Text>
          The anglez smart contract address on {AnglezCurrentNetworkName} is:{' '}
          <a href={AnglezCurrentNetworkExplorerUrl + 'address/' + AnglezContractAddress}>
            {shortenAddress(AnglezContractAddress)}
          </a>
          . <br />
        </Text>
      </div>
    </>
  );
}

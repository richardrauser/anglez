import { shortenAddress } from '@/src/BlockchainAPI';
import {
  AnglezContractAddress,
  AnglezCurrentNetworkExplorerUrl,
  AnglezCurrentNetworkName,
} from '@/src/Constants';
import { List, Text } from '@mantine/core';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <h1>About</h1>
      <div className="panel">
        <Text>
          anglez is colourful, abstract, on-chain generative NFT art. Each piece is completely
          unique, and can be generated at random or customized.
        </Text>
        <br />
        <Text>
          Although under development for several months, anglez was launched as a sumbmission for
          the Base{' '}
          <a target="_blank" href="https://www.base.org/onchainsummer">
            Onchain Summer Buildathon
          </a>{' '}
          on June 30, 2024!
        </Text>

        <h2>how do I use this?</h2>
        <Text>
          From the Connect Wallet button, select the wallet you wish to use. Coinbase Smart Wallet
          is the easiest option because you won't have to configure anything or buy crypto..
          transaction fees are sponsorred! You can alternatively install a crypto wallet like{' '}
          <a href="https://metamask.io">MetaMask</a> or{' '}
          <a href="https://www.coinbase.com/wallet">Coinbase Wallet</a>, however you will need to
          setup and fund the wallet yourself.
        </Text>
        <br />

        <Text>
          Once that's done, visit the <Link href="/create">create page</Link> and get started
          minting anglez!
        </Text>
        {/* <Text>
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
        </Text> */}
        {/* <Text>Failing that, contact RR and I'll send you some Sepolia ETH to get you started.</Text>  */}
        <h2>contract</h2>
        <Text>
          The anglez smart contract address on {AnglezCurrentNetworkName} is:{' '}
          <a href={AnglezCurrentNetworkExplorerUrl + 'address/' + AnglezContractAddress}>
            {shortenAddress(AnglezContractAddress)}
          </a>
          . <br />
        </Text>
        <h2>what tech is anglez built on?</h2>
        <Text>
          OnchainKit, Coinbase Smart Wallet, Next.js 14, Vercel, Farcaster Frames, Mantine, React.
          ethers.js, hardhat
        </Text>
        {/* <ul>
          <li>OnchainKit</li>
          <li>Coinbase Smart Wallet</li>
        </ul> */}
        <h2>source code</h2>
        <a target="_blank" href="https://github.com/richardrauser/anglez-contract">
          anglez-contract
        </a>
        <br />
        <a target="_blank" href="https://github.com/richardrauser/anglez">
          anglez dApp
        </a>
        <h2>who made this?</h2>
        <Text>
          I did! 😝 It's{` `}
          <a target="_blank" href="https://volstrate.com">
            volstrate
          </a>
          , aka{' '}
          <a target="_blank" href="">
            Richard Rauser
          </a>
          .<br />
        </Text>
        <h2>version</h2>
        <Text>1.0.1</Text>
      </div>
    </>
  );
}

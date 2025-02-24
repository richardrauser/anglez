import { shortenAddress } from '@/src/BlockchainAPI';
import {
  AnglezContractAddress,
  AnglezCurrentNetworkExplorerUrl,
  AnglezCurrentNetworkName,
} from '@/src/Constants';
import { List, Text } from '@mantine/core';
import Link from 'next/link';
import { version } from '@/package.json';

export default function AboutPage() {
  return (
    <>
      <h1>About</h1>
      <div className="panel">
        <h2>what is anglez?</h2>
        <Text>
          anglez is colourful, abstract, on-chain generative NFT art. Each piece is completely
          unique, and can be generated at random or customized. A maximum of 512 pieces can ever be
          minted.
        </Text>
        <br />
        <Text>
          anglez launched on June 30, 2024 after several months of development. It went on to{' '}
          <a
            target="_blank"
            href="https://base.mirror.xyz/p_A3ZxaBUEcpWwTf9_Yg-jnlOro8m8Ypc8LEDnA_ZRk"
          >
            win
          </a>{' '}
          the Base{' '}
          <a
            target="_blank"
            href="https://base.mirror.xyz/p_A3ZxaBUEcpWwTf9_Yg-jnlOro8m8Ypc8LEDnA_ZRk"
          >
            Onchain Summer Buildathon
          </a>{' '}
          in the{' '}
          <a
            target="_blank"
            href="https://base.mirror.xyz/p_A3ZxaBUEcpWwTf9_Yg-jnlOro8m8Ypc8LEDnA_ZRk"
          >
            Creator track
          </a>
          !
        </Text>
        <h2>how do I use anglez?</h2>
        <Text>
          From the Connect Wallet button at top right, select the wallet you wish to use. Coinbase
          Smart Wallet is the easiest option because you won't have to configure anything or buy
          crypto.. transaction fees are sponsorred!
        </Text>
        <br />
        <Text>
          You can alternatively install a crypto wallet like{' '}
          <a href="https://metamask.io">MetaMask</a> or{' '}
          <a href="https://www.coinbase.com/wallet">Coinbase Wallet</a>, however you will need to
          setup and fund the wallet yourself on the{' '}
          <a target="_blank" href="https://www.base.org/">
            Base
          </a>{' '}
          layer 2 chain. You can do this from directly within most wallet apps. Look for a Buy
          button.
        </Text>
        <br />
        <Text>
          Once that's done, visit the <Link href="/create">create page</Link> and get started
          minting anglez!
        </Text>
        <h2>anglez smart contract</h2>
        <Text>
          The anglez smart contract address on{' '}
          <a target="_blank" href="https://www.base.org/">
            Base
          </a>{' '}
          is:{' '}
          <a href={AnglezCurrentNetworkExplorerUrl + 'address/' + AnglezContractAddress}>
            {shortenAddress(AnglezContractAddress)}
          </a>
          . <br />
        </Text>
        <h2>what tech is anglez built on?</h2>
        <Text>
          <a target="_blank" href="https://onchainkit.xyz/">
            OnchainKit
          </a>{' '}
          for interacting with the{' '}
          <a target="_blank" href="https://www.base.org/">
            Base
          </a>{' '}
          layer 2 chain, loading account details, supporting{' '}
          <a target="_blank" href="https://www.farcaster.xyz/">
            Farcaster
          </a>{' '}
          Frames. <br />
          <a target="_blank" href="https://www.coinbase.com/en-gb/wallet/smart-wallet">
            Coinbase Smart Wallet
          </a>{' '}
          for wallet connectivity, account abstraction, bundler and paymaster support.
          <br />
          <a target="_blank" href="https://nextjs.org/">
            Next.js 14
          </a>
          ,{' '}
          <a target="_blank" href="https://mantine.dev/">
            Mantine
          </a>
          ,{' '}
          <a target="_blank" href="https://react.dev/">
            React
          </a>{' '}
          and{' '}
          <a target="_blank" href="https://vercel.com/">
            Vercel
          </a>{' '}
          for the dApp.
          <br />
          <a target="_blank" href="https://www.farcaster.xyz/">
            Farcaster
          </a>{' '}
          Frames to make anglez social. <br />
          <a target="_blank" href="https://www.shield3.com/">
            Shield3
          </a>{' '}
          for verifying transaction safety and preventing abuse.
          <br />
          <a target="_blank" href="https://docs.ethers.org/">
            ethers.js
          </a>{' '}
          and{' '}
          <a target="_blank" href="https://hardhat.org/">
            hardhat
          </a>{' '}
          for development support. <br />
        </Text>
        {/* <ul>
          <li>OnchainKit</li>
          <li>Coinbase Smart Wallet</li>
        </ul> */}
        <h2>source code</h2>
        smart contract:{' '}
        <a target="_blank" href="https://github.com/richardrauser/anglez-contract">
          anglez-contract
        </a>
        <br />
        dApp:{' '}
        <a target="_blank" href="https://github.com/richardrauser/anglez">
          anglez
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
        <Text>v{version}</Text>
      </div>
    </>
  );
}

import { shortenAddress } from '@/src/BlockchainAPI';
import {
  AnglezContractAddress,
  AnglezCurrentNetworkExplorerUrl,
  AnglezCurrentNetworkName,
} from '@/src/Constants';

export default function AboutPage() {
  return (
    <>
      <h1>About</h1>
      <div className="panel">
        <p>
          anglez is colourful, abstract, on-chain generative NFT art. Each piece is completely
          unique, and can be generated at random or customized.
        </p>
        <h2>how do I use this?</h2>
        <p>
          First, install a crypto wallet like <a href="https://metamask.io">MetaMask</a>.
        </p>
        <p>
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
        </p>
        <p>Failing that, contact RR and I'll send you some Sepolia ETH to get you started.</p>
        <h2>contract</h2>
        <p>
          The anglez smart contract address on {AnglezCurrentNetworkName} is:{' '}
          <a href={AnglezCurrentNetworkExplorerUrl + 'address/' + AnglezContractAddress}>
            {shortenAddress(AnglezContractAddress)}
          </a>
          . <br />
        </p>
      </div>
    </>
  );
}

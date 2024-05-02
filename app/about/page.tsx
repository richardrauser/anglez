import { AnglezContractAddress, AnglezCurrentNetworkExplorerUrl } from '@/src/Constants';

export default function AboutPage() {
  return (
    <>
      <h1>About</h1>
      <div className="panel">
        <p>
          anglez is coloful, abstract, on-chain generative NFT art. Each piece is completely unique,
          and can be generated at random or customized.
        </p>
        <p>
          You need Seploia ETH in order to mint anglez. You can get Sepolia ETH by using a Sepolia
          faucet. <br />
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
        <p>
          The anglez contract address is:{' '}
          <a href={AnglezCurrentNetworkExplorerUrl + 'address/' + AnglezContractAddress}>
            ${AnglezContractAddress}
          </a>
          . <br />
        </p>
      </div>
    </>
  );
}

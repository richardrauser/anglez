const CosmicWorldsLocalhostNetwork = 'localhost';
const CosmicWorldsSepoliaNetwork = 'sepolia';
const CosmicWorldsGoerliNetwork = 'goerli';
const CosmicWorldMainnetNetwork = 'mainnet';

// Change this to control which environment you're pointing at.
const currentNetwork = CosmicWorldsLocalhostNetwork;
// const currentNetwork = CosmicWorldsGoerliNetwork;
// const currentNetwork = CosmicWorldsSepoliaNetwork;
// const currentNetwork = CosmicWorldMainnetNetwork;

const CosmicWorldsCurrentNetworkIDKey = 'CosmicWorldsCurrentNetworkIDKey';
const CosmicWorldsCurrentNetworkNameKey = 'CosmicWorldsCurrentNetworkNameKey';
const CosmicWorldsCurrentNetworkCurrencySymbolKey = 'CosmicWorldsCurrentNetworkCurrencySymbolKey';
const CosmicWorldsCurrentNetworkRpcUrlKey = 'CosmicWorldsCurrentNetworkRpcUrlKey';
const CosmicWorldsCurrentNetworkExplorerUrlKey = 'CosmicWorldsCurrentNetworkExplorerUrlKey';
const CosmicWorldsContractAddressKey = 'CosmicWorldsContractAddressKey';

const networkConfig = networkConfigFor(currentNetwork);
const CosmicWorldsCurrentNetworkID = networkConfig[CosmicWorldsCurrentNetworkIDKey];
const CosmicWorldsCurrentNetworkName = networkConfig[CosmicWorldsCurrentNetworkNameKey];
const CosmicWorldsCurrentNetworkCurrencySymbol =
  networkConfig[CosmicWorldsCurrentNetworkCurrencySymbolKey];
const CosmicWorldsCurrentNetworkRpcUrl = networkConfig[CosmicWorldsCurrentNetworkRpcUrlKey];
const CosmicWorldsCurrentNetworkExplorerUrl =
  networkConfig[CosmicWorldsCurrentNetworkExplorerUrlKey];
const CosmicWorldsContractAddress = networkConfig[CosmicWorldsContractAddressKey];

function networkConfigFor(currentNetwork) {
  if (currentNetwork === CosmicWorldsLocalhostNetwork) {
    return {
      CosmicWorldsCurrentNetworkIDKey: 1337,
      CosmicWorldsCurrentNetworkNameKey: 'localhost',
      CosmicWorldsCurrentNetworkCurrencySymbolKey: 'ETH',
      CosmicWorldsCurrentNetworkRpcUrlKey: 'http://localhost:8545',
      CosmicWorldsCurrentNetworkExplorerUrlKey: 'https://www.superbad.com/',
      CosmicWorldsContractAddressKey: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    };
  } else if (currentNetwork === CosmicWorldsGoerliNetwork) {
    return {
      CosmicWorldsCurrentNetworkIDKey: 5,
      CosmicWorldsCurrentNetworkNameKey: 'Goerli',
      CosmicWorldsCurrentNetworkCurrencySymbolKey: 'GoerliETH',
      // TODO: RPC URL
      CosmicWorldsCurrentNetworkRpcUrlKey: 'https://goerli.infura.io',
      CosmicWorldsCurrentNetworkExplorerUrlKey: 'https://goerli.etherscan.io/',
      CosmicWorldsContractAddressKey: '',
    };
  } else if (currentNetwork === CosmicWorldsSepoliaNetwork) {
    return {
      CosmicWorldsCurrentNetworkIDKey: 11155111,
      CosmicWorldsCurrentNetworkNameKey: 'Sepolia',
      CosmicWorldsCurrentNetworkCurrencySymbolKey: 'SepoliaETH',
      // TODO: RPC URL
      CosmicWorldsCurrentNetworkRpcUrlKey: 'https://sepolia.infura.io',
      CosmicWorldsCurrentNetworkExplorerUrlKey: 'https://sepolia.etherscan.io/',
      CosmicWorldsContractAddressKey: '0xFc0d97b66F3A1D9B97d6414c7b3d9431714C7B98',
    };
  } else if (currentNetwork === CosmicWorldMainnetNetwork) {
    return {
      CosmicWorldsCurrentNetworkIDKey: 1,
      CosmicWorldsCurrentNetworkNameKey: 'Ethereum Mainnet',
      CosmicWorldsCurrentNetworkCurrencySymbolKey: 'ETH',
      // TODO: RPC URL
      CosmicWorldsCurrentNetworkRpcUrlKey: 'https://mainnet.infura.io/v3/',
      CosmicWorldsCurrentNetworkExplorerUrlKey: 'https://www.etherscan.io/',
      CosmicWorldsContractAddressKey: '0xFc0d97b66F3A1D9B97d6414c7b3d9431714C7B98',
    };
  }
}

export {
  CosmicWorldsCurrentNetworkID,
  CosmicWorldsCurrentNetworkName,
  CosmicWorldsCurrentNetworkCurrencySymbol,
  CosmicWorldsCurrentNetworkRpcUrl,
  CosmicWorldsCurrentNetworkExplorerUrl,
  CosmicWorldsContractAddress,
};

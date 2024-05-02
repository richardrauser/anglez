const AnglezLocalhostNetwork = 'localhost';
const AnglezSepoliaNetwork = 'sepolia';
const AnglezGoerliNetwork = 'goerli';
const AnglezMainnetNetwork = 'mainnet';

// Change this to control which environment you're pointing at.
// const currentNetwork = AnglezLocalhostNetwork;
// const currentNetwork = AnglezGoerliNetwork;
const currentNetwork = AnglezSepoliaNetwork;
// const currentNetwork = AnglezMainnetNetwork;

const AnglezCurrentNetworkIDKey = 'AnglezCurrentNetworkIDKey';
const AnglezCurrentNetworkNameKey = 'AnglezCurrentNetworkNameKey';
const AnglezCurrentNetworkCurrencySymbolKey = 'AnglezCurrentNetworkCurrencySymbolKey';
const AnglezCurrentNetworkRpcUrlKey = 'AnglezCurrentNetworkRpcUrlKey';
const AnglezCurrentNetworkExplorerUrlKey = 'AnglezCurrentNetworkExplorerUrlKey';
const AnglezContractAddressKey = 'AnglezContractAddressKey';

const networkConfig = networkConfigFor(currentNetwork);
if (networkConfig === undefined) {
  throw new Error('Invalid network');
}
const AnglezCurrentNetworkID = BigInt(networkConfig[AnglezCurrentNetworkIDKey]);
const AnglezCurrentNetworkName = networkConfig[AnglezCurrentNetworkNameKey];
const AnglezCurrentNetworkCurrencySymbol = networkConfig[AnglezCurrentNetworkCurrencySymbolKey];
const AnglezCurrentNetworkRpcUrl = networkConfig[AnglezCurrentNetworkRpcUrlKey];
const AnglezCurrentNetworkExplorerUrl = networkConfig[AnglezCurrentNetworkExplorerUrlKey];
const AnglezContractAddress = networkConfig[AnglezContractAddressKey];

function networkConfigFor(currentNetwork: string) {
  if (currentNetwork === AnglezLocalhostNetwork) {
    return {
      AnglezCurrentNetworkIDKey: 1337,
      AnglezCurrentNetworkNameKey: 'localhost',
      AnglezCurrentNetworkCurrencySymbolKey: 'ETH',
      AnglezCurrentNetworkRpcUrlKey: 'http://localhost:8545',
      AnglezCurrentNetworkExplorerUrlKey: 'https://www.superbad.com/',
      AnglezContractAddressKey: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    };
  } else if (currentNetwork === AnglezGoerliNetwork) {
    return {
      AnglezCurrentNetworkIDKey: 5,
      AnglezCurrentNetworkNameKey: 'Goerli',
      AnglezCurrentNetworkCurrencySymbolKey: 'GoerliETH',
      // TODO: RPC URL
      AnglezCurrentNetworkRpcUrlKey: 'https://goerli.infura.io',
      AnglezCurrentNetworkExplorerUrlKey: 'https://goerli.etherscan.io/',
      AnglezContractAddressKey: '',
    };
  } else if (currentNetwork === AnglezSepoliaNetwork) {
    return {
      AnglezCurrentNetworkIDKey: 11155111,
      AnglezCurrentNetworkNameKey: 'Sepolia',
      AnglezCurrentNetworkCurrencySymbolKey: 'SepoliaETH',
      // TODO: RPC URL
      AnglezCurrentNetworkRpcUrlKey: 'https://sepolia.infura.io',
      AnglezCurrentNetworkExplorerUrlKey: 'https://sepolia.etherscan.io/',
      AnglezContractAddressKey: '0x1C079486a5CF1e46fE66f54E0E4ab6CC6e63194E', // correct!
    };
  } else if (currentNetwork === AnglezMainnetNetwork) {
    return {
      AnglezCurrentNetworkIDKey: 1,
      AnglezCurrentNetworkNameKey: 'Ethereum Mainnet',
      AnglezCurrentNetworkCurrencySymbolKey: 'ETH',
      // TODO: RPC URL
      AnglezCurrentNetworkRpcUrlKey: 'https://mainnet.infura.io/v3/',
      AnglezCurrentNetworkExplorerUrlKey: 'https://www.etherscan.io/',
      AnglezContractAddressKey: '0xFc0d97b66F3A1D9B97d6414c7b3d9431714C7B98',
    };
  }
}

export {
  AnglezCurrentNetworkID,
  AnglezCurrentNetworkName,
  AnglezCurrentNetworkCurrencySymbol,
  AnglezCurrentNetworkRpcUrl,
  AnglezCurrentNetworkExplorerUrl,
  AnglezContractAddress,
};

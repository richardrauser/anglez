const AnglezLocalhostNetwork = 'localhost';
const AnglezBaseSepoliaNetwork = 'basesepolia';
const AnglezSepoliaNetwork = 'sepolia';
const AnglezMainnetNetwork = 'mainnet';

// Change this to control which environment you're pointing at.
// const currentNetwork = AnglezLocalhostNetwork;
const currentNetwork = AnglezBaseSepoliaNetwork;
// const currentNetwork = AnglezSepoliaNetwork;
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
const AnglezCurrentNetworkID = networkConfig[AnglezCurrentNetworkIDKey];
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
  } else if (currentNetwork === AnglezBaseSepoliaNetwork) {
    return {
      AnglezCurrentNetworkIDKey: 84532,
      AnglezCurrentNetworkNameKey: 'Base Sepolia',
      AnglezCurrentNetworkCurrencySymbolKey: 'ETH',
      // TODO: Remove API key from RPC URL!
      AnglezCurrentNetworkRpcUrlKey:
        'https://api.developer.coinbase.com/rpc/v1/base-sepolia/ikCoAA-DxC0DMH4Y0xAT6tqPNjjMhftE',
      AnglezCurrentNetworkExplorerUrlKey: 'https://sepolia.basescan.org/',
      AnglezContractAddressKey: '0x1C079486a5CF1e46fE66f54E0E4ab6CC6e63194E',
    };
  } else if (currentNetwork === AnglezSepoliaNetwork) {
    return {
      AnglezCurrentNetworkIDKey: 11155111,
      AnglezCurrentNetworkNameKey: 'Sepolia',
      AnglezCurrentNetworkCurrencySymbolKey: 'ETH',
      // TODO: RPC URL
      AnglezCurrentNetworkRpcUrlKey: 'https://sepolia.infura.io',
      AnglezCurrentNetworkExplorerUrlKey: 'https://sepolia.etherscan.io/',
      AnglezContractAddressKey: '0x77f91D9B25fbB443F4CA3f07AC217600503566d1',
    };
  } else if (currentNetwork === AnglezMainnetNetwork) {
    return {
      AnglezCurrentNetworkIDKey: 1,
      AnglezCurrentNetworkNameKey: 'Ethereum Mainnet',
      AnglezCurrentNetworkCurrencySymbolKey: 'ETH',
      // TODO: RPC URL
      AnglezCurrentNetworkRpcUrlKey: 'https://mainnet.infura.io/v3/',
      AnglezCurrentNetworkExplorerUrlKey: 'https://www.etherscan.io/',
      AnglezContractAddressKey: '',
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

const AnglezLocalhostNetwork = 'localhost';
const AnglezBaseSepoliaNetwork = 'basesepolia';
const AnglezSepoliaNetwork = 'sepolia';
const AnglezBaseMainnetNetwork = 'mainnet';

// Change this to control which environment you're pointing at.
// const currentNetwork = AnglezLocalhostNetwork;
// const currentNetwork = AnglezBaseSepoliaNetwork;
// const currentNetwork = AnglezSepoliaNetwork;
const currentNetwork = AnglezBaseMainnetNetwork;

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
      AnglezContractAddressKey: '0xa4a554D505EF30e1F9E9c8Df591813CB08374e64',
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
  } else if (currentNetwork === AnglezBaseMainnetNetwork) {
    return {
      AnglezCurrentNetworkIDKey: 8453,
      AnglezCurrentNetworkNameKey: 'Base Mainnet',
      AnglezCurrentNetworkCurrencySymbolKey: 'ETH',
      // TODO: RPC URL
      AnglezCurrentNetworkRpcUrlKey:
        'https://api.developer.coinbase.com/rpc/v1/base-sepolia/ikCoAA-DxC0DMH4Y0xAT6tqPNjjMhftE',
      AnglezCurrentNetworkExplorerUrlKey: 'https://www.basescan.org/',
      AnglezContractAddressKey: '0x2F8c2A675962ecb07505684EeA496D02d5a9124A',
    };
  }
}
export const NEXT_PUBLIC_URL =
  process.env.NEXT_PUBLIC_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.anglez.xyz');
export {
  AnglezCurrentNetworkID,
  AnglezCurrentNetworkName,
  AnglezCurrentNetworkCurrencySymbol,
  AnglezCurrentNetworkRpcUrl,
  AnglezCurrentNetworkExplorerUrl,
  AnglezContractAddress,
};

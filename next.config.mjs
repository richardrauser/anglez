import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  // Stub out optional dependencies of transitive wallet packages that we don't use
  // and that aren't installed, so webpack doesn't error/warn on the dangling imports:
  //  - @x402/*: optional peer deps of @coinbase/cdp-sdk (x402 payments), reached via
  //    wagmi -> @wagmi/connectors -> @base-org/account. We don't use x402 payments.
  //  - @react-native-async-storage/async-storage: React Native storage for
  //    @metamask/sdk. Irrelevant in a web app.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@x402/core': false,
      '@x402/evm': false,
      '@x402/svm': false,
      '@x402/extensions': false,
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
  redirects: async () => [
    {
      source: '/storefront-metadata',
      destination: '/storefront-metadata.json',
      permanent: true,
    },
  ],
});

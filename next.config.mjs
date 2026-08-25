import bundleAnalyzer from '@next/bundle-analyzer';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const analyze = process.env.ANALYZE === 'true';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: analyze,
});

export default withBundleAnalyzer({
  reactStrictMode: false,
  // Pin the file-tracing root to this project. Next infers it from the outermost
  // lockfile it can find, which picks up any stray lockfile above the repo (e.g. one
  // sitting in $HOME) and traces from there - bloating or breaking the serverless
  // bundle. Pinning it keeps builds identical on every machine and in CI.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  // @base-org/account pulls in @coinbase/cdp-sdk, which statically imports the optional
  // @x402/* payment packages. This app does not use x402 payments and they are not
  // installed, so bundling that dependency cannot succeed. Keeping it external leaves it
  // to be required at runtime, where the unused code path is never reached.
  serverExternalPackages: ['@coinbase/cdp-sdk'],
  // Turbopack (the default builder since Next 16) resolves the optional peer deps of
  // our transitive wallet packages on its own, so no aliasing is needed for it - and
  // Next fails the build outright if a webpack config is present on a Turbopack run.
  //
  // `yarn analyze` is the one exception: @next/bundle-analyzer is a webpack plugin, so
  // that script runs `next build --webpack`. Webpack *does* error on those dangling
  // imports, so the stubs below are attached only on the analyze path:
  //  - @x402/*: optional peer deps of @coinbase/cdp-sdk (x402 payments), reached via
  //    wagmi -> @wagmi/connectors -> @base-org/account. We don't use x402 payments.
  //  - @react-native-async-storage/async-storage: React Native storage for
  //    @metamask/sdk. Irrelevant in a web app.
  //  - accounts: an optional peer dep of @wagmi/core 3, reached through its "tempo"
  //    connectors, which this app does not use.
  ...(analyze && {
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@x402/core': false,
        '@x402/evm': false,
        '@x402/svm': false,
        '@x402/extensions': false,
        '@react-native-async-storage/async-storage': false,
        accounts: false,
      };
      return config;
    },
  }),
  redirects: async () => [
    {
      source: '/storefront-metadata',
      destination: '/storefront-metadata.json',
      permanent: true,
    },
  ],
});

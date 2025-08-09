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
  rewrites: async () => [
    {
      source: '/artwork/anglez-:id.png',
      destination: '/api/artwork/:id/image',
    },
  ],
  redirects: async () => [
    {
      source: '/storefront-metadata',
      destination: '/storefront-metadata.json',
      permanent: true,
    },
  ],
});

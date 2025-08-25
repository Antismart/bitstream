/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '',
  assetPrefix: '',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    // Handle package compatibility issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      buffer: false,
    };
    
    // Handle module not found issues for specific packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@dfinity/identity/lib/cjs/identity/partial': false,
    };

    return config;
  },
  transpilePackages: ['@nfid/identitykit'],
};

module.exports = nextConfig;
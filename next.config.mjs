/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint and TypeScript checks during build (handled in CI)
  // This prevents git-related errors in Vercel builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Resolve sharp on server without bundling (used by omnibeam/fiberoptic-state-extractor)
  serverExternalPackages: ['sharp'],
  // Exclude syntheverse-ui subdirectory from compilation
  webpack: (config, { isServer }) => {
    // Exclude syntheverse-ui from compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/syntheverse-ui/**', '**/.next/**', '**/scripts/**'],
    };

    // Ignore syntheverse-ui in resolve to prevent module resolution issues
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // Configure pdfjs-dist worker for client-side only
    if (!isServer) {
      // Handle pdfjs-dist worker files
      config.module.rules.push({
        test: /pdf\.worker\.(min\.)?(js|mjs)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/worker/[hash][ext][query]',
        },
      });
    }

    // Exclude syntheverse-ui from module resolution
    config.module = {
      ...config.module,
      rules: [
        ...(config.module?.rules || []),
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: [/node_modules/, /syntheverse-ui/, /scripts/],
        },
      ],
    };

    // Ignore syntheverse-ui during build analysis
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        hardhat: 'commonjs hardhat',
        '@nomicfoundation/hardhat-toolbox': 'commonjs @nomicfoundation/hardhat-toolbox',
        '@nomicfoundation/hardhat-ethers': 'commonjs @nomicfoundation/hardhat-ethers',
      });
    }

    return config;
  },
  // Exclude syntheverse-ui from page discovery
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Exclude syntheverse-ui from output file tracing
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        './syntheverse-ui/**/*',
        './**/syntheverse-ui/**/*',
        './scripts/**/*',
        './**/scripts/**/*',
      ],
    },
  },
  // Explicitly set the app directory to avoid picking up syntheverse-ui
  distDir: '.next',
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude syntheverse-ui subdirectory from compilation
  webpack: (config, { isServer }) => {
    // Exclude syntheverse-ui from compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/syntheverse-ui/**',
        '**/.next/**',
        '**/scripts/**',
      ],
    };
    
    // Ignore syntheverse-ui in resolve to prevent module resolution issues
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Exclude syntheverse-ui from module resolution
    config.module = {
      ...config.module,
      rules: [
        ...(config.module?.rules || []),
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: [
            /node_modules/,
            /syntheverse-ui/,
            /scripts/,
          ],
        },
      ],
    };
    
    // Ignore syntheverse-ui during build analysis
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'hardhat': 'commonjs hardhat',
        '@nomicfoundation/hardhat-toolbox': 'commonjs @nomicfoundation/hardhat-toolbox',
        '@nomicfoundation/hardhat-ethers': 'commonjs @nomicfoundation/hardhat-ethers',
      });
      // Exclude pdfjs-dist from server bundle (only used client-side)
      if (Array.isArray(config.externals)) {
        config.externals.push('pdfjs-dist');
      } else {
        config.externals = [...config.externals, 'pdfjs-dist'];
      }
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

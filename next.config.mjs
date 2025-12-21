/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude syntheverse-ui subdirectory from compilation
  webpack: (config, { isServer }) => {
    // Exclude syntheverse-ui from compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/syntheverse-ui/**'],
    };
    
    // Ignore syntheverse-ui in resolve
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    return config;
  },
  // Exclude syntheverse-ui from page discovery
  experimental: {
    outputFileTracingExcludes: {
      '*': ['./syntheverse-ui/**/*'],
    },
  },
};

export default nextConfig;

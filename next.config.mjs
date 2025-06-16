/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Ignore optional OpenTelemetry dependencies
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/winston-transport': false,
        '@opentelemetry/exporter-jaeger': false,
      };
      
      // Handle MSAL browser imports on server
      config.externals = [...(config.externals || []), '@azure/msal-browser', '@azure/msal-react'];
    }
    
    // Suppress critical dependency warnings from OpenTelemetry
    config.module = {
      ...config.module,
      // This is the key setting to suppress the warning
      exprContextCritical: false,
    };
    
    // Filter out the specific warning using webpack's IgnorePlugin
    if (webpack && webpack.IgnorePlugin) {
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          checkResource(resource, context) {
            // Ignore the warning for require-in-the-middle
            if (resource.includes('require-in-the-middle')) {
              return true;
            }
            return false;
          },
        })
      );
    }
    
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
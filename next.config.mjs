/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore optional OpenTelemetry dependencies
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/winston-transport': false,
        '@opentelemetry/exporter-jaeger': false,
      };
      
      // Ignore require-in-the-middle warning
      config.module.exprContextCritical = false;
      
      // Handle MSAL browser imports on server
      config.externals = [...(config.externals || []), '@azure/msal-browser', '@azure/msal-react'];
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
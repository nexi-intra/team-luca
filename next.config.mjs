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
    if (!isServer) {
      // For client-side builds, ignore all OpenTelemetry and Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        stream: false,
        crypto: false,
        zlib: false,
        buffer: false,
        events: false,
        util: false,
        os: false,
        path: false,
        url: false,
        querystring: false,
        http: false,
        https: false,
        dns: false,
        child_process: false,
        worker_threads: false,
      };
      
      // Ignore OpenTelemetry modules in client builds
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/sdk-node': false,
        '@opentelemetry/auto-instrumentations-node': false,
        '@opentelemetry/exporter-trace-otlp-http': false,
        '@opentelemetry/exporter-metrics-otlp-http': false,
        '@grpc/grpc-js': false,
      };
    } else {
      // Server-side: ignore optional OpenTelemetry dependencies
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/winston-transport': false,
        '@opentelemetry/exporter-jaeger': false,
      };
    }
    
    // Suppress critical dependency warnings from OpenTelemetry
    config.module = {
      ...config.module,
      exprContextCritical: false,
      // Ignore specific warnings
      unknownContextCritical: false,
    };
    
    // Filter out warnings using webpack's IgnorePlugin
    if (webpack && webpack.IgnorePlugin) {
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          checkResource(resource, context) {
            // Ignore various problematic modules in client builds
            if (!isServer && (
              resource.includes('require-in-the-middle') ||
              resource.includes('@grpc/grpc-js') ||
              resource.includes('@opentelemetry/sdk-node') ||
              resource.includes('@opentelemetry/auto-instrumentations-node')
            )) {
              return true;
            }
            return false;
          },
        })
      );
    }
    
    // Filter out specific warnings
    config.ignoreWarnings = [
      {
        module: /require-in-the-middle/,
        message: /Critical dependency/,
      },
    ];
    
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
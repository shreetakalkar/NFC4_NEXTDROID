/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Fix for cross-origin requests in development
    allowedDevOrigins: ['localhost:3000', '127.0.0.1:3000'],
  },
  // Add API routes configuration
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ]
      }
    ]
  },
  // Webpack configuration for external modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't include server-side modules in client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

export default nextConfig;
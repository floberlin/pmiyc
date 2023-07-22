/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logos.covalenthq.com",
        port: "",
        pathname: "/tokens/**",
      },
      {
        protocol: "https",
        hostname: "phoenix-labs.notion.site",
        port: "",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

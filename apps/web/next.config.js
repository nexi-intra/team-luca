/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@monorepo/powershell-runner"],
};

module.exports = nextConfig;

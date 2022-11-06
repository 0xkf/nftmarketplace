/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
      INFURA_IPFS_PROJECT_ID: process.env.INFURA_IPFS_PROJECT_ID,
      INFURA_IPFS_PROJECT_SECRET: process.env.INFURA_IPFS_PROJECT_SECRET,
  },
}
module.exports = nextConfig

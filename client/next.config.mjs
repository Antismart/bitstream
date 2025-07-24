/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_CANISTER_ID_SERVER: process.env.NEXT_PUBLIC_CANISTER_ID_SERVER || process.env.CANISTER_ID_SERVER || 'wbyay-dyaaa-aaaag-aue3q-cai',
    DFX_NETWORK: process.env.DFX_NETWORK || 'ic',
  },
}

export default nextConfig

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: process.env.NODE_ENV === 'development' ? undefined : 'export',
    basePath: process.env.NODE_ENV === 'development' ? '' : process.env.NEXT_PUBLIC_BSP_NAME, // Adjust this to your BSP path
    assetPrefix: process.env.NODE_ENV === 'development' ? '' : process.env.NEXT_PUBLIC_BSP_NAME,
    reactStrictMode: true,
}
export default nextConfig;

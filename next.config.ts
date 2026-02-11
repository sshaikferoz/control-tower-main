import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: process.env.NODE_ENV === 'development' ? undefined : 'export',
    basePath: process.env.NODE_ENV === 'development' ? '' : '/sap/bc/ui5_ui5/sap/zscm_scct_myscm', // Adjust this to your BSP path
    assetPrefix: process.env.NODE_ENV === 'development' ? '' : '/sap/bc/ui5_ui5/sap/zscm_scct_myscm',
    reactStrictMode: true,
}
export default nextConfig;

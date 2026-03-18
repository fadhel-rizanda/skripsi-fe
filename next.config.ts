import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    env: {
        INTERNAL_API_URL: process.env.INTERNAL_API_URL || "http://laravel_frankenphp/api",
    },
    async rewrites() {
        return [
            {
                source: "/backend/api/:path*",
                destination: "http://laravel_frankenphp/api/:path*",
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "eksplore-skripsi.s3.ap-southeast-2.amazonaws.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
    experimental: {
        serverActions: {
            allowedOrigins: [
                "localhost:3000",
                "54.169.84.199:3000",
            ],
        },
    },
};

export default nextConfig;
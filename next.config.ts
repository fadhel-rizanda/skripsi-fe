import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    env: {
        INTERNAL_API_URL: process.env.INTERNAL_API_URL || "http://laravel_frankenphp",
    },
    async rewrites() {
        return [
            {
                source: "/backend/:path*",
                destination: "http://laravel_frankenphp/:path*",
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
                process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || "http://localhost:3000",
            ],
        },
    },
};

export default nextConfig;
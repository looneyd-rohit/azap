/** @type {import('next').NextConfig} */
const nextConfig = {
    // webpack: (config, { isServer }) => {
    //     if (!isServer) {
    //         // Modify webpack configuration for server-side
    //         config.resolve.fallback = { ...config.resolve.fallback, dgram: false, fs: false, net: false, tls: false, child_process: false, dns: false, fsctl: false };
    //     }
    //     return config;
    // },
    webpack: (config) => {
        config.externals.push({
            "utf-8-validate": "commonjs utf-8-validate",
            bufferutil: "commonjs bufferutil"
        });

        return config;
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
                port: '',
                pathname: "/u/**",
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'fastly.picsum.photos',
                port: '',
                pathname: '**',
            },
        ],
    },
}

module.exports = nextConfig

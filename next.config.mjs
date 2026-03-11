/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
                search: ''
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            }
        ]
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Externalize pdfkit and related packages to prevent webpack from bundling them
            // This allows pdfkit to access its font data files from node_modules
            config.externals = config.externals || [];

            // Add pdfkit and its dependencies as externals
            if (Array.isArray(config.externals)) {
                config.externals.push('pdfkit', 'fontkit', 'png-js', 'linebreak');
            } else {
                config.externals = ['pdfkit', 'fontkit', 'png-js', 'linebreak'];
            }
        }
        return config;
    }
};

export default nextConfig;

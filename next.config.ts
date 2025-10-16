import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
    unoptimized: true, // Désactiver l'optimisation pour les images locales
  },
  // Configuration pour servir les fichiers statiques
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
  // Optimisations de performance
  compress: true, // Activer la compression gzip
  
  // Configuration du cache
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  
  // Réduire le bundle en production
  productionBrowserSourceMaps: false,
  
  // Optimiser les chunks webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;

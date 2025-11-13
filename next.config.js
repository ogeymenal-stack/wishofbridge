// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const config = {
  // ⚡️ Turbopack config ekle
  turbopack: {},
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ✅ HEADERS OPTIMIZASYONU (Cache ve güvenlik)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 yıl cache
          },
        ],
      },
      {
        source: '/(.*)\\.(ico|svg|jpg|jpeg|png|webp|avif|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable', // 1 hafta cache
          },
        ],
      },
    ]
  },

  // ✅ COMPRESSION OPTIMIZASYONU
  compress: true,
  
  // ✅ BUNDLE OPTIMIZASYONU
  webpack: (config, { dev, isServer }) => {
    // Geliştirme modunda performans iyileştirmeleri
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      }
    }

    // Production build optimizasyonları
    if (!dev && !isServer) {
      // Daha agresif chunk optimizasyonu
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          lucide: {
            test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 20,
          },
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'framework',
            chunks: 'all',
            priority: 30,
          },
          lib: {
            test: /[\\/]node_modules[\\/](?!react|react-dom|next|lucide-react)/,
            name: 'lib',
            chunks: 'all',
            priority: 10,
          },
        },
      }
    }

    return config
  },

  // App Router projelerinde yararlı: build sırasında daha temiz log
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // ✅ OUTPUT OPTIMIZASYONU
  output: 'standalone', // Daha küçük production image'ları için
}

module.exports = withBundleAnalyzer(config)
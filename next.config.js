/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Security: Remove X-Powered-By header
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'api.qrserver.com',
      'maps.googleapis.com',
      'maps.gstatic.com',
      'www.google.com'
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self "https://www.google.com" "https://maps.google.com"), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://*.google.com https://*.google.co.in https://*.googleapis.com https://*.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.gstatic.com",
              "img-src 'self' data: blob: https://images.unsplash.com https://via.placeholder.com https://api.qrserver.com https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com https://*.google.co.in https://*.googleapis.com https://*.gstatic.com https://*.googleusercontent.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.qrserver.com https://api.brevo.com https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com https://*.google.co.in https://*.googleapis.com https://*.gstatic.com",
              "frame-src 'self' https://www.googletagmanager.com https://www.google.com https://maps.google.com https://*.google.com https://*.google.co.in",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

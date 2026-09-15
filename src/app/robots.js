export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/profile/',
        '/portal-indore-ops-9821',
        '/login',
        '/signup',
        '/privacy-policy',
        '/terms-and-conditions'
      ],
    },
    sitemap: 'https://www.plumberindore.in/sitemap.xml',
  };
}

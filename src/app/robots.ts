import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/hc-dashboard/', '/hc-dev/'],
      },
    ],
    sitemap: 'https://hotcakes-nepal.vercel.app/sitemap.xml',
  }
}

import type { MetadataRoute } from 'next'

const baseUrl = 'https://hotcakes-nepal.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // Homepage — highest priority, changes daily (opening status, campaigns)
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      // Menu — high priority, updated when items change
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      // Location — highest-value local SEO page: "cafe in Hattiban", directions, hours
      url: `${baseUrl}/location`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      // Order — conversion page, delivery links change periodically
      url: `${baseUrl}/order`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      // Contact — social links and contact info
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      // Streak / Campaigns — changes frequently with active campaigns
      url: `${baseUrl}/streak`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.75,
    },
    {
      // Vacancies — updated when hiring
      url: `${baseUrl}/vacancies`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]
}

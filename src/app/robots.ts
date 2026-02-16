import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/'],
      },
    ],
    sitemap: 'https://lardia.com.br/sitemap.xml',
    // Note: llms.txt and llms-full.txt are served from /public as static files
    // https://lardia.com.br/llms.txt
    // https://lardia.com.br/llms-full.txt
  }
}

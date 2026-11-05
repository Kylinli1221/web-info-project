import { defineEventHandler, setHeader } from 'h3'
import { publishedWhere } from '../utils/content'
import { prisma } from '../utils/prisma'

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = String(config.public.siteUrl).replace(/\/+$/, '')
  const locales = ['zh', 'en']
  const staticPaths = ['', '/solutions', '/cases', '/news', '/about', '/contact']

  const [solutions, cases, news] = await Promise.all([
    prisma.solution.findMany({
      where: publishedWhere(),
      select: { slug: true, updatedAt: true },
    }),
    prisma.caseStudy.findMany({
      where: publishedWhere(),
      select: { slug: true, updatedAt: true },
    }),
    prisma.newsPost.findMany({
      where: publishedWhere(),
      select: { slug: true, updatedAt: true },
    }),
  ])

  const entries = locales.flatMap((locale) => {
    const staticEntries = staticPaths.map(path => ({
      url: `${baseUrl}/${locale}${path}`,
      lastmod: undefined as Date | undefined,
    }))
    const detailEntries = [
      ...solutions.map(item => ({ url: `${baseUrl}/${locale}/solutions/${item.slug}`, lastmod: item.updatedAt })),
      ...cases.map(item => ({ url: `${baseUrl}/${locale}/cases/${item.slug}`, lastmod: item.updatedAt })),
      ...news.map(item => ({ url: `${baseUrl}/${locale}/news/${item.slug}`, lastmod: item.updatedAt })),
    ]
    return [...staticEntries, ...detailEntries]
  })

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(entry => [
      '  <url>',
      `    <loc>${escapeXml(entry.url)}</loc>`,
      ...(entry.lastmod ? [`    <lastmod>${entry.lastmod.toISOString()}</lastmod>`] : []),
      '  </url>',
    ].join('\n')),
    '</urlset>',
  ].join('\n')

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=300')
  return body
})

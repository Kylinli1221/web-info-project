import { localize } from '../../shared/types/content'
import type {
  CaseDetail,
  ContentCard,
  ContentSeo,
  FooterLink,
  HomeSection,
  LocalizedCaseResults,
  LocalizedList,
  LocalizedText,
  NavigationItem,
  PaginatedResponse,
  PaginationQuery,
  PublicContentCard,
  PublicContentDetail,
  SiteContent,
  SocialLink,
  SolutionDetail,
} from '../../shared/types/content'
import { notFound, publishedWhere, slugSchema } from '../utils/content'
import { renderMarkdown } from '../utils/markdown'
import { prisma } from '../utils/prisma'

export type ContentKind = 'solutions' | 'cases' | 'news'

interface ContentRecord {
  slug: string
  title: unknown
  summary: unknown
  coverUrl: string | null
  publishedAt: Date | null
}

function objectValue(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function localizedText(value: unknown): LocalizedText {
  return {
    zh: localize(value, 'zh'),
    en: localize(value, 'en'),
  }
}

function contentSeo(value: unknown): ContentSeo {
  const seo = objectValue(value)
  const keywords = seo.keywords !== null && typeof seo.keywords === 'object'
    ? { keywords: localizedText(seo.keywords) }
    : {}

  return {
    title: localizedText(seo.title),
    description: localizedText(seo.description),
    ...keywords,
  }
}

function socialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    const link = objectValue(item)
    if (typeof link.url !== 'string') return []

    return [{
      label: localizedText(link.label),
      url: link.url,
      ...(typeof link.icon === 'string' ? { icon: link.icon } : {}),
    }]
  })
}

function footerLinks(value: unknown): FooterLink[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    const link = objectValue(item)
    return typeof link.url === 'string'
      ? [{ label: localizedText(link.label), url: link.url }]
      : []
  })
}

function localizedList(value: unknown): LocalizedList | null {
  if (value === null || typeof value !== 'object') return null
  const lists = value as Partial<Record<'zh' | 'en', unknown>>

  return {
    zh: Array.isArray(lists.zh) ? lists.zh.filter((item): item is string => typeof item === 'string') : [],
    en: Array.isArray(lists.en) ? lists.en.filter((item): item is string => typeof item === 'string') : [],
  }
}

function localizedCaseResults(value: unknown): LocalizedCaseResults | null {
  if (value === null || typeof value !== 'object') return null
  const results = value as Partial<Record<'zh' | 'en', unknown>>

  const mapResults = (items: unknown) => Array.isArray(items)
    ? items.flatMap((item) => {
        const result = objectValue(item)
        return typeof result.value === 'string' && typeof result.label === 'string'
          ? [{ value: result.value, label: result.label }]
          : []
      })
    : []

  return { zh: mapResults(results.zh), en: mapResults(results.en) }
}

function contentHtml(value: unknown): LocalizedText {
  return {
    zh: renderMarkdown(localize(value, 'zh')),
    en: renderMarkdown(localize(value, 'en')),
  }
}

function contentCard(record: ContentRecord): ContentCard {
  return {
    slug: record.slug,
    title: localizedText(record.title),
    summary: localizedText(record.summary),
    coverUrl: record.coverUrl,
    publishedAt: record.publishedAt?.toISOString() ?? null,
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  const [settings, navigation] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 1 } }),
    prisma.navigationItem.findMany({
      where: { visible: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  if (!settings) notFound()

  const footer = objectValue(settings.footer)

  return {
    settings: {
      logoLightUrl: settings.logoLightUrl,
      logoDarkUrl: settings.logoDarkUrl,
      faviconUrl: settings.faviconUrl,
      siteName: localizedText(settings.siteName),
      contactEmail: settings.contactEmail,
      phone: settings.phone,
      address: settings.address === null ? null : localizedText(settings.address),
      socialLinks: socialLinks(settings.socialLinks),
      seo: contentSeo(settings.seo),
      footer: {
        copyright: localizedText(footer.copyright),
        icpNumber: typeof footer.icpNumber === 'string' ? footer.icpNumber : '',
        icpUrl: typeof footer.icpUrl === 'string' ? footer.icpUrl : '',
        publicSecurityNumber: typeof footer.publicSecurityNumber === 'string' ? footer.publicSecurityNumber : '',
        publicSecurityUrl: typeof footer.publicSecurityUrl === 'string' ? footer.publicSecurityUrl : '',
        links: footerLinks(footer.links),
      },
    },
    navigation: navigation.map((item): NavigationItem => ({
      id: item.id,
      label: localizedText(item.label),
      url: item.url,
      sortOrder: item.sortOrder,
    })),
  }
}

export async function getHomeContent(): Promise<HomeSection[]> {
  const sections = await prisma.homeSection.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
  })

  return sections.map((section) => ({
    id: section.id,
    type: section.type,
    content: objectValue(section.content),
    sortOrder: section.sortOrder,
  }))
}

export async function listPublished(
  kind: ContentKind,
  query: PaginationQuery,
): Promise<PaginatedResponse<PublicContentCard>> {
  const { page, pageSize } = query
  const skip = (page - 1) * pageSize
  const where = publishedWhere()

  if (kind === 'solutions') {
    const [records, total] = await prisma.$transaction([
      prisma.solution.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.solution.count({ where }),
    ])

    return {
      items: records.map((record) => ({ ...contentCard(record), icon: record.icon })),
      page,
      pageSize,
      total,
    }
  }

  if (kind === 'cases') {
    const [records, total] = await prisma.$transaction([
      prisma.caseStudy.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.caseStudy.count({ where }),
    ])

    return {
      items: records.map((record) => ({
        ...contentCard(record),
        clientName: record.clientName,
        industry: record.industry,
      })),
      page,
      pageSize,
      total,
    }
  }

  const [records, total] = await prisma.$transaction([
    prisma.newsPost.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: pageSize,
    }),
    prisma.newsPost.count({ where }),
  ])

  return { items: records.map(contentCard), page, pageSize, total }
}

export async function getPublishedBySlug(kind: ContentKind, slug: string): Promise<PublicContentDetail> {
  if (!slugSchema.safeParse(slug).success) notFound()

  const where = { slug, ...publishedWhere() }

  if (kind === 'solutions') {
    const record = await prisma.solution.findFirst({ where })
    if (!record) notFound()

    const detail: SolutionDetail = {
      ...contentCard(record),
      icon: record.icon,
      features: localizedList(record.features),
      contentHtml: contentHtml(record.content),
    }
    return detail
  }

  if (kind === 'cases') {
    const record = await prisma.caseStudy.findFirst({ where })
    if (!record) notFound()

    const detail: CaseDetail = {
      ...contentCard(record),
      clientName: record.clientName,
      industry: record.industry,
      results: localizedCaseResults(record.results),
      contentHtml: contentHtml(record.content),
    }
    return detail
  }

  const record = await prisma.newsPost.findFirst({ where })
  if (!record) notFound()

  return {
    ...contentCard(record),
    seo: record.seo === null ? null : contentSeo(record.seo),
    contentHtml: contentHtml(record.content),
  }
}

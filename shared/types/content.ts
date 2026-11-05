export type Locale = 'zh' | 'en'
export type LocalizedText = Record<Locale, string>

export function localize(value: unknown, locale: Locale): string {
  if (!value || typeof value !== 'object') return ''
  const text = value as Partial<Record<Locale, unknown>>
  const selected = text[locale] ?? text.zh
  return typeof selected === 'string' ? selected : ''
}

export interface ContentSeo {
  title: LocalizedText
  description: LocalizedText
  keywords?: LocalizedText
}

export interface SocialLink {
  label: LocalizedText
  url: string
  icon?: string
}

export interface FooterLink {
  label: LocalizedText
  url: string
}

export interface SiteFooter {
  copyright: LocalizedText
  icpNumber: string
  icpUrl: string
  publicSecurityNumber: string
  publicSecurityUrl: string
  links: FooterLink[]
}

export interface SiteSettings {
  logoLightUrl: string | null
  logoDarkUrl: string | null
  faviconUrl: string | null
  siteName: LocalizedText
  contactEmail: string | null
  phone: string | null
  address: LocalizedText | null
  socialLinks: SocialLink[]
  seo: ContentSeo
  footer: SiteFooter
}

export interface NavigationItem {
  id: string
  label: LocalizedText
  url: string
  sortOrder: number
}

export interface SiteContent {
  settings: SiteSettings
  navigation: NavigationItem[]
}

export interface HomeSection {
  id: string
  type: string
  content: Record<string, unknown>
  sortOrder: number
}

export interface ContentCard {
  slug: string
  title: LocalizedText
  summary: LocalizedText
  coverUrl: string | null
  publishedAt: string | null
}

export interface SolutionCard extends ContentCard {
  icon: string | null
}

export interface CaseCard extends ContentCard {
  clientName: string | null
  industry: string | null
}

export type NewsCard = ContentCard

export type PublicContentCard = SolutionCard | CaseCard | NewsCard

export interface PaginationQuery {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export type LocalizedList = Record<Locale, string[]>

export interface CaseResult {
  value: string
  label: string
}

export type LocalizedCaseResults = Record<Locale, CaseResult[]>

export interface SolutionDetail extends SolutionCard {
  features: LocalizedList | null
  contentHtml: LocalizedText
}

export interface CaseDetail extends CaseCard {
  results: LocalizedCaseResults | null
  contentHtml: LocalizedText
}

export interface NewsDetail extends NewsCard {
  seo: ContentSeo | null
  contentHtml: LocalizedText
}

export type PublicContentDetail = SolutionDetail | CaseDetail | NewsDetail

import { z } from 'zod'

export const PUBLISH_STATUSES = ['DRAFT', 'PUBLISHED'] as const
export type PublishStatusValue = (typeof PUBLISH_STATUSES)[number]

const localized = (max: number, requireChinese = true) => z.object({
  zh: requireChinese ? z.string().trim().min(1).max(max) : z.string().trim().max(max),
  en: z.string().trim().max(max).default(''),
})

const optionalLocalized = z.object({
  zh: z.string().trim().max(5000),
  en: z.string().trim().max(5000).default(''),
})

export const safeUrl = z.string().trim().max(2048).refine(
  value => value === '' || (value.startsWith('/') && !value.startsWith('//')) || value.startsWith('https://'),
  'URL must be relative or use https',
)

const nullableUrl = z.union([safeUrl, z.null()])
const nullableEmail = z.union([z.string().trim().email().max(200), z.literal(''), z.null()])

export const settingsSchema = z.object({
  logoLightUrl: nullableUrl,
  logoDarkUrl: nullableUrl,
  faviconUrl: nullableUrl,
  siteName: localized(120),
  contactEmail: nullableEmail,
  phone: z.union([z.string().trim().max(50), z.null()]),
  address: z.union([optionalLocalized, z.null()]),
  socialLinks: z.array(z.object({
    label: localized(60),
    url: safeUrl.refine(value => value.length > 0, 'Social URL is required'),
    icon: z.string().trim().max(60).optional(),
  })).max(20),
  seo: z.object({
    title: localized(160),
    description: localized(300),
    keywords: localized(500).optional(),
  }),
  footer: z.object({
    copyright: localized(300, false),
    icpNumber: z.string().trim().max(100),
    icpUrl: safeUrl,
    publicSecurityNumber: z.string().trim().max(100),
    publicSecurityUrl: safeUrl,
    links: z.array(z.object({
      label: localized(60),
      url: safeUrl.refine(value => value.length > 0, 'Footer link URL is required'),
    })).max(12),
  }),
})

export const navigationSchema = z.object({
  label: localized(60),
  url: safeUrl.refine(value => value.length > 0, 'Navigation URL is required'),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  visible: z.boolean().default(true),
})

const slug = z.string().trim().toLowerCase().min(1).max(100).regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  'Slug must contain lowercase letters, numbers, and single hyphens',
)

const publicationFields = {
  status: z.enum(PUBLISH_STATUSES).default('DRAFT'),
  publishedAt: z.union([z.string().datetime(), z.null()]).optional(),
}

const commonContentFields = {
  slug,
  title: localized(160),
  summary: localized(500),
  content: localized(100000),
  coverUrl: nullableUrl,
  sortOrder: z.number().int().min(0).max(9999).default(0),
  ...publicationFields,
}

export const solutionCreateSchema = z.object({
  ...commonContentFields,
  features: z.object({
    zh: z.array(z.string().trim().min(1).max(200)).max(20),
    en: z.array(z.string().trim().max(200)).max(20),
  }).nullable().optional(),
  icon: z.union([z.string().trim().max(80), z.null()]).optional(),
})

export const caseCreateSchema = z.object({
  ...commonContentFields,
  clientName: z.union([z.string().trim().max(160), z.null()]).optional(),
  industry: z.union([z.string().trim().max(160), z.null()]).optional(),
  results: z.object({
    zh: z.array(z.object({ value: z.string().trim().max(80), label: z.string().trim().max(160) })).max(12),
    en: z.array(z.object({ value: z.string().trim().max(80), label: z.string().trim().max(160) })).max(12),
  }).nullable().optional(),
})

const contentSeoSchema = z.object({
  title: localized(160),
  description: localized(300),
  keywords: localized(500).optional(),
})

export const newsCreateSchema = z.object({
  slug,
  title: localized(160),
  summary: localized(500),
  content: localized(100000),
  coverUrl: nullableUrl,
  ...publicationFields,
  seo: contentSeoSchema.nullable().optional(),
})

export const solutionUpdateSchema = solutionCreateSchema.partial()
export const caseUpdateSchema = caseCreateSchema.partial()
export const newsUpdateSchema = newsCreateSchema.partial()
export const navigationUpdateSchema = navigationSchema.partial()

export const homeUpdateSchema = z.object({
  content: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  visible: z.boolean().optional(),
})

export const statusFilterSchema = z.object({
  status: z.enum(PUBLISH_STATUSES).optional(),
})

export type SettingsInput = z.infer<typeof settingsSchema>
export type NavigationInput = z.infer<typeof navigationSchema>
export type SolutionInput = z.infer<typeof solutionCreateSchema>
export type CaseInput = z.infer<typeof caseCreateSchema>
export type NewsInput = z.infer<typeof newsCreateSchema>

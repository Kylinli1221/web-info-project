import type { LocalizedText, Locale } from '~~/shared/types/content'
import { localize } from '~~/shared/types/content'

interface SeoOptions {
  title: LocalizedText | string
  description?: LocalizedText | string
  path?: string
  image?: string | null
  type?: 'website' | 'article'
}

function asText(value: LocalizedText | string | undefined, locale: Locale, fallback = ''): string {
  if (!value) return fallback
  return typeof value === 'string' ? value : localize(value, locale)
}

export function useSeo(options: SeoOptions) {
  const { locale } = useI18n()
  const route = useRoute()
  const { site } = useSiteContent()
  const config = useRuntimeConfig()

  const localeValue = computed<Locale>(() => locale.value === 'en' ? 'en' : 'zh')
  const baseUrl = computed(() => String(config.public.siteUrl).replace(/\/+$/, ''))
  const basePath = computed(() => {
    const raw = options.path ?? route.path.replace(/^\/(zh|en)(?=\/|$)/, '')
    if (!raw || raw === '/') return ''
    return raw.startsWith('/') ? raw : `/${raw}`
  })
  const title = computed(() => {
    const configured = asText(options.title, localeValue.value)
    const siteName = asText(site.value?.settings.siteName, localeValue.value)
    return configured || siteName
  })
  const description = computed(() => {
    return asText(
      options.description,
      localeValue.value,
      asText(site.value?.settings.seo.description, localeValue.value),
    )
  })
  const canonical = computed(() => `${baseUrl.value}/${localeValue.value}${basePath.value}`)
  const alternateZh = computed(() => `${baseUrl.value}/zh${basePath.value}`)
  const alternateEn = computed(() => `${baseUrl.value}/en${basePath.value}`)
  const image = computed(() => {
    if (!options.image) return undefined
    return options.image.startsWith('http') ? options.image : `${baseUrl.value}${options.image}`
  })

  useHead(() => ({
    htmlAttrs: { lang: localeValue.value === 'en' ? 'en' : 'zh-CN' },
    title: title.value,
    link: [
      { rel: 'canonical', href: canonical.value },
      { rel: 'alternate', hreflang: 'zh', href: alternateZh.value },
      { rel: 'alternate', hreflang: 'en', href: alternateEn.value },
      { rel: 'alternate', hreflang: 'x-default', href: alternateZh.value },
      ...(site.value?.settings.faviconUrl
        ? [{ rel: 'icon' as const, href: site.value.settings.faviconUrl }]
        : []),
    ],
    meta: [
      { name: 'description', content: description.value },
      { property: 'og:site_name', content: asText(site.value?.settings.siteName, localeValue.value) },
      { property: 'og:title', content: title.value },
      { property: 'og:description', content: description.value },
      { property: 'og:type', content: options.type ?? 'website' },
      { property: 'og:url', content: canonical.value },
      { property: 'og:locale', content: localeValue.value === 'en' ? 'en_US' : 'zh_CN' },
      ...(image.value ? [{ property: 'og:image', content: image.value }] : []),
      { name: 'twitter:card', content: image.value ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: title.value },
      { name: 'twitter:description', content: description.value },
    ],
  }))

  return { canonical, title, description }
}

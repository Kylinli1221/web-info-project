import type { Locale } from '~~/shared/types/content'

export const SUPPORTED_LOCALES: Locale[] = ['zh', 'en']

export function useCurrentLocale() {
  const { locale } = useI18n()
  return computed<Locale>(() => locale.value === 'en' ? 'en' : 'zh')
}

export function localizedPath(locale: Locale, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`
}

export function useLocalizedPath() {
  const locale = useCurrentLocale()
  return (path: string) => localizedPath(locale.value, path)
}

export function switchLocalePath(path: string, target: Locale): string {
  const segments = path.split('/')
  if (SUPPORTED_LOCALES.includes(segments[1] as Locale)) {
    segments[1] = target
  } else {
    segments.splice(1, 0, target)
  }
  return segments.join('/') || `/${target}`
}

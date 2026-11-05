import type { Locale } from '~~/shared/types/content'
import { SUPPORTED_LOCALES } from '../composables/useLocale'

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/admin' || to.path.startsWith('/admin/') || to.path.startsWith('/api/')) return

  if (to.path === '/') {
    const preference = useCookie<Locale>('nexora_locale')
    const accepted = useRequestHeaders(['accept-language'])['accept-language'] ?? ''
    const browserLocale: Locale = accepted.trim().toLowerCase().startsWith('en') ? 'en' : 'zh'
    const target = preference.value && SUPPORTED_LOCALES.includes(preference.value)
      ? preference.value
      : browserLocale
    return navigateTo(`/${target}`, { redirectCode: 302, replace: true })
  }

  const segment = to.path.split('/')[1] as Locale
  if (!SUPPORTED_LOCALES.includes(segment)) {
    if (to.matched.some(record => record.path.includes(':locale'))) {
      throw createError({ statusCode: 404, statusMessage: 'Page not found' })
    }
    return
  }

  const i18n = useNuxtApp().$i18n
  if (i18n.locale.value !== segment) i18n.locale.value = segment
})

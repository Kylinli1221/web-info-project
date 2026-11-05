import type { SiteContent } from '~~/shared/types/content'

export function useSiteContent() {
  const requestFetch = useRequestFetch()
  const { data, error, refresh } = useAsyncData<SiteContent>(
    'site-content',
    () => requestFetch<SiteContent>('/api/site'),
  )

  if (error.value && !data.value) {
    throw createError({ statusCode: 500, statusMessage: 'Site content unavailable' })
  }

  return { site: data, refresh }
}

<script setup lang="ts">
import type { NewsDetail } from '~~/shared/types/content'
import { localize } from '~~/shared/types/content'

const { t } = useI18n()
const locale = useCurrentLocale()
const route = useRoute()
const slug = String(route.params.slug)

const { data: post, error } = await useAsyncData(
  `news-${locale.value}-${slug}`,
  () => $fetch<NewsDetail>(`/api/news/${slug}`),
)
if (error.value || !post.value) throw createError({ statusCode: 404, statusMessage: 'News post not found' })

const title = computed(() => localize(post.value?.title, locale.value))
const summary = computed(() => localize(post.value?.summary, locale.value))
const seoTitle = computed(() => post.value?.seo ? localize(post.value.seo.title, locale.value) : title.value)
const seoDescription = computed(() => post.value?.seo ? localize(post.value.seo.description, locale.value) : summary.value)
const published = computed(() => {
  if (!post.value?.publishedAt) return ''
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(new Date(post.value.publishedAt))
})

useSeo({
  title: seoTitle.value,
  description: seoDescription.value,
  path: `/news/${slug}`,
  image: post.value.coverUrl,
  type: 'article',
})

const backPath = computed(() => localizedPath(locale.value, '/news'))
</script>

<template>
  <div v-if="post">
    <PageHeader eyebrow="INSIGHT / NEXORA" :title="title" :summary="summary" />

    <article class="site-container py-16 lg:py-24">
      <div class="mx-auto max-w-3xl">
        <NuxtLink :to="backPath" class="mb-8 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-cyan-200">
          ← {{ t('detail.backToList') }}
        </NuxtLink>

        <div class="mb-8 flex flex-wrap items-center gap-4 border-b border-white/10 pb-6 font-mono text-[10px] tracking-[0.14em] text-slate-500">
          <span>{{ t('detail.publishedOn').toUpperCase() }} / {{ published }}</span>
          <span v-if="post.seo?.keywords" class="text-cyan-300/50">{{ localize(post.seo.keywords, locale) }}</span>
        </div>

        <img
          v-if="post.coverUrl"
          :src="post.coverUrl"
          :alt="title"
          class="mb-10 aspect-[16/8] w-full rounded-xl object-cover"
        >
        <MarkdownContent :html="post.contentHtml[locale]" />
      </div>
    </article>
  </div>
</template>

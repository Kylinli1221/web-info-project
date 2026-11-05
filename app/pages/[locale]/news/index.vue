<script setup lang="ts">
import type { NewsCard as NewsCardType, PaginatedResponse } from '~~/shared/types/content'

const { t } = useI18n()
const locale = useCurrentLocale()
const route = useRoute()
const page = computed(() => {
  const value = Number(route.query.page)
  return Number.isInteger(value) && value > 0 ? value : 1
})
const basePath = computed(() => localizedPath(locale.value, '/news'))

const { data } = await useAsyncData(
  () => `news-list-${locale.value}-${page.value}`,
  () => $fetch<PaginatedResponse<NewsCardType>>(`/api/news?page=${page.value}&pageSize=9`),
  { watch: [page, locale] },
)

useSeo({ title: t('lists.newsTitle'), description: t('lists.newsIntro'), path: '/news' })
</script>

<template>
  <div>
    <PageHeader :eyebrow="`INSIGHTS / ${String(page).padStart(2, '0')}`" :title="t('lists.newsTitle')" :summary="t('lists.newsIntro')" />
    <section class="site-container py-16 lg:py-24">
      <div v-if="data?.items.length">
        <NewsCard v-for="(post, index) in data.items" :key="post.slug" :post="post" :index="index" />
      </div>
      <p v-else class="py-16 text-center text-sm text-slate-500">{{ t('lists.empty') }}</p>
      <PaginationBar :page="page" :total="data?.total ?? 0" :page-size="data?.pageSize ?? 9" :base-path="basePath" />
    </section>
  </div>
</template>

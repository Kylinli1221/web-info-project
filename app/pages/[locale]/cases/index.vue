<script setup lang="ts">
import type { CaseCard as CaseCardType, PaginatedResponse } from '~~/shared/types/content'

const { t } = useI18n()
const locale = useCurrentLocale()
const route = useRoute()
const page = computed(() => {
  const value = Number(route.query.page)
  return Number.isInteger(value) && value > 0 ? value : 1
})
const basePath = computed(() => localizedPath(locale.value, '/cases'))

const { data } = await useAsyncData(
  () => `cases-list-${locale.value}-${page.value}`,
  () => $fetch<PaginatedResponse<CaseCardType>>(`/api/cases?page=${page.value}&pageSize=8`),
  { watch: [page, locale] },
)

useSeo({ title: t('lists.casesTitle'), description: t('lists.casesIntro'), path: '/cases' })
</script>

<template>
  <div>
    <PageHeader :eyebrow="`CASE STUDIES / ${String(page).padStart(2, '0')}`" :title="t('lists.casesTitle')" :summary="t('lists.casesIntro')" />
    <section class="site-container py-16 lg:py-24">
      <div v-if="data?.items.length" class="grid gap-4 lg:grid-cols-2">
        <CaseCard v-for="(caseStudy, index) in data.items" :key="caseStudy.slug" :case-study="caseStudy" :index="index" />
      </div>
      <p v-else class="py-16 text-center text-sm text-slate-500">{{ t('lists.empty') }}</p>
      <PaginationBar :page="page" :total="data?.total ?? 0" :page-size="data?.pageSize ?? 8" :base-path="basePath" />
    </section>
  </div>
</template>

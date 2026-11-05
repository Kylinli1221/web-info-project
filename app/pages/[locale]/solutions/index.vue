<script setup lang="ts">
import type { PaginatedResponse, SolutionCard as SolutionCardType } from '~~/shared/types/content'

const { t } = useI18n()
const locale = useCurrentLocale()
const route = useRoute()
const page = computed(() => {
  const value = Number(route.query.page)
  return Number.isInteger(value) && value > 0 ? value : 1
})
const basePath = computed(() => localizedPath(locale.value, '/solutions'))

const { data } = await useAsyncData(
  () => `solutions-list-${locale.value}-${page.value}`,
  () => $fetch<PaginatedResponse<SolutionCardType>>(`/api/solutions?page=${page.value}&pageSize=9`),
  { watch: [page, locale] },
)

useSeo({ title: t('lists.solutionsTitle'), description: t('lists.solutionsIntro'), path: '/solutions' })
</script>

<template>
  <div>
    <PageHeader :eyebrow="`SOLUTIONS / ${String(page).padStart(2, '0')}`" :title="t('lists.solutionsTitle')" :summary="t('lists.solutionsIntro')" />
    <section class="site-container py-16 lg:py-24">
      <div v-if="data?.items.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SolutionCard v-for="(solution, index) in data.items" :key="solution.slug" :solution="solution" :index="index" />
      </div>
      <p v-else class="py-16 text-center text-sm text-slate-500">{{ t('lists.empty') }}</p>
      <PaginationBar :page="page" :total="data?.total ?? 0" :page-size="data?.pageSize ?? 9" :base-path="basePath" />
    </section>
  </div>
</template>

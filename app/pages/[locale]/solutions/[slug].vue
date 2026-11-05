<script setup lang="ts">
import type { SolutionDetail } from '~~/shared/types/content'
import { localize } from '~~/shared/types/content'

const { t } = useI18n()
const locale = useCurrentLocale()
const route = useRoute()
const slug = String(route.params.slug)

const { data: solution, error } = await useAsyncData(
  `solution-${locale.value}-${slug}`,
  () => $fetch<SolutionDetail>(`/api/solutions/${slug}`),
)
if (error.value || !solution.value) throw createError({ statusCode: 404, statusMessage: 'Solution not found' })

const title = computed(() => localize(solution.value?.title, locale.value))
const summary = computed(() => localize(solution.value?.summary, locale.value))
const features = computed(() => solution.value?.features?.[locale.value] ?? [])

useSeo({
  title: title.value,
  description: summary.value,
  path: `/solutions/${slug}`,
  image: solution.value.coverUrl,
})

const backPath = computed(() => localizedPath(locale.value, '/solutions'))
</script>

<template>
  <div v-if="solution">
    <PageHeader eyebrow="SOLUTION / NEXORA" :title="title" :summary="summary" />

    <article class="site-container grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_18rem] lg:py-24">
      <div>
        <NuxtLink :to="backPath" class="mb-8 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-cyan-200">
          ← {{ t('detail.backToList') }}
        </NuxtLink>
        <img
          v-if="solution.coverUrl"
          :src="solution.coverUrl"
          :alt="title"
          class="mb-10 aspect-[16/8] w-full rounded-xl object-cover"
        >
        <MarkdownContent :html="solution.contentHtml[locale]" />
      </div>

      <aside v-if="features.length" class="lg:pt-10">
        <div class="tech-card sticky top-28 p-6">
          <p class="font-mono text-[10px] tracking-[0.2em] text-cyan-300/70">CAPABILITY MATRIX</p>
          <ul class="mt-6 space-y-4">
            <li v-for="(feature, index) in features" :key="feature" class="flex gap-3 text-sm leading-6 text-slate-300">
              <span class="font-mono text-[10px] text-cyan-300/60">{{ String(index + 1).padStart(2, '0') }}</span>
              <span>{{ feature }}</span>
            </li>
          </ul>
        </div>
      </aside>
    </article>
  </div>
</template>

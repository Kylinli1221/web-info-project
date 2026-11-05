<script setup lang="ts">
import type { CaseDetail } from '~~/shared/types/content'
import { localize } from '~~/shared/types/content'

const { t } = useI18n()
const locale = useCurrentLocale()
const route = useRoute()
const slug = String(route.params.slug)

const { data: caseStudy, error } = await useAsyncData(
  `case-${locale.value}-${slug}`,
  () => $fetch<CaseDetail>(`/api/cases/${slug}`),
)
if (error.value || !caseStudy.value) throw createError({ statusCode: 404, statusMessage: 'Case study not found' })

const title = computed(() => localize(caseStudy.value?.title, locale.value))
const summary = computed(() => localize(caseStudy.value?.summary, locale.value))
const results = computed(() => caseStudy.value?.results?.[locale.value] ?? [])

useSeo({
  title: title.value,
  description: summary.value,
  path: `/cases/${slug}`,
  image: caseStudy.value.coverUrl,
})

const backPath = computed(() => localizedPath(locale.value, '/cases'))
</script>

<template>
  <div v-if="caseStudy">
    <PageHeader eyebrow="CASE STUDY / NEXORA" :title="title" :summary="summary" />

    <article class="site-container py-16 lg:py-24">
      <NuxtLink :to="backPath" class="mb-8 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-cyan-200">
        ← {{ t('detail.backToList') }}
      </NuxtLink>

      <div class="mb-12 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3">
        <div class="bg-[#071a2c] p-6">
          <span class="font-mono text-[9px] tracking-[0.18em] text-slate-500">{{ t('detail.client').toUpperCase() }}</span>
          <p class="mt-3 text-sm text-white">{{ caseStudy.clientName || '—' }}</p>
        </div>
        <div class="bg-[#071a2c] p-6">
          <span class="font-mono text-[9px] tracking-[0.18em] text-slate-500">{{ t('detail.industry').toUpperCase() }}</span>
          <p class="mt-3 text-sm text-white">{{ caseStudy.industry || '—' }}</p>
        </div>
        <div class="bg-[#071a2c] p-6">
          <span class="font-mono text-[9px] tracking-[0.18em] text-slate-500">CASE REF</span>
          <p class="mt-3 font-mono text-sm text-cyan-200">{{ caseStudy.slug.toUpperCase().slice(0, 18) }}</p>
        </div>
      </div>

      <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <MarkdownContent :html="caseStudy.contentHtml[locale]" />
        </div>
        <aside v-if="results.length">
          <div class="tech-card p-6 lg:sticky lg:top-28">
            <p class="font-mono text-[10px] tracking-[0.2em] text-cyan-300/70">{{ t('detail.outcomes').toUpperCase() }}</p>
            <dl class="mt-6 space-y-6">
              <div v-for="result in results" :key="`${result.value}-${result.label}`">
                <dt class="font-mono text-2xl font-semibold text-cyan-200">{{ result.value }}</dt>
                <dd class="mt-1 text-xs leading-5 text-slate-400">{{ result.label }}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type {
  CaseCard as CaseCardType,
  LocalizedText,
  NewsCard as NewsCardType,
  PaginatedResponse,
  SolutionCard as SolutionCardType,
} from '~~/shared/types/content'
import { localize } from '~~/shared/types/content'
import { localizedPath } from '../../composables/useLocale'

const { t } = useI18n()
const locale = useCurrentLocale()

const { data: homeData } = await useAsyncData('home-sections', () => $fetch<Array<{
  id: string
  type: string
  content: Record<string, unknown>
  sortOrder: number
}>>('/api/home'))

const { data: solutionsData } = await useAsyncData('home-solutions', () => $fetch<PaginatedResponse<SolutionCardType>>(
  '/api/solutions?pageSize=3',
))
const { data: casesData } = await useAsyncData('home-cases', () => $fetch<PaginatedResponse<CaseCardType>>(
  '/api/cases?pageSize=3',
))
const { data: newsData } = await useAsyncData('home-news', () => $fetch<PaginatedResponse<NewsCardType>>(
  '/api/news?pageSize=3',
))

function section(type: string) {
  return homeData.value?.find(item => item.type === type)
}

const hero = computed(() => section('hero'))
const capabilities = computed(() => section('capabilities'))
const metrics = computed(() => section('metrics'))
const solutionsSection = computed(() => section('solutions'))
const casesSection = computed(() => section('cases'))
const newsSection = computed(() => section('news'))
const aboutSection = computed(() => section('about'))
const contactSection = computed(() => section('contact'))

const solutions = computed(() => solutionsData.value?.items ?? [])
const cases = computed(() => casesData.value?.items ?? [])
const news = computed(() => newsData.value?.items ?? [])
const heroHeadline = computed(() => localize(hero.value?.content.headline, locale.value))
const heroSummary = computed(() => localize(hero.value?.content.summary, locale.value))
const aboutAction = computed(() => {
  const action = aboutSection.value?.content.action
  if (!action || typeof action !== 'object') return null
  const record = action as Record<string, unknown>
  const label = localize(record.label, locale.value)
  const url = typeof record.url === 'string' ? record.url : ''
  return label && url ? { label, to: localizedPath(locale.value, url) } : null
})

useSeo({
  title: heroHeadline.value || t('meta.defaultTitle'),
  description: heroSummary.value || t('meta.defaultDescription'),
})

function actionValue(content: Record<string, unknown> | undefined) {
  const action = content?.action
  if (!action || typeof action !== 'object') return { label: undefined as LocalizedText | undefined, to: undefined as string | undefined }
  const record = action as Record<string, unknown>
  return {
    label: record.label as LocalizedText,
    to: typeof record.url === 'string' ? record.url : undefined,
  }
}
</script>

<template>
  <div>
    <HeroSection v-if="hero" :content="hero.content" />
    <CapabilityGrid v-if="capabilities" :content="capabilities.content" />
    <MetricsBand v-if="metrics" :content="metrics.content" />

    <section v-if="solutionsSection" class="site-container py-24 lg:py-32">
      <SectionHeading
        :eyebrow="solutionsSection.content.eyebrow"
        :title="solutionsSection.content.title"
        :summary="solutionsSection.content.summary"
        :action-label="actionValue(solutionsSection.content).label"
        :action-to="actionValue(solutionsSection.content).to"
      />
      <div class="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SolutionCard
          v-for="(solution, index) in solutions"
          :key="solution.slug"
          :solution="solution"
          :index="index"
        />
      </div>
    </section>

    <section v-if="casesSection" class="border-y border-white/8 bg-[#030d19] py-24 lg:py-32">
      <div class="site-container">
        <SectionHeading
          :eyebrow="casesSection.content.eyebrow"
          :title="casesSection.content.title"
          :summary="casesSection.content.summary"
          :action-label="actionValue(casesSection.content).label"
          :action-to="actionValue(casesSection.content).to"
        />
        <div class="mt-14 grid gap-4 lg:grid-cols-2">
          <CaseCard
            v-for="(caseStudy, index) in cases"
            :key="caseStudy.slug"
            :case-study="caseStudy"
            :index="index"
          />
        </div>
      </div>
    </section>

    <section v-if="newsSection" class="site-container py-24 lg:py-32">
      <SectionHeading
        :eyebrow="newsSection.content.eyebrow"
        :title="newsSection.content.title"
        :summary="newsSection.content.summary"
        :action-label="actionValue(newsSection.content).label"
        :action-to="actionValue(newsSection.content).to"
      />
      <div class="mt-12">
        <NewsCard v-for="(post, index) in news" :key="post.slug" :post="post" :index="index" />
      </div>
    </section>

    <section v-if="aboutSection" class="relative overflow-hidden border-y border-white/8 bg-[#061628] py-24 lg:py-32">
      <div class="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_50%,rgba(88,229,255,0.1),transparent_28rem)]" />
      <div class="site-container relative grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p class="eyebrow">{{ localize(aboutSection.content.eyebrow, locale) }}</p>
          <h2 class="section-title">{{ localize(aboutSection.content.title, locale) }}</h2>
          <p class="section-summary">{{ localize(aboutSection.content.summary, locale) }}</p>
          <p class="mt-5 max-w-2xl text-sm leading-7 text-slate-400">{{ localize(aboutSection.content.content, locale) }}</p>
          <NuxtLink v-if="aboutAction" :to="aboutAction.to" class="btn-ghost mt-8">
            {{ aboutAction.label }}
          </NuxtLink>
        </div>
        <div class="relative">
          <div class="tech-card grid gap-px overflow-hidden border-white/8 bg-white/8 sm:grid-cols-2">
            <div class="bg-[#071a2c] p-7">
              <span class="font-mono text-[10px] tracking-[0.18em] text-cyan-300/60">DISCIPLINE / 01</span>
              <p class="mt-5 text-lg font-medium text-white">{{ t('about.value1') }}</p>
            </div>
            <div class="bg-[#071a2c] p-7">
              <span class="font-mono text-[10px] tracking-[0.18em] text-violet-300/60">DISCIPLINE / 02</span>
              <p class="mt-5 text-lg font-medium text-white">{{ t('about.value2') }}</p>
            </div>
            <div class="bg-[#071a2c] p-7 sm:col-span-2">
              <div class="flex items-center justify-between gap-6">
                <span class="font-mono text-[10px] tracking-[0.18em] text-cyan-300/60">DISCIPLINE / 03</span>
                <span class="font-mono text-xs text-slate-600">NEXORA / 2026</span>
              </div>
              <p class="mt-5 max-w-md text-lg font-medium text-white">{{ t('about.value3') }}</p>
              <div class="mt-8 flex gap-1.5" aria-hidden="true">
                <span v-for="index in 14" :key="index" class="h-1 flex-1 rounded-full" :class="index < 10 ? 'bg-cyan-300/60' : 'bg-white/8'" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <HomeContact v-if="contactSection" :content="contactSection.content" />
  </div>
</template>

<script setup lang="ts">
import { localize } from '~~/shared/types/content'

const { t } = useI18n()
const locale = useCurrentLocale()
const { target, visible } = useReveal()

const { data: home } = await useAsyncData('about-home', () => $fetch<Array<{
  id: string
  type: string
  content: Record<string, unknown>
}>>('/api/home'))
const about = computed(() => home.value?.find(section => section.type === 'about'))
const title = computed(() => localize(about.value?.content.title, locale.value) || t('about.title'))
const summary = computed(() => localize(about.value?.content.summary, locale.value) || t('about.intro'))
const content = computed(() => localize(about.value?.content.content, locale.value))
const contactPath = computed(() => localizedPath(locale.value, '/contact'))

useSeo({ title: t('about.eyebrow'), description: summary.value, path: '/about' })
</script>

<template>
  <div>
    <PageHeader eyebrow="ABOUT / NEXORA" :title="title" :summary="summary" />

    <section ref="target" class="site-container py-20 lg:py-28">
      <div class="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p class="eyebrow">{{ t('about.eyebrow') }}</p>
          <h2 class="section-title">{{ t('about.valuesTitle') }}</h2>
          <p v-if="content" class="section-summary">{{ content }}</p>
          <NuxtLink :to="contactPath" class="btn-primary mt-8">{{ t('actions.contact') }}</NuxtLink>
        </div>

        <div class="grid gap-4">
          <article
            v-for="(value, index) in [t('about.value1'), t('about.value2'), t('about.value3')]"
            :key="value"
            class="tech-card reveal flex gap-6 p-6 sm:p-8"
            :class="{ 'is-visible': visible }"
            :style="{ transitionDelay: `${index * 90}ms` }"
          >
            <span class="font-mono text-xs text-cyan-300/60">0{{ index + 1 }}</span>
            <p class="text-lg font-medium leading-8 text-white">{{ value }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="border-y border-white/8 bg-[#030d19] py-20 lg:py-24">
      <div class="site-container grid gap-6 sm:grid-cols-3">
        <div class="border-l border-cyan-300/30 pl-5">
          <p class="font-mono text-3xl font-semibold text-cyan-200">01</p>
          <p class="mt-3 text-sm text-slate-400">DISCOVERY &amp; STRATEGY</p>
        </div>
        <div class="border-l border-violet-300/30 pl-5">
          <p class="font-mono text-3xl font-semibold text-violet-200">02</p>
          <p class="mt-3 text-sm text-slate-400">DESIGN &amp; ENGINEERING</p>
        </div>
        <div class="border-l border-emerald-300/30 pl-5">
          <p class="font-mono text-3xl font-semibold text-emerald-200">03</p>
          <p class="mt-3 text-sm text-slate-400">OPERATE &amp; EVOLVE</p>
        </div>
      </div>
    </section>
  </div>
</template>

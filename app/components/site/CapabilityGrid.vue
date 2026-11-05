<script setup lang="ts">
import { localize } from '~~/shared/types/content'

const props = defineProps<{ content: Record<string, unknown> }>()
const locale = useCurrentLocale()
const { visible, target } = useReveal()

const items = computed(() => {
  const source = Array.isArray(props.content.items) ? props.content.items : []
  return source.flatMap((item) => {
    const value = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
    return [{
      icon: typeof value.icon === 'string' ? value.icon : 'sparkles',
      title: localize(value.title, locale.value),
      summary: localize(value.summary, locale.value),
    }]
  })
})
</script>

<template>
  <section ref="target" class="site-container py-24 lg:py-32">
    <div class="reveal" :class="{ 'is-visible': visible }">
      <p class="eyebrow">{{ localize(content.eyebrow, locale) || 'CAPABILITIES' }}</p>
      <h2 class="section-title">{{ localize(content.title, locale) }}</h2>
      <p class="section-summary">{{ localize(content.summary, locale) }}</p>
    </div>

    <div class="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="(item, index) in items"
        :key="`${item.title}-${index}`"
        class="tech-card reveal group min-h-60 p-6"
        :class="{ 'is-visible': visible }"
        :style="{ transitionDelay: `${index * 90}ms` }"
      >
        <div class="flex items-start justify-between">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/8 text-cyan-200">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                v-if="item.icon === 'database'"
                d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6m-16 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"
                stroke="currentColor"
                stroke-width="1.4"
              />
              <path
                v-else-if="item.icon === 'cloud'"
                d="M7 18h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.2 9 4.5 4.5 0 0 0 7 18Z"
                stroke="currentColor"
                stroke-width="1.4"
              />
              <path
                v-else
                d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Zm6 12 .9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15Z"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="font-mono text-[10px] tracking-[0.2em] text-slate-600">0{{ index + 1 }}</span>
        </div>
        <h3 class="mt-10 text-lg font-medium tracking-tight text-white">{{ item.title }}</h3>
        <p class="mt-3 text-sm leading-7 text-slate-400">{{ item.summary }}</p>
        <div class="mt-7 h-px w-12 bg-gradient-to-r from-cyan-300/70 to-transparent transition-all duration-500 group-hover:w-24" />
      </article>
    </div>
  </section>
</template>

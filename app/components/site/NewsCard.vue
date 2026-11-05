<script setup lang="ts">
import type { NewsCard as NewsCardType } from '~~/shared/types/content'
import { localize } from '~~/shared/types/content'
import { localizedPath } from '../../composables/useLocale'

const props = defineProps<{ post: NewsCardType; index?: number }>()
const currentLocale = useCurrentLocale()
const { t } = useI18n()
const { visible, target } = useReveal()
const to = computed(() => localizedPath(currentLocale.value, `/news/${props.post.slug}`))
const published = computed(() => {
  if (!props.post.publishedAt) return ''
  return new Intl.DateTimeFormat(currentLocale.value === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(props.post.publishedAt))
})
</script>

<template>
  <NuxtLink
    ref="target"
    :to="to"
    class="reveal group border-t border-white/10 py-6 transition-colors hover:border-cyan-300/30"
    :class="{ 'is-visible': visible }"
    :style="{ transitionDelay: `${(index ?? 0) * 70}ms` }"
  >
    <div class="grid gap-5 md:grid-cols-[10rem_1fr_auto] md:items-start">
      <time v-if="published" class="font-mono text-[10px] tracking-[0.15em] text-slate-500">{{ published }}</time>
      <div>
        <h3 class="text-lg font-medium tracking-tight text-white transition-colors group-hover:text-cyan-100">
          {{ localize(post.title, currentLocale) }}
        </h3>
        <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
          {{ localize(post.summary, currentLocale) }}
        </p>
      </div>
      <span class="hidden items-center gap-2 text-xs text-cyan-200/70 md:flex">
        {{ t('actions.readMore') }}
        <span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
      </span>
    </div>
  </NuxtLink>
</template>

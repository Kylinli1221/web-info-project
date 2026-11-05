<script setup lang="ts">
import type { SolutionCard as SolutionCardType } from '~~/shared/types/content'
import { localize } from '~~/shared/types/content'
import { localizedPath } from '../../composables/useLocale'

const props = defineProps<{ solution: SolutionCardType; index?: number }>()
const locale = useCurrentLocale()
const { t } = useI18n()
const { visible, target } = useReveal()
const to = computed(() => localizedPath(locale.value, `/solutions/${props.solution.slug}`))
</script>

<template>
  <NuxtLink
    ref="target"
    :to="to"
    class="tech-card reveal group flex min-h-[19rem] flex-col p-6"
    :class="{ 'is-visible': visible }"
    :style="{ transitionDelay: `${(index ?? 0) * 80}ms` }"
  >
    <div class="flex items-center justify-between">
      <span class="font-mono text-[10px] tracking-[0.2em] text-cyan-300/60">
        SOL / {{ String((index ?? 0) + 1).padStart(2, '0') }}
      </span>
      <span class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition duration-300 group-hover:border-cyan-300/40 group-hover:text-cyan-200">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 17 17 7m0 0H8m9 0v9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </div>

    <img
      v-if="solution.coverUrl"
      :src="solution.coverUrl"
      :alt="localize(solution.title, locale)"
      loading="lazy"
      class="mt-6 aspect-[16/8] w-full rounded-lg object-cover opacity-80 transition duration-500 group-hover:opacity-100"
    >

    <h3 class="mt-8 text-xl font-medium tracking-tight text-white">
      {{ localize(solution.title, locale) }}
    </h3>
    <p class="mt-3 line-clamp-3 text-sm leading-7 text-slate-400">
      {{ localize(solution.summary, locale) }}
    </p>

    <span class="mt-auto inline-flex items-center gap-2 pt-8 text-xs font-medium text-cyan-200/80">
      <span class="h-px w-6 bg-cyan-300/50 transition-all duration-300 group-hover:w-10" />
      {{ t('actions.explore') }}
    </span>
  </NuxtLink>
</template>

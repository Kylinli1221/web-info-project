<script setup lang="ts">
import type { CaseCard as CaseCardType } from '~~/shared/types/content'
import { localize } from '~~/shared/types/content'
import { localizedPath } from '../../composables/useLocale'

const props = defineProps<{ caseStudy: CaseCardType; index?: number }>()
const { locale, t } = useI18n()
const currentLocale = useCurrentLocale()
const { visible, target } = useReveal()
const to = computed(() => localizedPath(currentLocale.value, `/cases/${props.caseStudy.slug}`))
</script>

<template>
  <NuxtLink
    ref="target"
    :to="to"
    class="tech-card reveal group grid overflow-hidden md:grid-cols-[1.15fr_0.85fr]"
    :class="{ 'is-visible': visible }"
    :style="{ transitionDelay: `${(index ?? 0) * 80}ms` }"
  >
    <div class="flex flex-col p-6 sm:p-8">
      <div class="flex flex-wrap items-center gap-3">
        <span v-if="caseStudy.industry" class="rounded-full border border-cyan-300/20 px-2.5 py-1 font-mono text-[9px] tracking-[0.15em] text-cyan-200/80">
          {{ caseStudy.industry }}
        </span>
        <span v-if="caseStudy.clientName" class="text-xs text-slate-500">{{ caseStudy.clientName }}</span>
      </div>
      <h3 class="mt-7 text-2xl font-medium tracking-tight text-white">{{ localize(caseStudy.title, locale) }}</h3>
      <p class="mt-3 text-sm leading-7 text-slate-400">{{ localize(caseStudy.summary, locale) }}</p>
      <span class="mt-auto inline-flex items-center gap-2 pt-8 text-xs font-medium text-cyan-200/80">
        {{ t('detail.client') }} / {{ t('actions.readMore') }}
        <span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
      </span>
    </div>
    <div class="relative min-h-52 overflow-hidden border-t border-white/8 md:border-l md:border-t-0">
      <img
        v-if="caseStudy.coverUrl"
        :src="caseStudy.coverUrl"
        :alt="localize(caseStudy.title, locale)"
        loading="lazy"
        class="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-90"
      >
      <div v-else class="case-visual absolute inset-0">
        <span class="font-mono text-[10px] tracking-[0.2em] text-cyan-200/50">CASE / {{ String((index ?? 0) + 1).padStart(2, '0') }}</span>
        <div class="case-lines" aria-hidden="true">
          <span v-for="line in 7" :key="line" :style="{ width: `${30 + line * 8}%` }" />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.case-visual {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background:
    radial-gradient(circle at 70% 30%, rgba(88, 229, 255, 0.15), transparent 45%),
    linear-gradient(135deg, rgba(12, 37, 62, 0.9), rgba(4, 16, 31, 0.9));
  padding: 1.5rem;
}

.case-lines {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  align-items: flex-end;
}

.case-lines span {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(88, 229, 255, 0.55));
}

.case-lines span:nth-child(3n) {
  background: linear-gradient(90deg, transparent, rgba(139, 125, 255, 0.55));
}
</style>

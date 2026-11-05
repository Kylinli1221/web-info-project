<script setup lang="ts">
import { localize } from '~~/shared/types/content'
import { localizedPath } from '../../composables/useLocale'

const props = defineProps<{
  eyebrow?: unknown
  title: unknown
  summary?: unknown
  actionLabel?: unknown
  actionTo?: string
}>()

const locale = useCurrentLocale()
const { visible, target } = useReveal()
const eyebrowText = computed(() => localize(props.eyebrow, locale.value))
const titleText = computed(() => localize(props.title, locale.value))
const summaryText = computed(() => localize(props.summary, locale.value))
const actionText = computed(() => localize(props.actionLabel, locale.value))
const actionPath = computed(() => props.actionTo ? localizedPath(locale.value, props.actionTo) : '')
</script>

<template>
  <div ref="target" class="reveal flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" :class="{ 'is-visible': visible }">
    <div>
      <p v-if="eyebrowText" class="eyebrow">{{ eyebrowText }}</p>
      <h2 class="section-title">{{ titleText }}</h2>
      <p v-if="summaryText" class="section-summary">{{ summaryText }}</p>
    </div>
    <NuxtLink
      v-if="actionText && actionPath"
      :to="actionPath"
      class="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-cyan-200"
    >
      {{ actionText }}
      <span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
    </NuxtLink>
  </div>
</template>

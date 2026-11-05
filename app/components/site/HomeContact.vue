<script setup lang="ts">
import { localize } from '~~/shared/types/content'
import { localizedPath } from '../../composables/useLocale'

const props = defineProps<{ content: Record<string, unknown> }>()
const locale = useCurrentLocale()
const { visible, target } = useReveal()

const action = computed(() => {
  const value = props.content.action
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const label = localize(record.label, locale.value)
  const url = typeof record.url === 'string' ? record.url : ''
  return label && url ? { label, to: localizedPath(locale.value, url) } : null
})

function field(key: string) {
  const value = props.content[key]
  return typeof value === 'string' ? value : localize(value, locale.value)
}
</script>

<template>
  <section ref="target" class="site-container py-24 lg:py-32">
    <div class="reveal relative overflow-hidden rounded-2xl border border-cyan-200/15 bg-[#071b2d] p-7 sm:p-10 lg:p-14" :class="{ 'is-visible': visible }">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(88,229,255,0.18),transparent_24rem),radial-gradient(circle_at_10%_100%,rgba(139,125,255,0.12),transparent_20rem)]" />
      <div class="pointer-events-none absolute right-10 top-10 hidden h-32 w-32 rounded-full border border-cyan-200/15 lg:block">
        <div class="absolute inset-5 rounded-full border border-dashed border-cyan-200/15" />
        <div class="absolute inset-12 rounded-full bg-cyan-300/20 blur-xl" />
      </div>

      <div class="relative max-w-3xl">
        <p class="eyebrow">{{ field('eyebrow') }}</p>
        <h2 class="mt-5 text-balance text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
          {{ field('title') }}
        </h2>
        <p class="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          {{ field('summary') }}
        </p>
        <div class="mt-9 flex flex-wrap items-center gap-4">
          <NuxtLink v-if="action" :to="action.to" class="btn-primary">{{ action.label }}</NuxtLink>
          <a v-if="field('email')" :href="`mailto:${field('email')}`" class="text-sm text-cyan-200/80 transition hover:text-cyan-100">
            {{ field('email') }}
          </a>
        </div>
        <div class="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-slate-500 sm:flex-row sm:gap-8">
          <span v-if="field('phone')">{{ field('phone') }}</span>
          <span v-if="field('address')">{{ field('address') }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

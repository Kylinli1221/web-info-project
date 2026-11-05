<script setup lang="ts">
import { localize } from '~~/shared/types/content'

const props = defineProps<{ content: Record<string, unknown> }>()
const locale = useCurrentLocale()
const { visible, target } = useReveal(0.2)

const items = computed(() => {
  const source = Array.isArray(props.content.items) ? props.content.items : []
  return source.flatMap((item) => {
    const value = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
    const label = localize(value.label, locale.value)
    const metric = typeof value.value === 'string' ? value.value : ''
    return metric ? [{ value: metric, label }] : []
  })
})
</script>

<template>
  <section ref="target" class="relative overflow-hidden border-y border-cyan-200/10 bg-[#06182a]">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(88,229,255,0.1),transparent_35rem)]" />
    <div class="site-container relative py-14 lg:py-16">
      <div class="mb-10 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p class="font-mono text-[10px] tracking-[0.24em] text-cyan-300/70">SIGNAL / IMPACT</p>
          <h2 class="mt-3 max-w-lg text-2xl font-semibold tracking-tight text-white lg:text-3xl">
            {{ localize(content.title, locale) }}
          </h2>
        </div>
        <p class="max-w-xl text-sm leading-7 text-slate-400 lg:justify-self-end">
          {{ localize(content.summary, locale) }}
        </p>
      </div>
      <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 lg:grid-cols-4">
        <div
          v-for="(item, index) in items"
          :key="`${item.label}-${index}`"
          class="reveal bg-[#071a2c] px-5 py-7 sm:px-7"
          :class="{ 'is-visible': visible }"
          :style="{ transitionDelay: `${index * 80}ms` }"
        >
          <dd class="font-mono text-3xl font-semibold tracking-tight text-cyan-200 sm:text-4xl">
            <MetricValue :value="item.value" :active="visible" />
          </dd>
          <dt class="mt-2 text-xs leading-5 text-slate-400">{{ item.label }}</dt>
        </div>
      </dl>
    </div>
  </section>
</template>

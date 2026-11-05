<script setup lang="ts">
import { localize } from '~~/shared/types/content'
import { localizedPath } from '../../composables/useLocale'

const props = defineProps<{ content: Record<string, unknown> }>()
const locale = useCurrentLocale()
const { visible, target } = useReveal(0.01)

function text(key: string): string {
  return localize(props.content[key], locale.value)
}

function action(key: string) {
  const value = props.content[key]
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const label = localize(record.label, locale.value)
  const url = typeof record.url === 'string' ? record.url : ''
  return label && url ? { label, to: localizedPath(locale.value, url) } : null
}

const primary = computed(() => action('primaryAction'))
const secondary = computed(() => action('secondaryAction'))
const headlineParts = computed(() => {
  return text('headline').split(/(?<=[，,；;！!？?])/).filter(Boolean)
})
</script>

<template>
  <section ref="target" class="relative isolate overflow-hidden border-b border-white/8">
    <HeroCanvas />
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_68%_35%,rgba(88,229,255,0.12),transparent_24rem),radial-gradient(circle_at_82%_18%,rgba(139,125,255,0.12),transparent_20rem)]" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#04101f] to-transparent" />

    <div class="site-container relative grid min-h-[calc(100svh-76px)] items-center gap-14 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
      <div class="reveal max-w-3xl" :class="{ 'is-visible': visible }">
        <p class="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/6 px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.2em] text-cyan-200">
          <span class="relative flex h-1.5 w-1.5">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-70" />
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
          </span>
          {{ text('eyebrow') }}
        </p>

        <h1 class="hero-headline mt-7 text-balance text-[clamp(2.8rem,6.2vw,5.8rem)] font-semibold leading-[0.98] tracking-[-0.058em] text-white">
          <span v-for="(part, index) in headlineParts" :key="`${part}-${index}`" class="block">{{ part }}</span>
        </h1>
        <p class="mt-7 max-w-xl text-base leading-8 text-slate-300/90 sm:text-lg">
          {{ text('summary') }}
        </p>

        <div class="mt-9 flex flex-wrap gap-3">
          <NuxtLink v-if="primary" :to="primary.to" class="btn-primary">
            {{ primary.label }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </NuxtLink>
          <NuxtLink v-if="secondary" :to="secondary.to" class="btn-ghost">
            {{ secondary.label }}
          </NuxtLink>
        </div>

        <div class="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 font-mono text-[10px] tracking-[0.16em] text-slate-500">
          <span>AI ENGINEERING</span>
          <span class="h-px w-6 bg-cyan-300/30" aria-hidden="true" />
          <span>DATA INTELLIGENCE</span>
          <span class="h-px w-6 bg-cyan-300/30" aria-hidden="true" />
          <span>CLOUD NATIVE</span>
        </div>
      </div>

      <div class="reveal relative mx-auto w-full max-w-[520px] lg:justify-self-end" :class="{ 'is-visible': visible }" :style="{ transitionDelay: '160ms' }">
        <div class="hero-orbit" aria-hidden="true">
          <div class="orbit-ring orbit-ring-a" />
          <div class="orbit-ring orbit-ring-b" />
          <div class="orbit-core">N</div>
          <span class="orbit-node orbit-node-a" />
          <span class="orbit-node orbit-node-b" />
          <span class="orbit-node orbit-node-c" />
        </div>

        <div class="hero-console relative ml-auto w-[90%] overflow-hidden rounded-xl border border-cyan-200/15 bg-[#051321]/88 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl">
          <div class="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <div class="flex gap-1.5" aria-hidden="true">
              <span class="h-2 w-2 rounded-full bg-slate-600" />
              <span class="h-2 w-2 rounded-full bg-slate-600" />
              <span class="h-2 w-2 rounded-full bg-cyan-300/70" />
            </div>
            <span class="font-mono text-[9px] tracking-[0.18em] text-slate-500">NEXORA / CONTROL PLANE</span>
          </div>
          <div class="space-y-4 p-5 font-mono text-[11px] leading-6">
            <div class="flex items-center justify-between text-emerald-300/80">
              <span>● SYSTEM ONLINE</span>
              <span class="text-slate-600">99.95%</span>
            </div>
            <div class="space-y-2 text-slate-400">
              <p><span class="text-violet-300">01</span> initialize <span class="text-cyan-200">intelligence.layer</span></p>
              <p><span class="text-violet-300">02</span> connect <span class="text-cyan-200">data.pipeline</span></p>
              <p><span class="text-violet-300">03</span> deploy <span class="text-cyan-200">cloud.native</span></p>
            </div>
            <div class="h-20 rounded-md border border-white/8 bg-[#020b14] p-3">
              <div class="flex h-full items-end gap-1.5">
                <span
                  v-for="height in [35, 62, 44, 78, 52, 88, 66, 94, 72, 84, 58, 96]"
                  :key="height"
                  class="flex-1 rounded-sm bg-gradient-to-t from-cyan-500/25 to-cyan-300/80"
                  :style="{ height: `${height}%` }"
                />
              </div>
            </div>
            <div class="flex items-center justify-between text-[9px] tracking-widest text-slate-600">
              <span>SECURE BY DESIGN</span>
              <span class="text-cyan-300/70">LIVE</span>
            </div>
          </div>
        </div>

        <div class="hero-float-card">
          <span class="font-mono text-[9px] tracking-[0.18em] text-cyan-300/70">DELIVERY VELOCITY</span>
          <strong class="mt-1 block text-2xl font-semibold text-white">40%<span class="text-cyan-300">↑</span></strong>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-headline {
  word-break: auto-phrase;
}

.hero-console {
  transform: perspective(900px) rotateY(-5deg) rotateX(2deg);
}

.hero-float-card {
  position: absolute;
  bottom: 2rem;
  left: -0.5rem;
  border: 1px solid rgba(88, 229, 255, 0.18);
  border-radius: 0.75rem;
  background: rgba(4, 17, 31, 0.86);
  padding: 0.85rem 1rem;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
}

.hero-orbit {
  position: absolute;
  top: -5rem;
  right: -2rem;
  width: 20rem;
  height: 20rem;
  opacity: 0.7;
}

.orbit-ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(88, 229, 255, 0.13);
  border-radius: 50%;
}

.orbit-ring-b {
  inset: 2.7rem;
  border-style: dashed;
  border-color: rgba(139, 125, 255, 0.18);
  animation: orbit-spin 24s linear infinite;
}

.orbit-core {
  position: absolute;
  inset: 7.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(88, 229, 255, 0.25);
  border-radius: 50%;
  background: rgba(88, 229, 255, 0.06);
  color: rgba(140, 241, 255, 0.6);
  font-family: var(--font-mono);
  font-size: 1.35rem;
}

.orbit-node {
  position: absolute;
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 12px var(--cyan);
}

.orbit-node-a {
  top: 1.8rem;
  left: 4.1rem;
}

.orbit-node-b {
  top: 10.8rem;
  right: -0.05rem;
}

.orbit-node-c {
  bottom: 1.2rem;
  left: 6rem;
  background: var(--violet);
  box-shadow: 0 0 12px var(--violet);
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1023px) {
  .hero-console {
    transform: none;
  }

  .hero-orbit {
    top: -6rem;
    right: -6rem;
    opacity: 0.45;
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-ring-b {
    animation: none;
  }
}
</style>

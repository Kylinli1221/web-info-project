<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  summary?: string
}>()
</script>

<template>
  <section class="relative overflow-hidden border-b border-white/8 bg-[#061526]">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(88,229,255,0.1),transparent_24rem)]" />
    <div class="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(88,229,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(88,229,255,0.06)_1px,transparent_1px)] [background-size:64px_64px]" />
    <div class="site-container relative py-20 lg:py-28">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1 class="mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
        {{ title }}
      </h1>
      <p v-if="summary" class="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
        {{ summary }}
      </p>
    </div>
  </section>
</template>

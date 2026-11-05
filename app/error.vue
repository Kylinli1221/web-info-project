<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t, locale } = useI18n()
const home = computed(() => `/${locale.value === 'en' ? 'en' : 'zh'}`)
const isNotFound = computed(() => props.error.statusCode === 404)

useHead({ title: isNotFound.value ? t('errors.notFoundTitle') : t('errors.serverTitle') })
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header class="site-container flex h-20 items-center justify-between">
      <NuxtLink :to="home" class="flex items-center gap-3">
        <span class="logo-mark" aria-hidden="true">N</span>
        <span class="text-sm font-semibold tracking-[0.2em] text-white">NEXORA</span>
      </NuxtLink>
      <LanguageSwitch />
    </header>
    <main class="site-container flex flex-1 flex-col justify-center py-20">
      <p class="eyebrow">ERROR / {{ error.statusCode }}</p>
      <h1 class="section-title">
        {{ isNotFound ? t('errors.notFoundTitle') : t('errors.serverTitle') }}
      </h1>
      <p class="section-summary">
        {{ isNotFound ? t('errors.notFoundDescription') : t('errors.serverDescription') }}
      </p>
      <button type="button" class="btn-primary mt-8 self-start" @click="clearError({ redirect: home })">
        {{ t('actions.backHome') }}
      </button>
    </main>
  </div>
</template>

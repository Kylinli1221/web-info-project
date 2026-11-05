<script setup lang="ts">
import type { NavigationItem } from '~~/shared/types/content'
import { localize } from '~~/shared/types/content'
import { localizedPath } from '../../composables/useLocale'

defineProps<{
  navigation: NavigationItem[]
  logoUrl: string | null
  siteName: string
  contactUrl: string
}>()

const { locale, t } = useI18n()
const route = useRoute()
const dialog = ref<HTMLDialogElement | null>(null)
const titleId = useId()

function open() {
  dialog.value?.showModal()
}

function close() {
  dialog.value?.close()
}

watch(() => route.fullPath, close)

onBeforeUnmount(close)

function itemPath(url: string) {
  return localizedPath(locale.value === 'en' ? 'en' : 'zh', url)
}

function label(item: NavigationItem) {
  return localize(item.label, locale.value === 'en' ? 'en' : 'zh')
}
</script>

<template>
  <button
    type="button"
    class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 lg:hidden"
    :aria-label="t('nav.openMenu')"
    @click="open"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </svg>
  </button>

  <dialog
    ref="dialog"
    class="mobile-menu m-0 h-dvh max-h-none w-full max-w-none bg-[#061324] p-0 text-slate-100 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    :aria-labelledby="titleId"
    @click.self="close"
  >
    <div class="flex min-h-dvh flex-col px-5 py-5">
      <div class="flex items-center justify-between">
        <NuxtLink :to="localizedPath(locale === 'en' ? 'en' : 'zh', '/')" class="flex items-center gap-3" @click="close">
          <img v-if="logoUrl" :src="logoUrl" :alt="siteName" class="h-8 max-w-36 object-contain">
          <span v-else class="text-sm font-semibold tracking-[0.18em] text-white">{{ siteName }}</span>
        </NuxtLink>
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5"
          :aria-label="t('nav.closeMenu')"
          @click="close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <h2 :id="titleId" class="sr-only">{{ t('nav.primary') }}</h2>

      <nav class="mt-16 flex flex-col gap-1" :aria-label="t('nav.primary')">
        <NuxtLink
          v-for="(item, index) in navigation"
          :key="item.id"
          :to="itemPath(item.url)"
          class="group flex items-center justify-between border-b border-white/8 py-4 text-2xl font-medium tracking-tight"
          :class="route.path === itemPath(item.url) ? 'text-cyan-200' : 'text-slate-100'"
          @click="close"
        >
          <span>{{ label(item) }}</span>
          <span class="font-mono text-[10px] tracking-widest text-cyan-300/60">{{ String(index + 1).padStart(2, '0') }}</span>
        </NuxtLink>
      </nav>

      <div class="mt-auto space-y-5 pt-12">
        <LanguageSwitch />
        <NuxtLink
          :to="contactUrl"
          class="btn-primary w-full"
          @click="close"
        >
          {{ t('actions.contact') }}
        </NuxtLink>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.mobile-menu[open] {
  animation: menu-in 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mobile-menu[open] {
    animation: none;
  }
}
</style>

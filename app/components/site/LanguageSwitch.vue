<script setup lang="ts">
import type { Locale } from '~~/shared/types/content'
import { switchLocalePath } from '../../composables/useLocale'

const route = useRoute()
const { locale, t } = useI18n()
const preference = useCookie<Locale>('nexora_locale', {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  path: '/',
})

function targetLink(target: Locale) {
  return { path: switchLocalePath(route.path, target), query: route.query }
}

function save(target: Locale) {
  preference.value = target
}
</script>

<template>
  <nav class="flex items-center gap-1 text-xs font-semibold tracking-widest" :aria-label="t('nav.switchLanguage')">
    <span class="sr-only">{{ t('nav.switchLanguage') }}</span>
    <NuxtLink
      :to="targetLink('zh')"
      hreflang="zh"
      class="rounded-full px-2.5 py-1.5 transition"
      :class="locale === 'zh' ? 'bg-cyan-300/15 text-cyan-200' : 'text-slate-400 hover:text-white'"
      @click="save('zh')"
    >
      中文
    </NuxtLink>
    <span class="text-slate-600" aria-hidden="true">/</span>
    <NuxtLink
      :to="targetLink('en')"
      hreflang="en"
      class="rounded-full px-2.5 py-1.5 transition"
      :class="locale === 'en' ? 'bg-cyan-300/15 text-cyan-200' : 'text-slate-400 hover:text-white'"
      @click="save('en')"
    >
      EN
    </NuxtLink>
  </nav>
</template>

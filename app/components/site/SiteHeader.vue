<script setup lang="ts">
import { localize } from '~~/shared/types/content'
import { localizedPath } from '../../composables/useLocale'

const { site } = useSiteContent()
const { locale, t } = useI18n()
const route = useRoute()

const currentLocale = computed(() => locale.value === 'en' ? 'en' : 'zh')
const settings = computed(() => site.value?.settings)
const navigation = computed(() => site.value?.navigation ?? [])
const siteName = computed(() => localize(settings.value?.siteName, currentLocale.value))
const logoUrl = computed(() => settings.value?.logoLightUrl ?? settings.value?.logoDarkUrl ?? null)
const contactUrl = computed(() => localizedPath(currentLocale.value, '/contact'))
const homeUrl = computed(() => localizedPath(currentLocale.value, '/'))

function itemPath(url: string) {
  return localizedPath(currentLocale.value, url)
}

function itemLabel(label: unknown) {
  return localize(label, currentLocale.value)
}
</script>

<template>
  <header class="site-header">
    <div class="site-container flex h-[76px] items-center justify-between gap-6">
      <NuxtLink :to="homeUrl" class="group flex min-w-0 items-center gap-3" :aria-label="t('nav.homeLabel')">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          :alt="siteName"
          class="h-9 max-w-44 object-contain object-left"
        >
        <template v-else>
          <span class="logo-mark" aria-hidden="true">N</span>
          <span class="truncate text-sm font-semibold tracking-[0.2em] text-white">{{ siteName }}</span>
        </template>
      </NuxtLink>

      <nav class="hidden items-center gap-7 lg:flex" :aria-label="t('nav.primary')">
        <NuxtLink
          v-for="item in navigation"
          :key="item.id"
          :to="itemPath(item.url)"
          class="nav-link"
          :class="{ 'nav-link-active': route.path === itemPath(item.url) }"
          :aria-current="route.path === itemPath(item.url) ? 'page' : undefined"
        >
          {{ itemLabel(item.label) }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-3">
        <LanguageSwitch class="hidden sm:flex" />
        <NuxtLink :to="contactUrl" class="btn-primary hidden !px-5 !py-2.5 md:inline-flex">
          {{ t('actions.contact') }}
        </NuxtLink>
        <MobileMenu
          :navigation="navigation"
          :logo-url="logoUrl"
          :site-name="siteName"
          :contact-url="contactUrl"
        />
      </div>
    </div>
  </header>
</template>

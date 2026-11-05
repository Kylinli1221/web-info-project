<script setup lang="ts">
import { localize } from '~~/shared/types/content'
import { localizedPath } from '../../composables/useLocale'

const { site } = useSiteContent()
const { locale, t } = useI18n()
const currentLocale = computed(() => locale.value === 'en' ? 'en' : 'zh')
const settings = computed(() => site.value?.settings)
const navigation = computed(() => site.value?.navigation ?? [])
const footer = computed(() => settings.value?.footer)
const siteName = computed(() => localize(settings.value?.siteName, currentLocale.value))
const logoUrl = computed(() => settings.value?.logoDarkUrl ?? settings.value?.logoLightUrl ?? null)
const currentYear = new Date().getFullYear()

function itemPath(url: string) {
  return localizedPath(currentLocale.value, url)
}

function local(value: unknown) {
  return localize(value, currentLocale.value)
}
</script>

<template>
  <footer class="relative overflow-hidden border-t border-white/8 bg-[#030b16]">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
    <div class="site-container py-16 lg:py-20">
      <div class="grid gap-12 lg:grid-cols-[1.4fr_0.7fr_0.9fr_1fr]">
        <div>
          <NuxtLink :to="localizedPath(currentLocale, '/')" class="inline-flex items-center gap-3">
            <img v-if="logoUrl" :src="logoUrl" :alt="siteName" class="h-9 max-w-44 object-contain">
            <template v-else>
              <span class="logo-mark" aria-hidden="true">N</span>
              <span class="text-sm font-semibold tracking-[0.2em] text-white">{{ siteName }}</span>
            </template>
          </NuxtLink>
          <p class="mt-5 max-w-sm text-sm leading-7 text-slate-400">
            {{ local(settings?.seo.description) }}
          </p>
        </div>

        <div>
          <h2 class="footer-heading">{{ t('footer.navigation') }}</h2>
          <ul class="mt-5 space-y-3">
            <li v-for="item in navigation" :key="item.id">
              <NuxtLink :to="itemPath(item.url)" class="footer-link">{{ local(item.label) }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h2 class="footer-heading">{{ t('footer.contact') }}</h2>
          <ul class="mt-5 space-y-3 text-sm text-slate-400">
            <li v-if="settings?.contactEmail">
              <a :href="`mailto:${settings.contactEmail}`" class="footer-link">{{ settings.contactEmail }}</a>
            </li>
            <li v-if="settings?.phone">
              <a :href="`tel:${settings.phone.replace(/[^\d+]/g, '')}`" class="footer-link">{{ settings.phone }}</a>
            </li>
            <li v-if="local(settings?.address)" class="leading-6">{{ local(settings?.address) }}</li>
          </ul>
        </div>

        <div v-if="settings?.socialLinks.length">
          <h2 class="footer-heading">{{ t('footer.follow') }}</h2>
          <ul class="mt-5 flex flex-wrap gap-2">
            <li v-for="(link, index) in settings.socialLinks" :key="`${link.url}-${index}`">
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/4 px-3 text-xs text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-200"
              >
                {{ local(link.label) }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-14 flex flex-col gap-4 border-t border-white/8 pt-6 text-xs text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <p>{{ local(footer?.copyright) || `© ${currentYear} ${siteName}` }}</p>
        <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            v-if="footer?.icpNumber"
            :href="footer.icpUrl || 'https://beian.miit.gov.cn/'"
            target="_blank"
            rel="noopener noreferrer"
            class="transition hover:text-slate-300"
          >
            {{ footer.icpNumber }}
          </a>
          <a
            v-if="footer?.publicSecurityNumber && footer.publicSecurityUrl"
            :href="footer.publicSecurityUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="transition hover:text-slate-300"
          >
            {{ footer.publicSecurityNumber }}
          </a>
          <span v-else-if="footer?.publicSecurityNumber">{{ footer.publicSecurityNumber }}</span>
          <NuxtLink
            v-for="(link, index) in footer?.links ?? []"
            :key="`${link.url}-${index}`"
            :to="link.url.startsWith('http') ? link.url : itemPath(link.url)"
            :target="link.url.startsWith('http') ? '_blank' : undefined"
            :rel="link.url.startsWith('http') ? 'noopener noreferrer' : undefined"
            class="transition hover:text-slate-300"
          >
            {{ local(link.label) }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

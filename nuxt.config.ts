import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxtjs/i18n', '@element-plus/nuxt'],
  css: ['~/assets/css/main.css'],
  components: [
    { path: '~/components/site', pathPrefix: false },
    { path: '~/components/admin', pathPrefix: false },
  ],
  vite: { plugins: [tailwindcss()] },
  typescript: { strict: true, typeCheck: true },
  compatibilityDate: '2026-10-30',
  runtimeConfig: {
    public: {
      siteUrl: process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000',
    },
  },
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'zh',
    locales: [
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    langDir: 'locales',
    detectBrowserLanguage: false,
  },
})

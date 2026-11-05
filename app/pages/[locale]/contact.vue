<script setup lang="ts">
import { localize } from '~~/shared/types/content'

const { t } = useI18n()
const locale = useCurrentLocale()
const { site } = useSiteContent()

const { data: home } = await useAsyncData('contact-home', () => $fetch<Array<{
  id: string
  type: string
  content: Record<string, unknown>
}>>('/api/home'))
const contact = computed(() => home.value?.find(section => section.type === 'contact'))
const settings = computed(() => site.value?.settings)
const title = computed(() => localize(contact.value?.content.title, locale.value) || t('contact.title'))
const summary = computed(() => localize(contact.value?.content.summary, locale.value) || t('contact.intro'))
const eyebrow = computed(() => localize(contact.value?.content.eyebrow, locale.value) || t('contact.eyebrow'))
const address = computed(() => settings.value?.address ? localize(settings.value.address, locale.value) : '')
const email = computed(() => settings.value?.contactEmail || '')
const phone = computed(() => settings.value?.phone || '')

useSeo({ title: t('contact.eyebrow'), description: summary.value, path: '/contact' })
</script>

<template>
  <div>
    <PageHeader :eyebrow="eyebrow.toUpperCase()" :title="title" :summary="summary" />

    <section class="site-container grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-24">
      <div class="tech-card p-6 sm:p-10">
        <p class="font-mono text-[10px] tracking-[0.2em] text-cyan-300/70">PROJECT / INQUIRY</p>
        <div class="mt-8">
          <ContactForm />
        </div>
      </div>

      <aside class="space-y-5">
        <div class="tech-card p-6">
          <p class="font-mono text-[10px] tracking-[0.2em] text-cyan-300/70">{{ t('footer.contact').toUpperCase() }}</p>
          <ul class="mt-6 space-y-5 text-sm">
            <li v-if="email">
              <span class="block text-[10px] uppercase tracking-widest text-slate-500">EMAIL</span>
              <a :href="`mailto:${email}`" class="mt-1 block text-slate-200 transition hover:text-cyan-200">{{ email }}</a>
            </li>
            <li v-if="phone">
              <span class="block text-[10px] uppercase tracking-widest text-slate-500">TEL</span>
              <a :href="`tel:${phone.replace(/[^\d+]/g, '')}`" class="mt-1 block text-slate-200 transition hover:text-cyan-200">{{ phone }}</a>
            </li>
            <li v-if="address">
              <span class="block text-[10px] uppercase tracking-widest text-slate-500">ADDRESS</span>
              <span class="mt-1 block leading-6 text-slate-300">{{ address }}</span>
            </li>
          </ul>
        </div>

        <div class="relative overflow-hidden rounded-xl border border-white/10 bg-[#061a2c] p-6">
          <div class="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(88,229,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(88,229,255,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div class="relative flex h-44 items-center justify-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/8 font-mono text-2xl text-cyan-200">N</div>
            <div class="absolute h-36 w-36 rounded-full border border-dashed border-cyan-300/15" />
            <span class="absolute bottom-2 left-2 font-mono text-[9px] tracking-widest text-slate-600">SHANGHAI / CN</span>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

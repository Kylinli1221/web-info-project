<script setup lang="ts">
const { t, locale } = useI18n()
const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  message: '',
  website: '',
})
const state = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
const errors = ref<Record<string, string>>({})

function validate() {
  const next: Record<string, string> = {}
  if (!form.name.trim()) next.name = t('contact.form.required')
  if (!form.email.trim()) next.email = t('contact.form.required')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t('contact.form.invalidEmail')
  if (form.message.trim().length < 10) next.message = t('contact.form.required')
  errors.value = next
  return Object.keys(next).length === 0
}

async function submit() {
  if (state.value === 'submitting' || !validate()) return
  state.value = 'submitting'
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        message: form.message.trim(),
        locale: locale.value === 'en' ? 'en' : 'zh',
        website: form.website,
      },
    })
    state.value = 'success'
    Object.assign(form, { name: '', email: '', phone: '', company: '', message: '', website: '' })
  } catch {
    state.value = 'error'
  }
}
</script>

<template>
  <form class="space-y-5" novalidate @submit.prevent="submit">
    <div class="grid gap-5 sm:grid-cols-2">
      <div>
        <label for="contact-name" class="form-label">{{ t('contact.form.name') }} *</label>
        <input
          id="contact-name"
          v-model="form.name"
          class="form-control"
          type="text"
          name="name"
          autocomplete="name"
          :placeholder="t('contact.form.namePlaceholder')"
          :aria-invalid="Boolean(errors.name)"
          :aria-describedby="errors.name ? 'contact-name-error' : undefined"
        >
        <p v-if="errors.name" id="contact-name-error" class="mt-2 text-xs text-rose-300">{{ errors.name }}</p>
      </div>
      <div>
        <label for="contact-email" class="form-label">{{ t('contact.form.email') }} *</label>
        <input
          id="contact-email"
          v-model="form.email"
          class="form-control"
          type="email"
          name="email"
          autocomplete="email"
          :placeholder="t('contact.form.emailPlaceholder')"
          :aria-invalid="Boolean(errors.email)"
          :aria-describedby="errors.email ? 'contact-email-error' : undefined"
        >
        <p v-if="errors.email" id="contact-email-error" class="mt-2 text-xs text-rose-300">{{ errors.email }}</p>
      </div>
      <div>
        <label for="contact-phone" class="form-label">{{ t('contact.form.phone') }}</label>
        <input
          id="contact-phone"
          v-model="form.phone"
          class="form-control"
          type="tel"
          name="phone"
          autocomplete="tel"
          :placeholder="t('contact.form.phonePlaceholder')"
        >
      </div>
      <div>
        <label for="contact-company" class="form-label">{{ t('contact.form.company') }}</label>
        <input
          id="contact-company"
          v-model="form.company"
          class="form-control"
          type="text"
          name="company"
          autocomplete="organization"
          :placeholder="t('contact.form.companyPlaceholder')"
        >
      </div>
    </div>

    <div>
      <label for="contact-message" class="form-label">{{ t('contact.form.message') }} *</label>
      <textarea
        id="contact-message"
        v-model="form.message"
        class="form-control min-h-36 resize-y"
        name="message"
        :placeholder="t('contact.form.messagePlaceholder')"
        :aria-invalid="Boolean(errors.message)"
        :aria-describedby="errors.message ? 'contact-message-error' : undefined"
      />
      <p v-if="errors.message" id="contact-message-error" class="mt-2 text-xs text-rose-300">{{ errors.message }}</p>
    </div>

    <div class="hidden" aria-hidden="true">
      <label for="contact-website">Website</label>
      <input id="contact-website" v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off">
    </div>

    <div class="flex flex-wrap items-center gap-4 pt-2">
      <button type="submit" class="btn-primary" :disabled="state === 'submitting'">
        {{ state === 'submitting' ? t('contact.form.submitting') : t('contact.form.submit') }}
      </button>
      <p v-if="state === 'success'" role="status" class="text-sm text-emerald-300">{{ t('contact.form.success') }}</p>
      <p v-if="state === 'error'" role="alert" class="text-sm text-rose-300">{{ t('contact.form.error') }}</p>
    </div>
  </form>
</template>

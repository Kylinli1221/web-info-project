<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'admin-guest' })
useHead({ title: '后台登录 | NEXORA CMS' })

const route = useRoute()
const { login } = useAdminSession()
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!form.email || !form.password || loading.value) return
  loading.value = true
  error.value = ''
  try {
    await login(form.email, form.password)
    const redirect = String(route.query.redirect || '/admin')
    await navigateTo(redirect.startsWith('/admin') ? redirect : '/admin')
  } catch {
    error.value = '邮箱或密码不正确，或登录尝试过于频繁。'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#06111f] px-4 py-12">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(88,229,255,0.12),transparent_28rem),radial-gradient(circle_at_80%_80%,rgba(139,125,255,0.1),transparent_24rem)]" />
    <div class="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(88,229,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(88,229,255,0.08)_1px,transparent_1px)] [background-size:64px_64px]" />

    <div class="relative w-full max-w-md">
      <div class="mb-8 flex items-center gap-3">
        <span class="logo-mark" aria-hidden="true">N</span>
        <div>
          <p class="text-sm font-semibold tracking-[0.18em] text-white">NEXORA CMS</p>
          <p class="mt-0.5 font-mono text-[9px] tracking-[0.18em] text-slate-500">CONTENT CONTROL PLANE</p>
        </div>
      </div>

      <div class="rounded-2xl border border-white/10 bg-[#08192b]/90 p-7 shadow-2xl shadow-black/30 backdrop-blur sm:p-9">
        <p class="font-mono text-[10px] tracking-[0.2em] text-cyan-300/70">AUTHORIZED ACCESS</p>
        <h1 class="mt-3 text-2xl font-semibold tracking-tight text-white">登录管理后台</h1>
        <p class="mt-2 text-sm leading-6 text-slate-400">维护站点资料、发布内容并查看客户留言。</p>

        <form class="mt-8 space-y-5" @submit.prevent="submit">
          <div>
            <label for="admin-email" class="form-label">管理员邮箱</label>
            <input
              id="admin-email"
              v-model="form.email"
              class="form-control"
              type="email"
              autocomplete="username"
              required
              placeholder="admin@example.com"
            >
          </div>
          <div>
            <label for="admin-password" class="form-label">密码</label>
            <input
              id="admin-password"
              v-model="form.password"
              class="form-control"
              type="password"
              autocomplete="current-password"
              required
              placeholder="••••••••••••••••"
            >
          </div>
          <p v-if="error" role="alert" class="rounded-lg border border-rose-400/20 bg-rose-400/8 px-3 py-2 text-xs text-rose-200">
            {{ error }}
          </p>
          <button type="submit" class="btn-primary w-full" :disabled="loading">
            {{ loading ? '正在验证…' : '进入后台' }}
          </button>
        </form>
      </div>

      <NuxtLink to="/zh" class="mt-6 block text-center text-xs text-slate-500 transition hover:text-cyan-200">← 返回官网</NuxtLink>
    </div>
  </div>
</template>

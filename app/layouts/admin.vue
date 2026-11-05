<script setup lang="ts">
const open = ref(false)
const route = useRoute()
const { user } = useAdminSession()

const titles: Record<string, string> = {
  '/admin': '工作台',
  '/admin/settings': '站点设置',
  '/admin/navigation': '导航管理',
  '/admin/home': '首页内容',
  '/admin/solutions': '解决方案',
  '/admin/cases': '客户案例',
  '/admin/news': '新闻动态',
  '/admin/media': '媒体库',
  '/admin/messages': '联系留言',
  '/admin/account': '账号设置',
}

const pageTitle = computed(() => {
  const exact = titles[route.path]
  if (exact) return exact
  const base = Object.keys(titles).find(key => key !== '/admin' && route.path.startsWith(key))
  return base ? titles[base] : '管理后台'
})

useHead(() => ({ title: `${pageTitle.value} | NEXORA CMS` }))

watch(() => route.fullPath, () => {
  open.value = false
})
</script>

<template>
  <div class="admin-shell min-h-dvh bg-slate-100 text-slate-900">
    <AdminSidebar :open="open" @close="open = false" />
    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
      aria-hidden="true"
      @click="open = false"
    />

    <div class="lg:pl-64">
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 lg:hidden"
            aria-label="打开菜单"
            @click="open = true"
          >
            ☰
          </button>
          <div>
            <p class="font-mono text-[9px] tracking-[0.18em] text-slate-400">NEXORA / ADMIN</p>
            <h1 class="text-sm font-semibold text-slate-900">{{ pageTitle }}</h1>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink to="/zh" target="_blank" class="hidden text-xs text-slate-500 transition hover:text-cyan-700 sm:inline-flex">
            查看官网 ↗
          </NuxtLink>
          <span class="hidden h-4 w-px bg-slate-200 sm:block" />
          <span class="text-xs text-slate-500">{{ user?.name }}</span>
        </div>
      </header>

      <main class="p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  font-family: var(--font-sans);
}

:deep(.el-button--primary) {
  --el-button-bg-color: #0e7490;
  --el-button-border-color: #0e7490;
  --el-button-hover-bg-color: #155e75;
  --el-button-hover-border-color: #155e75;
}

:deep(.el-tabs__active-bar) {
  background-color: #0e7490;
}

:deep(.el-tabs__item.is-active) {
  color: #0e7490;
}
</style>

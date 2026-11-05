<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const { user, logout } = useAdminSession()

const groups = [
  {
    label: '概览',
    items: [{ to: '/admin', label: '工作台', code: '00' }],
  },
  {
    label: '站点',
    items: [
      { to: '/admin/settings', label: '站点设置', code: '01' },
      { to: '/admin/navigation', label: '导航管理', code: '02' },
      { to: '/admin/home', label: '首页内容', code: '03' },
    ],
  },
  {
    label: '内容',
    items: [
      { to: '/admin/solutions', label: '解决方案', code: '04' },
      { to: '/admin/cases', label: '客户案例', code: '05' },
      { to: '/admin/news', label: '新闻动态', code: '06' },
      { to: '/admin/media', label: '媒体库', code: '07' },
      { to: '/admin/messages', label: '联系留言', code: '08' },
    ],
  },
  {
    label: '系统',
    items: [{ to: '/admin/users', label: '管理员管理', code: '09' }],
  },
]

function active(path: string) {
  return path === '/admin' ? route.path === '/admin' : route.path.startsWith(path)
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#071322] text-slate-300 transition-transform duration-300 lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex h-16 items-center justify-between border-b border-slate-800 px-5">
      <NuxtLink to="/admin" class="flex items-center gap-3 text-white">
        <span class="logo-mark" aria-hidden="true">N</span>
        <span class="text-xs font-semibold tracking-[0.18em]">NEXORA CMS</span>
      </NuxtLink>
      <button type="button" class="text-slate-400 lg:hidden" aria-label="关闭菜单" @click="emit('close')">✕</button>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-5">
      <div v-for="group in groups" :key="group.label" class="mb-6">
        <p class="px-3 font-mono text-[9px] tracking-[0.2em] text-slate-600">{{ group.label.toUpperCase() }}</p>
        <div class="mt-2 space-y-1">
          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition"
            :class="active(item.to) ? 'bg-cyan-300/10 text-cyan-200' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
            @click="emit('close')"
          >
            <span>{{ item.label }}</span>
            <span class="font-mono text-[9px] opacity-50">{{ item.code }}</span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div class="border-t border-slate-800 p-4">
      <div class="mb-3 flex items-center gap-3">
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-300/12 text-sm font-medium text-cyan-200">
          {{ user?.name?.slice(0, 1).toUpperCase() || 'A' }}
        </span>
        <div class="min-w-0">
          <p class="truncate text-xs font-medium text-slate-200">{{ user?.name }}</p>
          <p class="truncate text-[10px] text-slate-600">{{ user?.email }}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <NuxtLink to="/admin/account" class="rounded-md border border-slate-700 py-1.5 text-center text-[11px] text-slate-400 transition hover:text-white">账号</NuxtLink>
        <button type="button" class="rounded-md border border-slate-700 py-1.5 text-[11px] text-slate-400 transition hover:text-white" @click="logout">退出</button>
      </div>
    </div>
  </aside>
</template>

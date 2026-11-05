<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

interface DashboardData {
  counts: {
    solutions: { published: number; draft: number }
    cases: { published: number; draft: number }
    news: { published: number; draft: number }
    unreadMessages: number
  }
  latestMessages: Array<{
    id: string
    name: string
    email: string
    phone: string | null
    company: string | null
    message: string
    locale: string
    isRead: boolean
    createdAt: string
  }>
}

const requestFetch = useRequestFetch()
const { data } = await useAsyncData('admin-dashboard', () => requestFetch<DashboardData>('/api/admin/dashboard'))

const cards = computed(() => [
  { label: '解决方案', published: data.value?.counts.solutions.published ?? 0, draft: data.value?.counts.solutions.draft ?? 0, to: '/admin/solutions' },
  { label: '客户案例', published: data.value?.counts.cases.published ?? 0, draft: data.value?.counts.cases.draft ?? 0, to: '/admin/cases' },
  { label: '新闻动态', published: data.value?.counts.news.published ?? 0, draft: data.value?.counts.news.draft ?? 0, to: '/admin/news' },
  { label: '未读留言', published: data.value?.counts.unreadMessages ?? 0, draft: 0, to: '/admin/messages' },
])

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <div class="rounded-xl border border-slate-200 bg-white p-6">
      <p class="font-mono text-[10px] tracking-[0.18em] text-cyan-700">CONTROL PLANE / OVERVIEW</p>
      <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">内容运营概览</h2>
      <p class="mt-2 text-sm text-slate-500">管理官网内容、品牌资料与客户消息。发布后的内容会立即出现在公开网站。</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <NuxtLink
        v-for="card in cards"
        :key="card.label"
        :to="card.to"
        class="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-cyan-600/40 hover:shadow-md"
      >
        <div class="flex items-start justify-between">
          <span class="text-xs text-slate-500">{{ card.label }}</span>
          <span class="text-slate-300 transition group-hover:text-cyan-700">↗</span>
        </div>
        <p class="mt-4 font-mono text-4xl font-semibold text-slate-900">{{ card.published }}</p>
        <p v-if="card.draft" class="mt-1 text-[11px] text-amber-600">另有 {{ card.draft }} 条草稿</p>
        <p v-else class="mt-1 text-[11px] text-slate-400">当前无草稿</p>
      </NuxtLink>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1fr_18rem]">
      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">最新留言</h3>
            <p class="mt-0.5 text-[11px] text-slate-400">官网联系表单提交记录</p>
          </div>
          <NuxtLink to="/admin/messages" class="text-xs text-cyan-700 hover:underline">查看全部</NuxtLink>
        </div>
        <div v-if="data?.latestMessages.length" class="divide-y divide-slate-100">
          <div v-for="message in data.latestMessages" :key="message.id" class="px-5 py-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-sm font-medium text-slate-800">
                {{ message.name }}
                <span class="ml-2 text-xs font-normal text-slate-400">{{ message.company || message.email }}</span>
              </p>
              <span class="text-[10px] text-slate-400">{{ formatDate(message.createdAt) }}</span>
            </div>
            <p class="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{{ message.message }}</p>
          </div>
        </div>
        <p v-else class="px-5 py-12 text-center text-sm text-slate-400">还没有收到留言</p>
      </div>

      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-slate-900">快捷操作</h3>
        <NuxtLink to="/admin/settings" class="block rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 transition hover:border-cyan-600/40">
          修改 Logo 与备案信息
        </NuxtLink>
        <NuxtLink to="/admin/home" class="block rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 transition hover:border-cyan-600/40">
          编辑首页双语内容
        </NuxtLink>
        <NuxtLink to="/admin/news" class="block rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 transition hover:border-cyan-600/40">
          发布一篇新闻
        </NuxtLink>
        <NuxtLink to="/zh" target="_blank" class="block rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 transition hover:border-cyan-600/40">
          查看官网效果 ↗
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

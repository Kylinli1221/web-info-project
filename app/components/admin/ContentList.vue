<script setup lang="ts">
import type { LocalizedText } from '~~/shared/types/content'
import { localize } from '~~/shared/types/content'

type ContentKind = 'solutions' | 'cases' | 'news'

interface AdminContent {
  id: string
  slug: string
  title: LocalizedText
  status: 'DRAFT' | 'PUBLISHED'
  sortOrder?: number
  updatedAt: string
  publishedAt: string | null
}

const props = defineProps<{ kind: ContentKind }>()
const requestFetch = useRequestFetch()
const filter = ref<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL')
const labels: Record<ContentKind, { title: string; singular: string; eyebrow: string }> = {
  solutions: { title: '解决方案', singular: '解决方案', eyebrow: 'SOLUTIONS' },
  cases: { title: '客户案例', singular: '客户案例', eyebrow: 'CASE STUDIES' },
  news: { title: '新闻动态', singular: '新闻', eyebrow: 'NEWSROOM' },
}

const { data, refresh } = await useAsyncData(
  () => `admin-content-${props.kind}`,
  () => requestFetch<AdminContent[]>(`/api/admin/${props.kind}`),
)

const items = computed(() => {
  const records = data.value ?? []
  return filter.value === 'ALL' ? records : records.filter(item => item.status === filter.value)
})

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}

async function remove(item: unknown) {
  const record = item as AdminContent
  try {
    await ElMessageBox.confirm(`确定删除“${localize(record.title, 'zh')}”吗？此操作不可撤销。`, '删除内容', { type: 'warning' })
    await $fetch(`/api/admin/${props.kind}/${record.id}`, { method: 'DELETE' })
    await refresh()
    ElMessage.success('内容已删除')
  } catch {
    // Cancelled or the API rejected the deletion.
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] tracking-[0.18em] text-cyan-700">{{ labels[kind].eyebrow }}</p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">{{ labels[kind].title }}</h2>
        <p class="mt-2 text-sm text-slate-500">管理双语内容、草稿和发布状态。</p>
      </div>
      <NuxtLink :to="`/admin/${kind}/new`">
        <el-button type="primary">新建{{ labels[kind].singular }}</el-button>
      </NuxtLink>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <el-radio-group v-model="filter" size="small">
          <el-radio-button value="ALL">全部</el-radio-button>
          <el-radio-button value="PUBLISHED">已发布</el-radio-button>
          <el-radio-button value="DRAFT">草稿</el-radio-button>
        </el-radio-group>
        <span class="text-[11px] text-slate-400">共 {{ items.length }} 条</span>
      </div>

      <el-table :data="items" style="width: 100%">
        <el-table-column label="标题" min-width="220">
          <template #default="{ row }">
            <NuxtLink :to="`/admin/${kind}/${row.id}`" class="block">
              <p class="text-sm font-medium text-slate-800 hover:text-cyan-700">{{ localize(row.title, 'zh') }}</p>
              <p class="mt-0.5 font-mono text-[10px] text-slate-400">{{ localize(row.title, 'en') }}</p>
            </NuxtLink>
          </template>
        </el-table-column>
        <el-table-column prop="slug" label="Slug" min-width="170" />
        <el-table-column v-if="kind !== 'news'" prop="sortOrder" label="排序" width="76" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'warning'" size="small">
              {{ row.status === 'PUBLISHED' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="120">
          <template #default="{ row }">
            <span class="text-[11px] text-slate-500">{{ formatDate(row.publishedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="right">
          <template #default="{ row }">
            <NuxtLink :to="`/admin/${kind}/${row.id}`"><el-button text type="primary">编辑</el-button></NuxtLink>
            <el-button text type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <p v-if="!items.length" class="py-12 text-center text-sm text-slate-400">暂无内容</p>
    </div>
  </div>
</template>

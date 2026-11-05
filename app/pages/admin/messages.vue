<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  message: string
  locale: string
  isRead: boolean
  createdAt: string
}

const requestFetch = useRequestFetch()
const page = ref(1)
const filter = ref<'ALL' | 'false' | 'true'>('ALL')
const selected = ref<ContactMessage | null>(null)
const dialog = ref(false)
const { data } = await useAsyncData(
  () => `admin-messages-${page.value}-${filter.value}`,
  () => {
    const query = new URLSearchParams({ page: String(page.value), pageSize: '20' })
    if (filter.value !== 'ALL') query.set('isRead', filter.value)
    return requestFetch<{ items: ContactMessage[]; page: number; pageSize: number; total: number }>(`/api/admin/messages?${query}`)
  },
  { watch: [page, filter] },
)
const lastPage = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / 20)))

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

async function open(message: ContactMessage) {
  selected.value = message
  dialog.value = true
  if (!message.isRead) {
    try {
      await $fetch(`/api/admin/messages/${message.id}`, {
        method: 'PUT',
        body: { isRead: true },
      })
      message.isRead = true
    } catch {
      ElMessage.error('更新已读状态失败')
    }
  }
}

watch(filter, () => { page.value = 1 })
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] tracking-[0.18em] text-cyan-700">CONTACT INBOX</p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">联系留言</h2>
        <p class="mt-2 text-sm text-slate-500">官网访客提交的项目咨询。打开留言会自动标记为已读。</p>
      </div>
      <el-radio-group v-model="filter" size="small">
        <el-radio-button value="ALL">全部</el-radio-button>
        <el-radio-button value="false">未读</el-radio-button>
        <el-radio-button value="true">已读</el-radio-button>
      </el-radio-group>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <el-table :data="data?.items ?? []" style="width: 100%" @row-click="open">
        <el-table-column width="36">
          <template #default="{ row }">
            <span class="block h-2 w-2 rounded-full" :class="row.isRead ? 'bg-slate-200' : 'bg-cyan-500'" />
          </template>
        </el-table-column>
        <el-table-column label="联系人" min-width="170">
          <template #default="{ row }">
            <p class="text-sm font-medium text-slate-800">{{ row.name }}</p>
            <p class="text-[10px] text-slate-400">{{ row.email }}</p>
          </template>
        </el-table-column>
        <el-table-column label="公司" min-width="140">
          <template #default="{ row }">
            <span class="text-xs text-slate-500">{{ row.company || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="留言" min-width="260">
          <template #default="{ row }">
            <p class="line-clamp-1 text-xs text-slate-500">{{ row.message }}</p>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="150">
          <template #default="{ row }">
            <span class="text-[10px] text-slate-400">{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isRead ? 'info' : 'success'" size="small">{{ row.isRead ? '已读' : '未读' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <p v-if="!data?.items.length" class="py-16 text-center text-sm text-slate-400">暂时没有符合条件的留言</p>
    </div>

    <div v-if="lastPage > 1" class="flex items-center justify-between">
      <el-button :disabled="page <= 1" @click="page--">上一页</el-button>
      <span class="font-mono text-[10px] text-slate-400">{{ page }} / {{ lastPage }}</span>
      <el-button :disabled="page >= lastPage" @click="page++">下一页</el-button>
    </div>

    <el-dialog v-model="dialog" title="留言详情" width="min(620px, 94vw)">
      <div v-if="selected" class="space-y-5">
        <div class="grid gap-3 rounded-lg bg-slate-50 p-4 text-xs sm:grid-cols-2">
          <p><span class="text-slate-400">姓名：</span>{{ selected.name }}</p>
          <p><span class="text-slate-400">邮箱：</span><a :href="`mailto:${selected.email}`" class="text-cyan-700">{{ selected.email }}</a></p>
          <p><span class="text-slate-400">公司：</span>{{ selected.company || '—' }}</p>
          <p><span class="text-slate-400">电话：</span>{{ selected.phone || '—' }}</p>
          <p><span class="text-slate-400">来源语言：</span>{{ selected.locale }}</p>
          <p><span class="text-slate-400">提交时间：</span>{{ formatDate(selected.createdAt) }}</p>
        </div>
        <div>
          <p class="mb-2 text-xs font-medium text-slate-500">项目需求</p>
          <p class="whitespace-pre-wrap rounded-lg border border-slate-200 p-4 text-sm leading-7 text-slate-700">{{ selected.message }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialog = false">关闭</el-button>
        <el-button v-if="selected" tag="a" :href="`mailto:${selected.email}`" type="primary">回复邮件</el-button>
      </template>
    </el-dialog>
  </div>
</template>

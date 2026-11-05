<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

interface HomeSectionAdmin {
  id: string
  type: string
  content: Record<string, unknown>
  sortOrder: number
  visible: boolean
}

const requestFetch = useRequestFetch()
const { data, refresh } = await useAsyncData('admin-home', () => requestFetch<HomeSectionAdmin[]>('/api/admin/home'))
const dialog = ref(false)
const saving = ref(false)
const editing = ref<HomeSectionAdmin | null>(null)

const typeLabels: Record<string, string> = {
  hero: '首屏 Hero',
  capabilities: '核心能力',
  metrics: '数据指标',
  solutions: '解决方案精选',
  cases: '案例精选',
  news: '新闻精选',
  about: '关于我们',
  contact: '联系区域',
}

function openEdit(section: HomeSectionAdmin) {
  editing.value = structuredClone(section)
  dialog.value = true
}

function sectionPreview(content: Record<string, unknown>): string {
  const pick = (value: unknown): string => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>
      return typeof record.zh === 'string' ? record.zh : ''
    }
    return ''
  }
  const parts = [content.title, content.headline, content.summary, content.email]
    .map(pick)
    .filter(Boolean)
  return parts.join(' · ').slice(0, 160)
}

async function save() {
  if (!editing.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/home/${editing.value.id}`, {
      method: 'PUT',
      body: {
        content: editing.value.content,
        sortOrder: editing.value.sortOrder,
        visible: editing.value.visible,
      },
    })
    await refresh()
    dialog.value = false
    ElMessage.success('首页模块已保存')
  } catch {
    ElMessage.error('保存失败，请检查内容后重试')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <div>
      <p class="font-mono text-[10px] tracking-[0.18em] text-cyan-700">HOMEPAGE COMPOSER</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">首页内容</h2>
      <p class="mt-2 text-sm text-slate-500">按模块维护双语内容、显示顺序与可见性。文本均为中文 / English 双语字段。</p>
    </div>

    <div class="grid gap-4">
      <article v-for="section in data ?? []" :key="section.id" class="rounded-xl border border-slate-200 bg-white p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <span class="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 font-mono text-[10px] text-slate-500">{{ section.sortOrder }}</span>
            <div>
              <h3 class="text-sm font-semibold text-slate-800">{{ typeLabels[section.type] || section.type }}</h3>
              <p class="mt-1 font-mono text-[10px] text-slate-400">{{ section.type }} / {{ section.id }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <el-tag :type="section.visible ? 'success' : 'info'" size="small">{{ section.visible ? '显示' : '隐藏' }}</el-tag>
            <el-button size="small" @click="openEdit(section)">编辑内容</el-button>
          </div>
        </div>
        <p class="mt-4 line-clamp-2 text-xs leading-5 text-slate-500">
          {{ sectionPreview(section.content) }}
        </p>
      </article>
    </div>

    <el-dialog v-model="dialog" :title="`编辑模块 / ${editing ? typeLabels[editing.type] || editing.type : ''}`" width="min(900px, 96vw)">
      <div v-if="editing" class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-[10rem_10rem]">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">排序</label>
            <el-input-number v-model="editing.sortOrder" :min="0" :max="9999" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">显示</label>
            <div class="pt-2"><el-switch v-model="editing.visible" /></div>
          </div>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">模块内容</label>
          <HomeSectionForm v-model="editing.content" :type="editing.type" />
        </div>
      </div>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

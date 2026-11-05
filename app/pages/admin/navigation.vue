<script setup lang="ts">
import type { LocalizedText } from '~~/shared/types/content'
import { localize } from '~~/shared/types/content'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

interface NavItem {
  id: string
  label: LocalizedText
  url: string
  sortOrder: number
  visible: boolean
}

const requestFetch = useRequestFetch()
const { data, refresh } = await useAsyncData('admin-navigation', () => requestFetch<NavItem[]>('/api/admin/navigation'))
const dialog = ref(false)
const saving = ref(false)
const editing = ref<NavItem>({ id: '', label: { zh: '', en: '' }, url: '', sortOrder: 0, visible: true })

function openCreate() {
  editing.value = { id: '', label: { zh: '', en: '' }, url: '/', sortOrder: (data.value?.length ?? 0) * 10, visible: true }
  dialog.value = true
}

function openEdit(item: unknown) {
  editing.value = structuredClone(item as NavItem)
  dialog.value = true
}

async function save() {
  if (!editing.value.label.zh || !editing.value.url) {
    ElMessage.warning('请填写中文名称和链接')
    return
  }
  saving.value = true
  try {
    const payload = {
      label: editing.value.label,
      url: editing.value.url,
      sortOrder: editing.value.sortOrder,
      visible: editing.value.visible,
    }
    if (editing.value.id) {
      await $fetch(`/api/admin/navigation/${editing.value.id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/admin/navigation', { method: 'POST', body: payload })
    }
    await refresh()
    dialog.value = false
    ElMessage.success('导航已保存')
  } catch {
    ElMessage.error('保存失败，请检查链接格式')
  } finally {
    saving.value = false
  }
}

async function remove(item: unknown) {
  const record = item as NavItem
  try {
    await ElMessageBox.confirm(`确定删除“${localize(record.label, 'zh')}”吗？`, '删除导航', { type: 'warning' })
    await $fetch(`/api/admin/navigation/${record.id}`, { method: 'DELETE' })
    await refresh()
    ElMessage.success('导航已删除')
  } catch {
    // Cancelled or failed; no local row change.
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <div class="flex items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] tracking-[0.18em] text-cyan-700">NAVIGATION</p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">导航管理</h2>
        <p class="mt-2 text-sm text-slate-500">排序值越小越靠前；隐藏的导航不会出现在官网。</p>
      </div>
      <el-button type="primary" @click="openCreate">新增导航</el-button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <el-table :data="data ?? []" style="width: 100%">
        <el-table-column label="名称" min-width="180">
          <template #default="{ row }">
            <p class="text-sm font-medium text-slate-800">{{ localize(row.label, 'zh') }}</p>
            <p class="font-mono text-[10px] text-slate-400">{{ localize(row.label, 'en') }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="链接" min-width="160" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.visible ? 'success' : 'info'" size="small">{{ row.visible ? '显示' : '隐藏' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button text type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <p v-if="!data?.length" class="py-10 text-center text-sm text-slate-400">暂无导航</p>
    </div>

    <el-dialog v-model="dialog" :title="editing.id ? '编辑导航' : '新增导航'" width="min(620px, 94vw)">
      <div class="space-y-5">
        <LocalizedInput v-model="editing.label" label="导航名称" required :maxlength="60" />
        <div class="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">链接</label>
            <el-input v-model="editing.url" placeholder="/solutions" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">排序</label>
            <el-input-number v-model="editing.sortOrder" :min="0" :max="9999" controls-position="right" />
          </div>
        </div>
        <div>
          <span class="mr-3 text-sm text-slate-600">显示在官网</span>
          <el-switch v-model="editing.visible" />
        </div>
      </div>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

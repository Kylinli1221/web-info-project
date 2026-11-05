<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

interface MediaAsset {
  id: string
  url: string
  storageName: string
  originalName: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  createdAt: string
}

const requestFetch = useRequestFetch()
const page = ref(1)
const uploading = ref(false)
const input = ref<HTMLInputElement | null>(null)
const { data, refresh } = await useAsyncData(
  () => `admin-media-${page.value}`,
  () => requestFetch<{ items: MediaAsset[]; page: number; pageSize: number; total: number }>(`/api/admin/media?page=${page.value}&pageSize=24`),
  { watch: [page] },
)
const lastPage = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / 24)))

async function upload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const body = new FormData()
    body.append('file', file)
    await $fetch('/api/admin/media/upload', { method: 'POST', body })
    await refresh()
    ElMessage.success('图片已上传')
  } catch {
    ElMessage.error('上传失败，请确认图片格式和大小（最大 5 MiB）')
  } finally {
    uploading.value = false
    if (input.value) input.value.value = ''
  }
}

async function copy(asset: MediaAsset) {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}${asset.url}`)
    ElMessage.success('图片地址已复制')
  } catch {
    ElMessage.error('复制失败，请手动选择图片地址')
  }
}

async function remove(asset: MediaAsset) {
  try {
    await ElMessageBox.confirm('删除后不可恢复。被内容引用的图片无法删除。', '删除图片', { type: 'warning' })
    await $fetch(`/api/admin/media/${asset.id}`, { method: 'DELETE' })
    await refresh()
    ElMessage.success('图片已删除')
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 409) {
      ElMessage.error('这张图片仍被站点内容引用，请先移除引用')
    }
  }
}

function size(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] tracking-[0.18em] text-cyan-700">MEDIA LIBRARY</p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">媒体库</h2>
        <p class="mt-2 text-sm text-slate-500">支持 JPEG、PNG、WebP、GIF 和 SVG，单文件最大 5 MiB。</p>
      </div>
      <input ref="input" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" class="hidden" @change="upload">
      <el-button type="primary" :loading="uploading" @click="input?.click()">{{ uploading ? '上传中…' : '上传图片' }}</el-button>
    </div>

    <div v-if="data?.items.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="asset in data.items" :key="asset.id" class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div class="flex aspect-[16/9] items-center justify-center bg-slate-100 p-3">
          <img :src="asset.url" :alt="asset.originalName" class="max-h-full max-w-full object-contain">
        </div>
        <div class="p-4">
          <p class="truncate text-xs font-medium text-slate-700">{{ asset.originalName }}</p>
          <p class="mt-1 font-mono text-[10px] text-slate-400">{{ asset.mimeType }} · {{ size(asset.size) }}</p>
          <div class="mt-3 flex items-center justify-between gap-2">
            <el-button size="small" text @click="copy(asset)">复制地址</el-button>
            <el-button size="small" text type="danger" @click="remove(asset)">删除</el-button>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center">
      <p class="text-sm text-slate-400">还没有上传图片</p>
      <p class="mt-2 text-xs text-slate-400">可以在站点设置、内容封面或正文中使用图片地址。</p>
    </div>

    <div v-if="lastPage > 1" class="flex items-center justify-between">
      <el-button :disabled="page <= 1" @click="page--">上一页</el-button>
      <span class="font-mono text-[10px] text-slate-400">{{ page }} / {{ lastPage }}</span>
      <el-button :disabled="page >= lastPage" @click="page++">下一页</el-button>
    </div>
  </div>
</template>

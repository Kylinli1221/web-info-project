<script setup lang="ts">
defineProps<{
  modelValue: string | null
  label: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const input = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const error = ref('')

async function upload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  error.value = ''
  try {
    const body = new FormData()
    body.append('file', file)
    const asset = await $fetch<{ url: string }>('/api/admin/media/upload', {
      method: 'POST',
      body,
    })
    emit('update:modelValue', asset.url)
    ElMessage.success('图片已上传')
  } catch {
    error.value = '上传失败，请确认图片小于 5 MiB 且格式受支持。'
  } finally {
    uploading.value = false
    if (input.value) input.value.value = ''
  }
}
</script>

<template>
  <div>
    <label class="mb-2 block text-sm font-medium text-slate-700">{{ label }}</label>
    <div class="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div class="flex h-16 w-24 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
        <img v-if="modelValue" :src="modelValue" alt="" class="h-full w-full object-contain">
        <span v-else class="text-[10px] text-slate-400">暂无图片</span>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <input
          ref="input"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          class="hidden"
          @change="upload"
        >
        <el-button :loading="uploading" @click="input?.click()">
          {{ uploading ? '上传中…' : '上传图片' }}
        </el-button>
        <el-button v-if="modelValue" text type="danger" @click="emit('update:modelValue', null)">移除</el-button>
        <span class="max-w-56 truncate font-mono text-[10px] text-slate-400">{{ modelValue || '相对 /media URL' }}</span>
      </div>
    </div>
    <p v-if="error" class="mt-2 text-xs text-rose-500">{{ error }}</p>
  </div>
</template>

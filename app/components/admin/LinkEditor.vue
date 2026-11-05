<script setup lang="ts">
import type { LocalizedText } from '~~/shared/types/content'

interface EditableLink {
  label: LocalizedText
  url: string
}

const props = defineProps<{ link: EditableLink }>()
const emit = defineEmits<{
  update: [value: EditableLink]
  remove: []
}>()

function setLabel(value: LocalizedText) {
  emit('update', { ...props.link, label: value })
}

function setUrl(value: string) {
  emit('update', { ...props.link, url: value })
}
</script>

<template>
  <div class="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
    <div class="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
      <LocalizedInput :model-value="link.label" label="名称" :maxlength="60" @update:model-value="setLabel" />
      <div>
        <label class="mb-2 block text-sm font-medium text-slate-700">URL</label>
        <el-input :model-value="link.url" placeholder="https:// 或 /path" @update:model-value="setUrl" />
      </div>
      <el-button class="self-end" text type="danger" @click="emit('remove')">删除</el-button>
    </div>
  </div>
</template>

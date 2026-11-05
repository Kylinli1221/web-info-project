<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type { LocalizedText } from '~~/shared/types/content'

const props = withDefaults(defineProps<{
  modelValue: LocalizedText
  label: string
  required?: boolean
  height?: number
}>(), {
  required: false,
  height: 380,
})

const emit = defineEmits<{ 'update:modelValue': [value: LocalizedText] }>()

const zh = computed({
  get: () => props.modelValue?.zh ?? '',
  set: value => emit('update:modelValue', { ...props.modelValue, zh: value }),
})
const en = computed({
  get: () => props.modelValue?.en ?? '',
  set: value => emit('update:modelValue', { ...props.modelValue, en: value }),
})
</script>

<template>
  <div>
    <label class="mb-2 block text-sm font-medium text-slate-700">
      {{ label }} <span v-if="required" class="text-rose-500">*</span>
    </label>
    <div class="grid gap-3 2xl:grid-cols-2">
      <div>
        <span class="mb-1 block text-[10px] tracking-widest text-slate-400">中文</span>
        <ClientOnly>
          <MdEditor v-model="zh" :height="height" language="zh-CN" />
          <template #fallback>
            <div class="animate-pulse rounded-md bg-slate-100" :style="{ height: `${height}px` }" />
          </template>
        </ClientOnly>
      </div>
      <div>
        <span class="mb-1 block text-[10px] tracking-widest text-slate-400">ENGLISH</span>
        <ClientOnly>
          <MdEditor v-model="en" :height="height" />
          <template #fallback>
            <div class="animate-pulse rounded-md bg-slate-100" :style="{ height: `${height}px` }" />
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

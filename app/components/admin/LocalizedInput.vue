<script setup lang="ts">
import type { LocalizedText } from '~~/shared/types/content'

const props = withDefaults(defineProps<{
  modelValue: LocalizedText
  label: string
  textarea?: boolean
  required?: boolean
  maxlength?: number
}>(), {
  textarea: false,
  required: false,
  maxlength: 500,
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
    <div class="grid gap-3 md:grid-cols-2">
      <div>
        <span class="mb-1 block text-[10px] tracking-widest text-slate-400">中文</span>
        <el-input
          v-model="zh"
          :type="textarea ? 'textarea' : 'text'"
          :rows="textarea ? 5 : undefined"
          :maxlength="maxlength"
          show-word-limit
        />
      </div>
      <div>
        <span class="mb-1 block text-[10px] tracking-widest text-slate-400">ENGLISH</span>
        <el-input
          v-model="en"
          :type="textarea ? 'textarea' : 'text'"
          :rows="textarea ? 5 : undefined"
          :maxlength="maxlength"
          show-word-limit
        />
      </div>
    </div>
  </div>
</template>

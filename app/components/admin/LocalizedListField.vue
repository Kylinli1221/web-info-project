<script setup lang="ts">
import type { LocalizedList } from '~~/shared/types/content'

const props = withDefaults(defineProps<{
  modelValue: LocalizedList | null | undefined
  label: string
  addLabel?: string
  max?: number
  maxlength?: number
}>(), {
  addLabel: '添加一项',
  max: 20,
  maxlength: 200,
})

const emit = defineEmits<{ 'update:modelValue': [value: LocalizedList] }>()

type LocaleKey = 'zh' | 'en'

function items(locale: LocaleKey): string[] {
  return props.modelValue?.[locale] ?? []
}

function commit(locale: LocaleKey, value: string[]) {
  emit('update:modelValue', {
    zh: items('zh'),
    en: items('en'),
    ...props.modelValue,
    [locale]: value,
  })
}

function update(locale: LocaleKey, index: number, value: string) {
  const next = [...items(locale)]
  next[index] = value
  commit(locale, next)
}

function remove(locale: LocaleKey, index: number) {
  commit(locale, items(locale).filter((_, i) => i !== index))
}

function add(locale: LocaleKey) {
  if (items(locale).length >= props.max) return
  commit(locale, [...items(locale), ''])
}
</script>

<template>
  <div>
    <label class="mb-2 block text-sm font-medium text-slate-700">{{ label }}</label>
    <div class="grid gap-4 md:grid-cols-2">
      <div v-for="locale in (['zh', 'en'] as const)" :key="locale">
        <span class="mb-1 block text-[10px] tracking-widest text-slate-400">
          {{ locale === 'zh' ? '中文' : 'ENGLISH' }}
        </span>
        <div class="space-y-2">
          <div v-for="(item, index) in items(locale)" :key="index" class="flex items-center gap-2">
            <el-input
              :model-value="item"
              :maxlength="maxlength"
              :placeholder="`第 ${index + 1} 项`"
              @update:model-value="value => update(locale, index, String(value))"
            />
            <el-button text type="danger" aria-label="删除" @click="remove(locale, index)">✕</el-button>
          </div>
          <el-button text type="primary" :disabled="items(locale).length >= max" @click="add(locale)">
            + {{ addLabel }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

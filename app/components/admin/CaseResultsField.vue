<script setup lang="ts">
import type { CaseResult, LocalizedCaseResults } from '~~/shared/types/content'

const props = withDefaults(defineProps<{
  modelValue: LocalizedCaseResults | null | undefined
  label: string
  max?: number
}>(), {
  max: 12,
})

const emit = defineEmits<{ 'update:modelValue': [value: LocalizedCaseResults] }>()

type LocaleKey = 'zh' | 'en'

function items(locale: LocaleKey): CaseResult[] {
  return props.modelValue?.[locale] ?? []
}

function commit(locale: LocaleKey, value: CaseResult[]) {
  emit('update:modelValue', {
    zh: items('zh'),
    en: items('en'),
    ...props.modelValue,
    [locale]: value,
  })
}

function update(locale: LocaleKey, index: number, key: keyof CaseResult, value: string) {
  const next = items(locale).map((item, i) => (i === index ? { ...item, [key]: value } : item))
  commit(locale, next)
}

function remove(locale: LocaleKey, index: number) {
  commit(locale, items(locale).filter((_, i) => i !== index))
}

function add(locale: LocaleKey) {
  if (items(locale).length >= props.max) return
  commit(locale, [...items(locale), { value: '', label: '' }])
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
              :model-value="item.value"
              maxlength="80"
              placeholder="数值，如 40%"
              class="!w-28 shrink-0"
              @update:model-value="value => update(locale, index, 'value', String(value))"
            />
            <el-input
              :model-value="item.label"
              maxlength="160"
              placeholder="说明，如 效率提升"
              @update:model-value="value => update(locale, index, 'label', String(value))"
            />
            <el-button text type="danger" aria-label="删除" @click="remove(locale, index)">✕</el-button>
          </div>
          <el-button text type="primary" :disabled="items(locale).length >= max" @click="add(locale)">
            + 添加成果
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

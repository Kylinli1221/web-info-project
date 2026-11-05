<script setup lang="ts">
import type { LocalizedText } from '~~/shared/types/content'

interface ActionLink {
  label: LocalizedText
  url: string
}

interface CapabilityItem {
  icon: string
  title: LocalizedText
  summary: LocalizedText
}

interface MetricItem {
  value: string
  label: LocalizedText
}

const props = defineProps<{
  type: string
  modelValue: Record<string, unknown>
}>()

const emit = defineEmits<{ 'update:modelValue': [value: Record<string, unknown>] }>()

const EMPTY_TEXT: LocalizedText = { zh: '', en: '' }

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function localized(key: string): LocalizedText {
  const raw = asRecord(props.modelValue[key])
  return { zh: asString(raw.zh), en: asString(raw.en) }
}

function setField(key: string, value: unknown) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function link(key: string): ActionLink {
  const raw = asRecord(props.modelValue[key])
  return { label: localized(`${key}.label`), url: asString(raw.url) }
}

function setLink(key: string, value: ActionLink) {
  setField(key, { label: value.label, url: value.url })
}

function capabilityItems(): CapabilityItem[] {
  const raw = props.modelValue.items
  if (!Array.isArray(raw)) return []
  return raw.map(item => ({
    icon: asString(asRecord(item).icon),
    title: (() => { const t = asRecord(item).title; const r = asRecord(t); return { zh: asString(r.zh), en: asString(r.en) } })(),
    summary: (() => { const t = asRecord(item).summary; const r = asRecord(t); return { zh: asString(r.zh), en: asString(r.en) } })(),
  }))
}

function setCapabilityItems(items: CapabilityItem[]) {
  setField('items', items)
}

function metricItems(): MetricItem[] {
  const raw = props.modelValue.items
  if (!Array.isArray(raw)) return []
  return raw.map(item => ({
    value: asString(asRecord(item).value),
    label: (() => { const t = asRecord(item).label; const r = asRecord(t); return { zh: asString(r.zh), en: asString(r.en) } })(),
  }))
}

function setMetricItems(items: MetricItem[]) {
  setField('items', items)
}

function updateItem<T>(items: T[], index: number, value: T, apply: (items: T[]) => void) {
  const next = [...items]
  next[index] = value
  apply(next)
}

const simpleSectionTypes = ['solutions', 'cases', 'news']

function isSimpleSection(value: string): boolean {
  return simpleSectionTypes.includes(value)
}
</script>

<template>
  <div class="space-y-5">
    <template v-if="type === 'hero'">
      <LocalizedInput :model-value="localized('eyebrow')" label="眉标（eyebrow）" :maxlength="120" @update:model-value="value => setField('eyebrow', value)" />
      <LocalizedInput :model-value="localized('headline')" label="主标题（headline）" :maxlength="200" @update:model-value="value => setField('headline', value)" />
      <LocalizedInput :model-value="localized('summary')" label="简介（summary）" textarea :maxlength="500" @update:model-value="value => setField('summary', value)" />
      <div class="grid gap-4 2xl:grid-cols-2">
        <div>
          <p class="mb-2 text-sm font-medium text-slate-700">主要按钮</p>
          <div class="rounded-lg border border-slate-200 p-3">
            <LocalizedInput :model-value="link('primaryAction').label" label="按钮文字" :maxlength="60" @update:model-value="value => setLink('primaryAction', { ...link('primaryAction'), label: value })" />
            <div class="mt-3">
              <label class="mb-2 block text-sm font-medium text-slate-700">链接 URL</label>
              <el-input :model-value="link('primaryAction').url" placeholder="/solutions 或 https://" @update:model-value="(value: string | number) => setLink('primaryAction', { ...link('primaryAction'), url: String(value) })" />
            </div>
          </div>
        </div>
        <div>
          <p class="mb-2 text-sm font-medium text-slate-700">次要按钮</p>
          <div class="rounded-lg border border-slate-200 p-3">
            <LocalizedInput :model-value="link('secondaryAction').label" label="按钮文字" :maxlength="60" @update:model-value="value => setLink('secondaryAction', { ...link('secondaryAction'), label: value })" />
            <div class="mt-3">
              <label class="mb-2 block text-sm font-medium text-slate-700">链接 URL</label>
              <el-input :model-value="link('secondaryAction').url" placeholder="/contact 或 https://" @update:model-value="(value: string | number) => setLink('secondaryAction', { ...link('secondaryAction'), url: String(value) })" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="type === 'capabilities'">
      <LocalizedInput :model-value="localized('title')" label="标题" :maxlength="200" @update:model-value="value => setField('title', value)" />
      <LocalizedInput :model-value="localized('summary')" label="简介" textarea :maxlength="500" @update:model-value="value => setField('summary', value)" />
      <div>
        <p class="mb-2 text-sm font-medium text-slate-700">能力项</p>
        <div class="space-y-3">
          <div v-for="(item, index) in capabilityItems()" :key="index" class="rounded-lg border border-slate-200 p-3">
            <div class="flex items-start justify-between gap-2">
              <el-input :model-value="item.icon" placeholder="图标标识，如 sparkles / database" class="!w-64" @update:model-value="(value: string | number) => updateItem(capabilityItems(), index, { ...item, icon: String(value) }, setCapabilityItems)" />
              <el-button text type="danger" @click="setCapabilityItems(capabilityItems().filter((_, i) => i !== index))">删除</el-button>
            </div>
            <div class="mt-3">
              <LocalizedInput :model-value="item.title" label="名称" :maxlength="120" @update:model-value="value => updateItem(capabilityItems(), index, { ...item, title: value }, setCapabilityItems)" />
            </div>
            <div class="mt-3">
              <LocalizedInput :model-value="item.summary" label="说明" textarea :maxlength="300" @update:model-value="value => updateItem(capabilityItems(), index, { ...item, summary: value }, setCapabilityItems)" />
            </div>
          </div>
          <el-button text type="primary" :disabled="capabilityItems().length >= 8" @click="setCapabilityItems([...capabilityItems(), { icon: '', title: { ...EMPTY_TEXT }, summary: { ...EMPTY_TEXT } }])">
            + 添加能力项
          </el-button>
        </div>
      </div>
    </template>

    <template v-else-if="type === 'metrics'">
      <LocalizedInput :model-value="localized('title')" label="标题" :maxlength="200" @update:model-value="value => setField('title', value)" />
      <LocalizedInput :model-value="localized('summary')" label="简介" textarea :maxlength="500" @update:model-value="value => setField('summary', value)" />
      <div>
        <p class="mb-2 text-sm font-medium text-slate-700">指标项</p>
        <div class="space-y-2">
          <div v-for="(item, index) in metricItems()" :key="index" class="flex items-center gap-2">
            <el-input :model-value="item.value" placeholder="数值，如 120+" class="!w-32 shrink-0" @update:model-value="(value: string | number) => updateItem(metricItems(), index, { ...item, value: String(value) }, setMetricItems)" />
            <LocalizedInput :model-value="item.label" label="说明" :maxlength="120" @update:model-value="value => updateItem(metricItems(), index, { ...item, label: value }, setMetricItems)" />
            <el-button text type="danger" aria-label="删除" @click="setMetricItems(metricItems().filter((_, i) => i !== index))">✕</el-button>
          </div>
          <el-button text type="primary" :disabled="metricItems().length >= 8" @click="setMetricItems([...metricItems(), { value: '', label: { ...EMPTY_TEXT } }])">
            + 添加指标
          </el-button>
        </div>
      </div>
    </template>

    <template v-else-if="isSimpleSection(type)">
      <LocalizedInput :model-value="localized('eyebrow')" label="眉标（eyebrow）" :maxlength="120" @update:model-value="value => setField('eyebrow', value)" />
      <LocalizedInput :model-value="localized('title')" label="标题" :maxlength="200" @update:model-value="value => setField('title', value)" />
      <LocalizedInput :model-value="localized('summary')" label="简介" textarea :maxlength="500" @update:model-value="value => setField('summary', value)" />
      <div class="rounded-lg border border-slate-200 p-3">
        <LocalizedInput :model-value="link('action').label" label="按钮文字" :maxlength="60" @update:model-value="value => setLink('action', { ...link('action'), label: value })" />
        <div class="mt-3">
          <label class="mb-2 block text-sm font-medium text-slate-700">链接 URL</label>
          <el-input :model-value="link('action').url" placeholder="/solutions 或 https://" @update:model-value="(value: string | number) => setLink('action', { ...link('action'), url: String(value) })" />
        </div>
      </div>
    </template>

    <template v-else-if="type === 'about'">
      <LocalizedInput :model-value="localized('eyebrow')" label="眉标（eyebrow）" :maxlength="120" @update:model-value="value => setField('eyebrow', value)" />
      <LocalizedInput :model-value="localized('title')" label="标题" :maxlength="200" @update:model-value="value => setField('title', value)" />
      <LocalizedInput :model-value="localized('summary')" label="简介" textarea :maxlength="500" @update:model-value="value => setField('summary', value)" />
      <LocalizedInput :model-value="localized('content')" label="详细内容" textarea :maxlength="2000" @update:model-value="value => setField('content', value)" />
      <div class="rounded-lg border border-slate-200 p-3">
        <LocalizedInput :model-value="link('action').label" label="按钮文字" :maxlength="60" @update:model-value="value => setLink('action', { ...link('action'), label: value })" />
        <div class="mt-3">
          <label class="mb-2 block text-sm font-medium text-slate-700">链接 URL</label>
          <el-input :model-value="link('action').url" placeholder="/about 或 https://" @update:model-value="(value: string | number) => setLink('action', { ...link('action'), url: String(value) })" />
        </div>
      </div>
    </template>

    <template v-else-if="type === 'contact'">
      <LocalizedInput :model-value="localized('eyebrow')" label="眉标（eyebrow）" :maxlength="120" @update:model-value="value => setField('eyebrow', value)" />
      <LocalizedInput :model-value="localized('title')" label="标题" :maxlength="200" @update:model-value="value => setField('title', value)" />
      <LocalizedInput :model-value="localized('summary')" label="简介" textarea :maxlength="500" @update:model-value="value => setField('summary', value)" />
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">联系邮箱</label>
          <el-input :model-value="asString(modelValue.email)" placeholder="hello@example.com" @update:model-value="(value: string | number) => setField('email', String(value))" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">联系电话</label>
          <el-input :model-value="asString(modelValue.phone)" placeholder="+86 400-000-0000" @update:model-value="(value: string | number) => setField('phone', String(value))" />
        </div>
      </div>
      <LocalizedInput :model-value="localized('address')" label="地址" :maxlength="200" @update:model-value="value => setField('address', value)" />
      <div class="rounded-lg border border-slate-200 p-3">
        <LocalizedInput :model-value="link('action').label" label="按钮文字" :maxlength="60" @update:model-value="value => setLink('action', { ...link('action'), label: value })" />
        <div class="mt-3">
          <label class="mb-2 block text-sm font-medium text-slate-700">链接 URL</label>
          <el-input :model-value="link('action').url" placeholder="/contact 或 https://" @update:model-value="(value: string | number) => setLink('action', { ...link('action'), url: String(value) })" />
        </div>
      </div>
    </template>

    <template v-else>
      <p class="text-sm text-slate-400">未知模块类型「{{ type }}」，暂不支持可视化编辑。</p>
    </template>
  </div>
</template>

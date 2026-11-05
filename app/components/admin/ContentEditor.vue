<script setup lang="ts">
import type {
  ContentSeo,
  LocalizedCaseResults,
  LocalizedList,
  LocalizedText,
} from '~~/shared/types/content'

type ContentKind = 'solutions' | 'cases' | 'news'

interface AdminContentRecord {
  id: string
  slug: string
  title: LocalizedText
  summary: LocalizedText
  content: LocalizedText
  coverUrl: string | null
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt: string | null
  sortOrder?: number
  features?: LocalizedList | null
  icon?: string | null
  clientName?: string | null
  industry?: string | null
  results?: LocalizedCaseResults | null
  seo?: ContentSeo | null
}

const props = defineProps<{ kind: ContentKind; id: string }>()
const requestFetch = useRequestFetch()
const config = {
  solutions: { singular: '解决方案', eyebrow: 'SOLUTION EDITOR', list: '/admin/solutions' },
  cases: { singular: '客户案例', eyebrow: 'CASE STUDY EDITOR', list: '/admin/cases' },
  news: { singular: '新闻', eyebrow: 'NEWS EDITOR', list: '/admin/news' },
}

const { data } = await useAsyncData(
  () => `admin-${props.kind}-records`,
  () => requestFetch<AdminContentRecord[]>(`/api/admin/${props.kind}`),
)
const existing = data.value?.find(item => item.id === props.id)
if (props.id !== 'new' && !existing) {
  throw createError({ statusCode: 404, statusMessage: 'Content not found' })
}

const empty = (): AdminContentRecord => ({
  id: '',
  slug: '',
  title: { zh: '', en: '' },
  summary: { zh: '', en: '' },
  content: { zh: '', en: '' },
  coverUrl: null,
  status: 'DRAFT',
  publishedAt: null,
  sortOrder: 0,
  features: props.kind === 'solutions' ? { zh: [], en: [] } : null,
  icon: null,
  clientName: null,
  industry: null,
  results: props.kind === 'cases' ? { zh: [], en: [] } : null,
  seo: null,
})

const form = ref<AdminContentRecord>(existing ? structuredClone(existing) : empty())
const seoTitle = ref<LocalizedText>(form.value.seo?.title ?? { zh: '', en: '' })
const seoDescription = ref<LocalizedText>(form.value.seo?.description ?? { zh: '', en: '' })
const seoKeywords = ref<LocalizedText>(form.value.seo?.keywords ?? { zh: '', en: '' })
const saving = ref(false)

async function save() {
  if (!form.value.slug || !form.value.title.zh || !form.value.summary.zh || !form.value.content.zh) {
    ElMessage.warning('请填写 Slug、中文标题、摘要和正文')
    return
  }

  const payload: Record<string, unknown> = {
    slug: form.value.slug.trim(),
    title: form.value.title,
    summary: form.value.summary,
    content: form.value.content,
    coverUrl: form.value.coverUrl,
    status: form.value.status,
  }

  if (props.kind === 'solutions') {
    payload.sortOrder = form.value.sortOrder ?? 0
    payload.icon = form.value.icon || null
    payload.features = {
      zh: (form.value.features?.zh ?? []).map(item => item.trim()).filter(Boolean),
      en: (form.value.features?.en ?? []).map(item => item.trim()).filter(Boolean),
    }
  }
  if (props.kind === 'cases') {
    payload.sortOrder = form.value.sortOrder ?? 0
    payload.clientName = form.value.clientName || null
    payload.industry = form.value.industry || null
    const trimResults = (rows: { value: string, label: string }[]) =>
      rows
        .map(item => ({ value: item.value.trim(), label: item.label.trim() }))
        .filter(item => item.value || item.label)
    payload.results = {
      zh: trimResults(form.value.results?.zh ?? []),
      en: trimResults(form.value.results?.en ?? []),
    }
  }
  if (props.kind === 'news') {
    payload.seo = seoTitle.value.zh
      ? {
          title: seoTitle.value,
          description: seoDescription.value,
          ...(seoKeywords.value.zh ? { keywords: seoKeywords.value } : {}),
        }
      : null
  }

  saving.value = true
  try {
    const saved = await $fetch<AdminContentRecord>(
      props.id === 'new' ? `/api/admin/${props.kind}` : `/api/admin/${props.kind}/${props.id}`,
      { method: props.id === 'new' ? 'POST' : 'PUT', body: payload },
    )
    form.value = { ...form.value, ...saved }
    ElMessage.success('内容已保存')
    if (props.id === 'new') {
      await navigateTo(`/admin/${props.kind}/${saved.id}`, { replace: true })
    }
  } catch (error) {
    const message = error && typeof error === 'object' && 'statusMessage' in error
      ? String(error.statusMessage)
      : '保存失败'
    ElMessage.error(message)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] tracking-[0.18em] text-cyan-700">{{ config[kind].eyebrow }}</p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">{{ id === 'new' ? `新建${config[kind].singular}` : `编辑${config[kind].singular}` }}</h2>
        <p class="mt-2 text-sm text-slate-500">
          状态：{{ form.status === 'PUBLISHED' ? `已发布 ${form.publishedAt ? new Date(form.publishedAt).toLocaleString('zh-CN') : ''}` : '草稿（官网不可见）' }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <NuxtLink :to="config[kind].list"><el-button>返回列表</el-button></NuxtLink>
        <el-button v-if="form.status === 'PUBLISHED'" tag="a" :href="`/${kind === 'solutions' ? 'zh/solutions' : kind === 'cases' ? 'zh/cases' : 'zh/news'}/${form.slug}`" target="_blank">查看官网 ↗</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存内容</el-button>
      </div>
    </div>

    <div class="space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
      <div class="grid gap-4 md:grid-cols-[1fr_12rem]">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Slug <span class="text-rose-500">*</span></label>
          <el-input v-model="form.slug" placeholder="lowercase-with-hyphens" />
          <p class="mt-1.5 text-[11px] text-slate-400">仅小写字母、数字和连字符；发布后修改会改变公开地址。</p>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">发布状态</label>
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="发布" value="PUBLISHED" />
          </el-select>
        </div>
      </div>

      <LocalizedInput v-model="form.title" label="标题" required :maxlength="160" />
      <LocalizedInput v-model="form.summary" label="摘要" required textarea :maxlength="500" />

      <div v-if="kind !== 'news'" class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">排序</label>
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
        </div>
        <div v-if="kind === 'solutions'">
          <label class="mb-2 block text-sm font-medium text-slate-700">图标标识</label>
          <el-input v-model="form.icon" placeholder="sparkles / database / cloud" />
        </div>
        <div v-if="kind === 'cases'">
          <label class="mb-2 block text-sm font-medium text-slate-700">客户名称</label>
          <el-input v-model="form.clientName" placeholder="Demo Manufacturing Group" />
        </div>
        <div v-if="kind === 'cases'">
          <label class="mb-2 block text-sm font-medium text-slate-700">行业</label>
          <el-input v-model="form.industry" placeholder="manufacturing" />
        </div>
      </div>

      <ImageField v-model="form.coverUrl" label="封面图片" />

      <RichTextField v-model="form.content" label="正文" required :height="420" />

      <LocalizedListField
        v-if="kind === 'solutions'"
        v-model="form.features"
        label="能力项"
        add-label="添加能力项"
      />

      <CaseResultsField v-if="kind === 'cases'" v-model="form.results" label="项目成果" />

      <div v-if="kind === 'news'" class="space-y-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div>
          <p class="text-sm font-medium text-slate-700">文章 SEO（可选）</p>
          <p class="mt-1 text-[11px] text-slate-400">填写中文标题后生效，用于搜索引擎和分享卡片。</p>
        </div>
        <LocalizedInput v-model="seoTitle" label="SEO 标题" :maxlength="160" />
        <LocalizedInput v-model="seoDescription" label="SEO 描述" textarea :maxlength="300" />
        <LocalizedInput v-model="seoKeywords" label="关键词" :maxlength="500" />
      </div>
    </div>
  </div>
</template>

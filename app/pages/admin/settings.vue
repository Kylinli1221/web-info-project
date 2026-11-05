<script setup lang="ts">
import type { SettingsInput } from '~~/shared/schemas/content'
import type { LocalizedText } from '~~/shared/types/content'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const requestFetch = useRequestFetch()
const { data } = await useAsyncData('admin-settings', () => requestFetch<SettingsInput>('/api/admin/settings'))
const form = ref<SettingsInput>({
  ...data.value!,
  contactEmail: data.value?.contactEmail ?? '',
  phone: data.value?.phone ?? '',
  address: data.value?.address ?? { zh: '', en: '' },
  socialLinks: data.value?.socialLinks ?? [],
  footer: {
    ...data.value!.footer,
    links: data.value?.footer.links ?? [],
  },
  seo: {
    ...data.value!.seo,
    keywords: data.value?.seo.keywords ?? { zh: '', en: '' },
  },
})
const addressModel = computed<LocalizedText>({
  get: () => form.value.address ?? { zh: '', en: '' },
  set: value => { form.value.address = value },
})
interface EditableLink {
  label: LocalizedText
  url: string
}

function updateLink(list: EditableLink[], target: EditableLink, value: EditableLink) {
  const index = list.findIndex(item => item === target)
  if (index >= 0) Object.assign(list[index]!, value)
}

function removeLink(list: EditableLink[], target: EditableLink) {
  const index = list.findIndex(item => item === target)
  if (index >= 0) list.splice(index, 1)
}

const saving = ref(false)

async function save() {
  saving.value = true
  try {
    await $fetch('/api/admin/settings', { method: 'PUT', body: form.value })
    ElMessage.success('站点设置已保存，官网刷新后生效')
  } catch {
    ElMessage.error('保存失败，请检查必填项和 URL 格式')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] tracking-[0.18em] text-cyan-700">BRAND / SITE / SEO</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">站点设置</h2>
        <p class="mt-2 text-sm text-slate-500">Logo、双语文案、联系方式和页脚备案信息。</p>
      </div>
      <el-button type="primary" :loading="saving" @click="save">保存设置</el-button>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
      <el-tabs>
        <el-tab-pane label="品牌与联系">
          <div class="space-y-6">
            <div class="grid gap-4 md:grid-cols-3">
              <ImageField v-model="form.logoLightUrl" label="浅色 Logo（深色背景使用）" />
              <ImageField v-model="form.logoDarkUrl" label="深色 Logo" />
              <ImageField v-model="form.faviconUrl" label="Favicon" />
            </div>
            <LocalizedInput v-model="form.siteName" label="站点名称" required :maxlength="120" />
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">联系邮箱</label>
                <el-input v-model="form.contactEmail" placeholder="hello@example.com" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">联系电话</label>
                <el-input v-model="form.phone" placeholder="+86 400-000-0000" />
              </div>
            </div>
            <LocalizedInput v-model="addressModel" label="联系地址" />
            <div>
              <div class="mb-2 flex items-center justify-between">
                <label class="text-sm font-medium text-slate-700">社交链接</label>
                <el-button text type="primary" @click="form.socialLinks.push({ label: { zh: '', en: '' }, url: '' })">添加链接</el-button>
              </div>
              <LinkEditor
                v-for="link in form.socialLinks"
                :key="`social-${link.url}-${link.label.zh}`"
                :link="link"
                @update="updateLink(form.socialLinks, link, $event)"
                @remove="removeLink(form.socialLinks, link)"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="SEO">
          <div class="space-y-6">
            <LocalizedInput v-model="form.seo.title" label="默认 SEO 标题" required :maxlength="160" />
            <LocalizedInput v-model="form.seo.description" label="默认 SEO 描述" required textarea :maxlength="300" />
            <LocalizedInput v-if="form.seo.keywords" v-model="form.seo.keywords" label="关键词（逗号分隔）" :maxlength="500" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="页脚与备案">
          <div class="space-y-6">
            <LocalizedInput v-model="form.footer.copyright" label="版权文字" textarea :maxlength="300" />
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">ICP 备案号</label>
                <el-input v-model="form.footer.icpNumber" placeholder="沪ICP备xxxxxxxx号" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">ICP 查询链接</label>
                <el-input v-model="form.footer.icpUrl" placeholder="留空使用 https://beian.miit.gov.cn/" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">公安备案号</label>
                <el-input v-model="form.footer.publicSecurityNumber" placeholder="沪公网安备 xxxxxxxxxxxxxx 号" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">公安备案链接</label>
                <el-input v-model="form.footer.publicSecurityUrl" placeholder="https://" />
              </div>
            </div>
            <div>
              <div class="mb-2 flex items-center justify-between">
                <label class="text-sm font-medium text-slate-700">自定义页脚链接</label>
                <el-button text type="primary" @click="form.footer.links.push({ label: { zh: '', en: '' }, url: '' })">添加链接</el-button>
              </div>
              <LinkEditor
                v-for="link in form.footer.links"
                :key="`footer-${link.url}-${link.label.zh}`"
                :link="link"
                @update="updateLink(form.footer.links, link, $event)"
                @remove="removeLink(form.footer.links, link)"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { user } = useAdminSession()
const form = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const saving = ref(false)
const error = ref('')

async function save() {
  error.value = ''
  if (form.newPassword.length < 16) {
    error.value = '新密码至少需要 16 个字符'
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    error.value = '两次输入的新密码不一致'
    return
  }
  saving.value = true
  try {
    await $fetch('/api/admin/auth/password', {
      method: 'PUT',
      body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
    })
    Object.assign(form, { currentPassword: '', newPassword: '', confirmPassword: '' })
    ElMessage.success('密码已更新，其他登录会话已失效')
  } catch {
    error.value = '修改失败，请检查当前密码是否正确'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <div>
      <p class="font-mono text-[10px] tracking-[0.18em] text-cyan-700">ACCOUNT SECURITY</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">账号设置</h2>
      <p class="mt-2 text-sm text-slate-500">当前管理员：{{ user?.name }}（{{ user?.email }}）</p>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
      <h3 class="text-sm font-semibold text-slate-800">修改密码</h3>
      <p class="mt-1 text-xs text-slate-400">修改成功后，除当前会话外的其他登录会话会被撤销。</p>
      <form class="mt-6 max-w-md space-y-4" @submit.prevent="save">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">当前密码</label>
          <el-input v-model="form.currentPassword" type="password" show-password autocomplete="current-password" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">新密码</label>
          <el-input v-model="form.newPassword" type="password" show-password autocomplete="new-password" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">确认新密码</label>
          <el-input v-model="form.confirmPassword" type="password" show-password autocomplete="new-password" />
        </div>
        <p v-if="error" class="text-xs text-rose-500">{{ error }}</p>
        <el-button type="primary" native-type="submit" :loading="saving">更新密码</el-button>
      </form>
    </div>
  </div>
</template>

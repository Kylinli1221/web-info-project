<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

interface AdminUserRecord {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

const { user: currentUser } = useAdminSession()
const requestFetch = useRequestFetch()
const { data: users, refresh } = await useAsyncData(
  'admin-users',
  () => requestFetch<AdminUserRecord[]>('/api/admin/users'),
)

const createOpen = ref(false)
const createForm = reactive({ email: '', name: '', password: '', confirmPassword: '' })
const createSaving = ref(false)

const editTarget = ref<AdminUserRecord | null>(null)
const editForm = reactive({ name: '', password: '', confirmPassword: '' })
const editSaving = ref(false)

function validatePassword(password: string, confirm: string): string | null {
  if (password.length < 16) return '密码至少需要 16 个字符'
  if (password !== confirm) return '两次输入的密码不一致'
  return null
}

async function createUser() {
  const error = validatePassword(createForm.password, createForm.confirmPassword)
  if (error) {
    ElMessage.error(error)
    return
  }
  createSaving.value = true
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        email: createForm.email.trim(),
        name: createForm.name.trim(),
        password: createForm.password,
      },
    })
    ElMessage.success('管理员已创建')
    createOpen.value = false
    Object.assign(createForm, { email: '', name: '', password: '', confirmPassword: '' })
    await refresh()
  } catch (error) {
    const message = error && typeof error === 'object' && 'statusMessage' in error
      ? String(error.statusMessage)
      : '创建失败'
    ElMessage.error(message)
  } finally {
    createSaving.value = false
  }
}

function openEdit(record: AdminUserRecord) {
  editTarget.value = record
  Object.assign(editForm, { name: record.name, password: '', confirmPassword: '' })
}

async function updateUser() {
  if (!editTarget.value) return
  if (editForm.password) {
    const error = validatePassword(editForm.password, editForm.confirmPassword)
    if (error) {
      ElMessage.error(error)
      return
    }
  }
  editSaving.value = true
  try {
    const updated = await $fetch<AdminUserRecord>(`/api/admin/users/${editTarget.value.id}`, {
      method: 'PUT',
      body: {
        name: editForm.name.trim(),
        ...(editForm.password ? { password: editForm.password } : {}),
      },
    })
    ElMessage.success(editForm.password ? '已更新，该用户的所有会话已失效' : '已更新')
    editTarget.value = null
    if (updated.id === currentUser.value?.id) await useAdminSession().fetchSession(true)
    await refresh()
  } catch {
    ElMessage.error('更新失败')
  } finally {
    editSaving.value = false
  }
}

async function removeUser(record: AdminUserRecord) {
  try {
    await ElMessageBox.confirm(
      `确定删除管理员「${record.name}（${record.email}）」吗？该操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  try {
    await $fetch(`/api/admin/users/${record.id}`, { method: 'DELETE' })
    ElMessage.success('已删除')
    await refresh()
  } catch (error) {
    const message = error && typeof error === 'object' && 'statusMessage' in error
      ? String(error.statusMessage)
      : '删除失败'
    ElMessage.error(message)
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] tracking-[0.18em] text-cyan-700">ADMINISTRATORS</p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">管理员管理</h2>
        <p class="mt-2 text-sm text-slate-500">后台账户存储于数据库，不再依赖环境变量。密码至少 16 个字符。</p>
      </div>
      <el-button type="primary" @click="createOpen = true">新建管理员</el-button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <el-table :data="users ?? []" class="w-full">
        <el-table-column label="姓名" min-width="160">
          <template #default="{ row }">
            <span class="font-medium text-slate-800">{{ row.name }}</span>
            <el-tag v-if="row.id === currentUser?.id" size="small" class="ml-2">当前账户</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="220" />
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">{{ new Date(row.createdAt).toLocaleString('zh-CN') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="170" align="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openEdit(row as AdminUserRecord)">编辑</el-button>
            <el-button
              text
              type="danger"
              :disabled="row.id === currentUser?.id"
              @click="removeUser(row as AdminUserRecord)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="createOpen" title="新建管理员" width="min(480px, 94vw)">
      <form class="space-y-4" @submit.prevent="createUser">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">邮箱</label>
          <el-input v-model="createForm.email" type="email" placeholder="admin@example.com" autocomplete="off" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">姓名</label>
          <el-input v-model="createForm.name" placeholder="显示名称" autocomplete="off" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">密码（至少 16 个字符）</label>
          <el-input v-model="createForm.password" type="password" show-password autocomplete="new-password" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">确认密码</label>
          <el-input v-model="createForm.confirmPassword" type="password" show-password autocomplete="new-password" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <el-button @click="createOpen = false">取消</el-button>
          <el-button type="primary" native-type="submit" :loading="createSaving">创建</el-button>
        </div>
      </form>
    </el-dialog>

    <el-dialog :model-value="editTarget !== null" title="编辑管理员" width="min(480px, 94vw)" @close="editTarget = null">
      <form v-if="editTarget" class="space-y-4" @submit.prevent="updateUser">
        <p class="text-xs text-slate-400">{{ editTarget.email }}</p>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">姓名</label>
          <el-input v-model="editForm.name" autocomplete="off" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">
            重置密码 <span class="text-slate-400">（留空则不修改）</span>
          </label>
          <el-input v-model="editForm.password" type="password" show-password autocomplete="new-password" />
        </div>
        <div v-if="editForm.password">
          <label class="mb-2 block text-sm font-medium text-slate-700">确认新密码</label>
          <el-input v-model="editForm.confirmPassword" type="password" show-password autocomplete="new-password" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <el-button @click="editTarget = null">取消</el-button>
          <el-button type="primary" native-type="submit" :loading="editSaving">保存</el-button>
        </div>
      </form>
    </el-dialog>
  </div>
</template>

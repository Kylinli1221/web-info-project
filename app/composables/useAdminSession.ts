export interface AdminSessionUser {
  id: string
  email: string
  name: string
}

export function useAdminSession() {
  const user = useState<AdminSessionUser | null>('admin.user', () => null)
  const loaded = useState<boolean>('admin.loaded', () => false)
  const requestFetch = useRequestFetch()

  async function fetchSession(force = false): Promise<AdminSessionUser | null> {
    if (loaded.value && !force) return user.value
    try {
      user.value = await requestFetch<AdminSessionUser>('/api/admin/auth/me')
    } catch {
      user.value = null
    }
    loaded.value = true
    return user.value
  }

  async function login(email: string, password: string): Promise<AdminSessionUser> {
    const account = await $fetch<AdminSessionUser>('/api/admin/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = account
    loaded.value = true
    return account
  }

  async function logout() {
    try {
      await $fetch('/api/admin/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      loaded.value = true
      await navigateTo('/admin/login')
    }
  }

  return { user, loaded, fetchSession, login, logout }
}

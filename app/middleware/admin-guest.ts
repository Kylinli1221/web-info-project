export default defineNuxtRouteMiddleware(async () => {
  const { fetchSession } = useAdminSession()
  const user = await fetchSession()
  if (user) return navigateTo('/admin')
})

export default defineNuxtRouteMiddleware(async (to) => {
  const { fetchSession } = useAdminSession()
  const user = await fetchSession()
  if (!user) {
    return navigateTo({
      path: '/admin/login',
      query: { redirect: to.fullPath },
    })
  }
})

export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabase()

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()

  // If no session and trying to access protected route, redirect to login
  if (!session && to.path !== '/') {
    return navigateTo('/')
  }
})
export default defineNuxtPlugin(() => {
  const supabase = useSupabase()
  const router = useRouter()

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Redirect to login when signed out
      router.push('/')
    }
  })
})
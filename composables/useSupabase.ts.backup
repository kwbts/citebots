import { createClient } from '@supabase/supabase-js'

// Create a singleton instance
let supabaseInstance: any = null

export const useSupabase = () => {
  const config = useRuntimeConfig()

  if (!supabaseInstance) {
    supabaseInstance = createClient(
      config.public.supabaseUrl,
      config.public.supabaseAnonKey
    )
  }

  return supabaseInstance
}
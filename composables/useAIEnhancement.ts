import { useSupabase } from '~/composables/useSupabase'

export const useAIEnhancement = () => {
  const supabase = useSupabase()
  
  const enhanceClientWithAI = async (clientId: string, clientName: string, clientDomain: string) => {
    try {
      const response = await supabase.functions.invoke('enhance-client-with-ai', {
        body: {
          clientId,
          clientName,
          clientDomain
        }
      })
      
      if (response.error) {
        throw response.error
      }
      
      return response.data
    } catch (error) {
      console.error('Error enhancing client with AI:', error)
      throw error
    }
  }
  
  return {
    enhanceClientWithAI
  }
}
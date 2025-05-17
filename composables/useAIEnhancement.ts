// Using built-in Supabase composable

export const useAIEnhancement = () => {
  const supabase = useSupabaseClient()
  
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
      console.error('Full error details:', {
        message: error.message,
        error: error,
        response: error.response
      })
      throw error
    }
  }
  
  return {
    enhanceClientWithAI
  }
}
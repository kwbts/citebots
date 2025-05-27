// Using built-in Supabase composable

export const useAIEnhancement = () => {
  const supabase = useSupabaseClient()
  
  const enhanceClientWithAI = async (clientId: string, clientName: string, clientDomain: string) => {
    try {
      console.log('Calling enhance-client-with-ai with:', { clientId, clientName, clientDomain })

      const response = await supabase.functions.invoke('enhance-client-with-ai', {
        body: {
          clientId,
          clientName,
          clientDomain
        }
      })

      console.log('Raw response:', response)

      if (response.error) {
        console.error('Response error:', response.error)
        throw response.error
      }

      if (!response.data) {
        console.error('No data in response:', response)
        throw new Error('No data returned from edge function')
      }

      return response.data
    } catch (error) {
      console.error('Error enhancing client with AI:', error)
      console.error('Full error details:', {
        message: error.message,
        error: error,
        response: error.response,
        data: error.data
      })
      throw error
    }
  }
  
  return {
    enhanceClientWithAI
  }
}
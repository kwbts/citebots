export const useAIEnhancement = () => {
  const enhanceClientWithAI = async (clientId: string, clientName: string, clientDomain: string) => {
    try {
      const response = await $fetch('/api/enhance-client-ai', {
        method: 'POST',
        body: {
          clientId,
          clientName,
          clientDomain
        }
      })

      return response
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
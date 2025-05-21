import { ref, computed } from 'vue'
import { useSupabaseClient, useSupabaseSession, useRuntimeConfig } from '#imports'

export const useQueueAnalysis = () => {
  const supabase = useSupabaseClient()
  const session = useSupabaseSession()
  
  // Feature flag control
  const useQueue = ref(true) // Default to true for reliability
  const queueEnabled = ref(true) // Default to true for reliability

  // Check if queue is enabled via environment or localStorage
  const initializeQueueFeature = () => {
    // Check localStorage for user preference, but default to true if not set
    const storedPreference = localStorage.getItem('useQueueAnalysis')
    if (storedPreference !== null) {
      useQueue.value = storedPreference === 'true'
    } else {
      // If no stored preference, default to true and save it
      localStorage.setItem('useQueueAnalysis', 'true')
    }

    // Always enable the queue for reliability
    queueEnabled.value = true
  }
  
  // Toggle queue usage
  const toggleQueue = (value?: boolean) => {
    useQueue.value = value ?? !useQueue.value
    localStorage.setItem('useQueueAnalysis', String(useQueue.value))
  }
  
  // Run analysis with queue support
  const runAnalysisWithQueue = async (params: {
    client_id: string
    platform: 'chatgpt' | 'perplexity' | 'both'
    queries: any[]
  }) => {
    try {
      // Log the current queue setting
      console.log(`Using queue processing: ${useQueue.value}`);

      // Use Supabase client to invoke the edge function directly
      const { data, error } = await supabase.functions.invoke('run-custom-analysis', {
        body: {
          ...params,
          // Include platform as a query param in the body instead
          _platform_info: params.platform,
          _use_queue: useQueue.value
        },
        headers: {
          // Only include headers that are in the allowed CORS list
          'X-Use-Queue': useQueue.value ? 'true' : 'false'
        }
      })

      if (error) throw error

      const result = data
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start analysis')
      }
      
      return {
        ...result,
        useQueue: result.processing_method === 'queue'
      }
      
    } catch (error) {
      console.error('Error running analysis:', error)
      throw error
    }
  }
  
  // Monitor queue status
  const monitorQueueStatus = async (analysisRunId: string) => {
    const { data, error } = await supabase
      .from('queue_status')
      .select('*')
      .eq('analysis_run_id', analysisRunId)
      .single()
    
    if (error) {
      console.error('Error fetching queue status:', error)
      return null
    }
    
    return data
  }
  
  // Get failed queries for an analysis run
  const getFailedQueries = async (analysisRunId: string) => {
    const { data, error } = await supabase
      .from('analysis_queue')
      .select('*')
      .eq('analysis_run_id', analysisRunId)
      .eq('status', 'failed')
    
    if (error) {
      console.error('Error fetching failed queries:', error)
      return []
    }
    
    return data
  }
  
  // Retry failed queries
  const retryFailedQueries = async (analysisRunId: string) => {
    // Reset failed items to pending
    const { error: resetError } = await supabase
      .from('analysis_queue')
      .update({ 
        status: 'pending',
        attempts: 0,
        error_message: null,
        error_details: null
      })
      .eq('analysis_run_id', analysisRunId)
      .eq('status', 'failed')
    
    if (resetError) {
      throw new Error(`Failed to reset queue items: ${resetError.message}`)
    }
    
    // Update analysis run status
    const { error: runError } = await supabase
      .from('analysis_runs')
      .update({
        status: 'running',
        queries_failed: 0
      })
      .eq('id', analysisRunId)
    
    if (runError) {
      throw new Error(`Failed to update run status: ${runError.message}`)
    }
    
    // Trigger worker
    await triggerQueueWorker()
  }
  
  // Trigger the queue worker
  const triggerQueueWorker = async (batchSize = 5) => {
    try {
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.supabase.url}/functions/v1/process-queue-worker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.value?.access_token}`
        },
        body: JSON.stringify({ batch_size: batchSize })
      })
      
      const result = await response.json()
      return result
      
    } catch (error) {
      console.error('Error triggering queue worker:', error)
      return null
    }
  }
  
  return {
    useQueue: computed(() => useQueue.value),
    queueEnabled: computed(() => queueEnabled.value),
    initializeQueueFeature,
    toggleQueue,
    runAnalysisWithQueue,
    monitorQueueStatus,
    getFailedQueries,
    retryFailedQueries,
    triggerQueueWorker
  }
}
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
    platform?: 'chatgpt' | 'perplexity' | 'both'  // Legacy support
    platforms?: string[]  // New multi-platform support
    queries: any[]
    report_name?: string  // Optional custom report name
  }) => {
    try {
      // Log the current queue setting
      console.log(`Using local server processing: ${useQueue.value}`);

      // Handle legacy single platform or new multi-platform
      const platforms = params.platforms || (params.platform ? [params.platform] : ['chatgpt'])

      // Use database function to submit analysis (bypasses RLS)
      // Try new multi-platform function first, fallback to legacy if needed
      let result, error;

      if (platforms.length > 1) {
        // Multi-platform call
        const response = await supabase.rpc('submit_analysis_to_queue', {
          p_client_id: params.client_id,
          p_platforms: platforms,
          p_queries: params.queries,
          p_report_name: params.report_name || null,
          p_analysis_type: params.analysis_type || 'comprehensive'
        });
        result = response.data;
        error = response.error;
      } else {
        // Single platform call (legacy)
        const response = await supabase.rpc('submit_analysis_to_queue', {
          p_client_id: params.client_id,
          p_platform: platforms[0],
          p_queries: params.queries,
          p_report_name: params.report_name || null,
          p_analysis_type: params.analysis_type || 'comprehensive'
        });
        result = response.data;
        error = response.error;
      }

      if (error) throw error

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit analysis to queue')
      }

      return {
        ...result,
        useQueue: true
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
  
  // Trigger the local server queue worker
  const triggerQueueWorker = async (batchSize = 5) => {
    try {
      const response = await fetch('http://localhost:3002/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ batch_size: batchSize })
      })

      const result = await response.json()
      return result

    } catch (error) {
      console.error('Error triggering local server queue worker:', error)
      return null
    }
  }

  // Check local server status
  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:3002/status')
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Local server not available:', error)
      return { status: 'offline', error: error.message }
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
    triggerQueueWorker,
    checkServerStatus
  }
}
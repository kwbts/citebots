<template>
  <div v-if="isQueue" class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-semibold mb-4">Processing Progress</h3>
    
    <!-- Progress Bar -->
    <div class="mb-4">
      <div class="flex justify-between text-sm text-gray-600 mb-1">
        <span>{{ progress }}% Complete</span>
        <span>{{ completedCount }} / {{ totalCount }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
        <div 
          class="h-full rounded-full transition-all duration-500 ease-out"
          :class="progressBarClass"
          :style="{ width: `${progress}%` }"
        >
          <div v-if="processingCount > 0" class="absolute inset-0 overflow-hidden">
            <div class="h-full w-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Status Breakdown -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div class="p-3 bg-gray-50 rounded-lg">
        <p class="text-2xl font-bold text-gray-600">{{ queuedCount }}</p>
        <p class="text-sm text-gray-500">Queued</p>
      </div>
      <div class="p-3 bg-blue-50 rounded-lg">
        <p class="text-2xl font-bold text-blue-600">{{ processingCount }}</p>
        <p class="text-sm text-blue-500">Processing</p>
      </div>
      <div class="p-3 bg-green-50 rounded-lg">
        <p class="text-2xl font-bold text-green-600">{{ completedCount }}</p>
        <p class="text-sm text-green-500">Completed</p>
      </div>
      <div class="p-3 bg-red-50 rounded-lg">
        <p class="text-2xl font-bold text-red-600">{{ failedCount }}</p>
        <p class="text-sm text-red-500">Failed</p>
      </div>
    </div>
    
    <!-- Time Estimate -->
    <div v-if="estimatedTimeRemaining" class="mt-4 text-center text-sm text-gray-600">
      <p>Estimated time remaining: {{ estimatedTimeRemaining }}</p>
    </div>
    
    <!-- Status Messages -->
    <div v-if="statusMessage" class="mt-4 p-3 rounded-lg text-sm" :class="statusClass">
      {{ statusMessage }}
    </div>
    
    <!-- Actions -->
    <div class="mt-6 flex gap-3 justify-center">
      <button
        v-if="canRetryFailed && failedCount > 0"
        @click="retryFailed"
        class="btn-secondary"
      >
        Retry Failed ({{ failedCount }})
      </button>

      <button
        v-if="progress > 0 || status === 'completed' || status === 'running'"
        @click="viewResults"
        class="btn-primary"
      >
        {{ status === 'completed' ? 'View Results' : 'View Current Results' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSupabaseClient, useRuntimeConfig, useSupabaseSession } from '#imports'
import { useRouter } from '#app'

const props = defineProps({
  analysisRunId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['complete'])

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const session = useSupabaseSession()
const router = useRouter()

// State
const queueStatus = ref(null)
const analysisRun = ref(null)
const interval = ref(null)
const lastUpdateTime = ref(Date.now())
const processingRate = ref(0)
const startTime = ref(Date.now())
const hasEmittedProgress = ref(false)

// Computed properties
const isQueue = computed(() => analysisRun.value?.processing_method === 'queue')
const status = computed(() => analysisRun.value?.status || 'pending')
const totalCount = computed(() => analysisRun.value?.queries_total || 0)
const completedCount = computed(() => analysisRun.value?.queries_completed || 0)
const queuedCount = computed(() => analysisRun.value?.queries_queued || 0)
const processingCount = computed(() => analysisRun.value?.queries_processing || 0)
const failedCount = computed(() => analysisRun.value?.queries_failed || 0)

const progress = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

const progressBarClass = computed(() => {
  if (progress.value === 100) return 'bg-green-500'
  if (failedCount.value > 0) return 'bg-yellow-500'
  return 'bg-blue-500'
})

const estimatedTimeRemaining = computed(() => {
  if (processingRate.value === 0 || processingCount.value === 0) return null
  
  const remaining = totalCount.value - completedCount.value
  const secondsRemaining = Math.ceil(remaining / processingRate.value)
  
  if (secondsRemaining < 60) return `${secondsRemaining} seconds`
  if (secondsRemaining < 3600) return `${Math.ceil(secondsRemaining / 60)} minutes`
  return `${Math.ceil(secondsRemaining / 3600)} hours`
})

const statusMessage = computed(() => {
  if (status.value === 'completed' && failedCount.value === 0) {
    return 'Analysis completed successfully!'
  }
  if (status.value === 'completed' && failedCount.value > 0) {
    return `Analysis completed with ${failedCount.value} failed queries.`
  }
  if (status.value === 'failed') {
    return 'Analysis failed. Please try again.'
  }
  if (processingCount.value > 0) {
    return `Processing ${processingCount.value} queries...`
  }
  if (queuedCount.value > 0) {
    return `${queuedCount.value} queries waiting in queue...`
  }
  return null
})

const statusClass = computed(() => {
  if (status.value === 'completed' && failedCount.value === 0) return 'bg-green-100 text-green-800'
  if (status.value === 'completed' && failedCount.value > 0) return 'bg-yellow-100 text-yellow-800'
  if (status.value === 'failed') return 'bg-red-100 text-red-800'
  return 'bg-blue-100 text-blue-800'
})

const canRetryFailed = computed(() => status.value === 'completed' || status.value === 'failed')

// Methods
async function fetchStatus() {
  try {
    // Get analysis run data
    const { data: runData, error: runError } = await supabase
      .from('analysis_runs')
      .select('*')
      .eq('id', props.analysisRunId)
      .single()

    if (runError) throw runError

    // Calculate processing rate
    const currentTime = Date.now()
    const timeDiff = (currentTime - lastUpdateTime.value) / 1000 // seconds
    const completedDiff = (runData.queries_completed || 0) - (analysisRun.value?.queries_completed || 0)

    if (timeDiff > 0 && completedDiff > 0) {
      processingRate.value = completedDiff / timeDiff
    }

    lastUpdateTime.value = currentTime
    analysisRun.value = runData

    // Get queue status if queue processing
    if (runData.processing_method === 'queue') {
      const { data: queueData, error: queueError } = await supabase
        .from('queue_status')
        .select('*')
        .eq('analysis_run_id', props.analysisRunId)
        .single()

      if (!queueError) {
        queueStatus.value = queueData
      }

      // Check for stuck items - if we haven't seen progress in 30 seconds and still have pending items
      const elapsedSinceLastUpdate = (currentTime - lastUpdateTime.value) / 1000

      if (runData.status === 'running' && elapsedSinceLastUpdate > 30 && completedDiff === 0) {
        // Check if there are still pending items
        const { count: pendingCount } = await supabase
          .from('analysis_queue')
          .select('id', { count: 'exact', head: true })
          .eq('analysis_run_id', props.analysisRunId)
          .eq('status', 'pending');

        if (pendingCount > 0) {
          console.log(`Detected ${pendingCount} pending items with no progress for 30+ seconds, triggering more workers`);
          // Trigger additional workers to process remaining items
          for (let i = 0; i < 2; i++) {
            fetch(`${config.public.supabase.url}/functions/v1/process-queue-worker`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.value?.access_token}`
              },
              body: JSON.stringify({ batch_size: 10 })
            }).catch(err => console.error('Error triggering additional worker:', err));
          }
        }
      }
    }

    // Check if completed or has significant progress
    if (runData.status === 'completed' || runData.status === 'failed') {
      stopPolling()
      emit('complete', runData)
    }

    // If we have at least some results, notify the parent (after 30 seconds)
    const elapsedTime = (currentTime - startTime.value) / 1000
    if (elapsedTime > 30 && runData.queries_completed > 0 && !hasEmittedProgress.value) {
      hasEmittedProgress.value = true
      console.log('Emitting partial progress completion')
      emit('complete', runData)
    }

  } catch (error) {
    console.error('Error fetching status:', error)
  }
}

async function retryFailed() {
  try {
    // Reset failed queue items to pending
    const { error } = await supabase
      .from('analysis_queue')
      .update({
        status: 'pending',
        attempts: 0,
        error_message: null,
        error_details: null
      })
      .eq('analysis_run_id', props.analysisRunId)
      .eq('status', 'failed')

    if (error) throw error

    // Update analysis run
    await supabase
      .from('analysis_runs')
      .update({
        status: 'running',
        queries_failed: 0
      })
      .eq('id', props.analysisRunId)

    // Trigger multiple workers in parallel for better throughput
    const workerPromises = [];
    for (let i = 0; i < 3; i++) {
      workerPromises.push(
        fetch(`${config.public.supabase.url}/functions/v1/process-queue-worker`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.value?.access_token}`
          },
          body: JSON.stringify({
            batch_size: 10,
            max_runtime: 25000
          })
        })
      );
    }

    await Promise.all(workerPromises);
    console.log('Multiple queue workers triggered for retry');

    // Schedule a follow-up check after 30 seconds to trigger more workers if needed
    setTimeout(async () => {
      const { data: pendingCount } = await supabase
        .from('analysis_queue')
        .select('id', { count: 'exact', head: true })
        .eq('analysis_run_id', props.analysisRunId)
        .eq('status', 'pending');

      if (pendingCount > 0) {
        console.log(`Still have ${pendingCount} pending items, triggering more workers`);
        fetch(`${config.public.supabase.url}/functions/v1/process-queue-worker`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.value?.access_token}`
          },
          body: JSON.stringify({ batch_size: 10 })
        });
      }
    }, 30000);

    // Resume polling
    startPolling()

  } catch (error) {
    console.error('Error retrying failed queries:', error)
  }
}

function viewResults() {
  router.push(`/dashboard/analysis/${props.analysisRunId}`)
}

function startPolling() {
  if (interval.value) return

  fetchStatus() // Initial fetch
  interval.value = setInterval(fetchStatus, 2000) // Poll every 2 seconds for more frequent updates
}

function stopPolling() {
  if (interval.value) {
    clearInterval(interval.value)
    interval.value = null
  }
}

// Lifecycle
onMounted(() => {
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>
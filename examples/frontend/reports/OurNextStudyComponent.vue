<!-- components/labs/reports/OurNextStudyComponent.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
    <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Our Next Study</h3>
    
    <!-- Coming Soon Banner with Platforms Silhouette -->
    <div class="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-burntOrangeDark rounded-lg p-6 mb-8">
      <div class="absolute -right-8 -bottom-8 opacity-10">
        <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Stylized AI Platform Silhouettes -->
          <circle cx="75" cy="50" r="30" fill="white" />
          <rect x="40" y="90" width="70" height="40" rx="5" fill="white" />
          <path d="M30 70C30 70 45 90 75 90C105 90 120 70 120 70" stroke="white" stroke-width="3" />
          <rect x="15" y="20" width="120" height="5" rx="2.5" fill="white" />
          <rect x="15" y="30" width="80" height="5" rx="2.5" fill="white" />
        </svg>
      </div>
      
      <div class="relative z-10">
        <div class="text-white font-bold text-2xl mb-4">Coming June 2025</div>
        <p class="text-white text-opacity-90 mb-6">
          Our expanded study will include AI Overviews, Gemini, and more platforms to provide a comprehensive analysis of generative engine optimization patterns.
        </p>
        
        <!-- Platform Tags -->
        <div class="flex flex-wrap gap-2 mb-6">
          <span class="px-3 py-1 bg-white bg-opacity-20 text-white rounded-full text-sm">AI Overviews</span>
          <span class="px-3 py-1 bg-white bg-opacity-20 text-white rounded-full text-sm">Gemini</span>
          <span class="px-3 py-1 bg-white bg-opacity-20 text-white rounded-full text-sm">Claude</span>
          <span class="px-3 py-1 bg-white bg-opacity-20 text-white rounded-full text-sm">New Data Points</span>
        </div>
      </div>
    </div>
    
    <!-- Timeline of Study Evolution (Exact Match) -->
    <div class="mb-8">
      <h4 class="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Study Evolution</h4>
      
      <div class="space-y-6">
        <!-- May 2025 (Previous) -->
        <div class="pt-4 relative">
          <!-- Month pill -->
          <div class="absolute top-0 left-0">
            <div class="px-3 py-1 bg-burntOrangeDark text-white text-xs font-bold rounded-md">
              MAY 2025
            </div>
          </div>
          
          <div class="mt-8 p-6 bg-white dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 class="text-base font-medium text-gray-800 dark:text-gray-200">Core Sample Analysis</h5>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Initial analysis of ChatGPT and Perplexity citation patterns.</p>
            <div class="mt-2 flex items-center">
              <div class="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span class="text-xs text-green-600 dark:text-green-400">Completed</span>
            </div>
          </div>
        </div>
        
        <!-- June 2025 (Current) -->
        <div class="pt-4 relative">
          <!-- Month pill -->
          <div class="absolute top-0 left-0">
            <div class="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-md">
              JUN 2025
            </div>
          </div>
          
          <div class="mt-8 p-6 bg-white dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 class="text-base font-medium text-gray-800 dark:text-gray-200">Expanded Platform Analysis</h5>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Adding AI Overviews, Gemini, and more diverse query types.</p>
            <div class="mt-4">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div class="bg-blue-500 h-2.5 rounded-full" style="width: 45%"></div>
              </div>
              <div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Setting up analysis</span>
                <span>45%</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Summer 2025 (Future) -->
        <div class="pt-4 relative">
          <!-- Month pill -->
          <div class="absolute top-0 left-0">
            <div class="px-3 py-1 bg-gray-400 dark:bg-gray-600 text-white text-xs font-bold rounded-md">
              SUMMER 2025
            </div>
          </div>
          
          <div class="mt-8 p-6 bg-white dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 class="text-base font-medium text-gray-800 dark:text-gray-200">Experimental Application</h5>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Testing GEO tactics in real-world content scenarios.</p>
            <div class="mt-4">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div class="bg-gray-400 dark:bg-gray-600 h-2.5 rounded-full" style="width: 10%"></div>
              </div>
              <div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Planning phase</span>
                <span>10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sign-up Form (Custom Styled) -->
    <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-6">
      <h4 class="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Get Early Access To Our Next Report</h4>
      
      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          If you want to get early access to our next report, sign up and I'll send you an email when it's ready. 
        </p>
      </div>
      
      <!-- Custom Styled Form -->
      <div>
        <!-- Form or Success Message -->
        <div v-if="!formSuccess">
          <form id="custom-subscribe-form" class="space-y-4" @submit.prevent="submitForm">
            <!-- Email Field -->
            <div>
              <div class="relative">
                <input
                  type="email"
                  id="subscriber-email"
                  v-model="email"
                  class="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-burntOrangeDark focus:border-burntOrangeDark text-gray-900 dark:text-gray-100"
                  placeholder="Your email address"
                  required
                />
              </div>
              <p v-if="formError" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ formError }}</p>
            </div>
            
            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                class="w-full px-4 py-2.5 bg-gradient-to-r from-burntOrangeDark to-jasperOrange hover:from-burntOrange hover:to-burntOrangeDark text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burntOrangeDark transition-colors"
                :disabled="isSubmitting"
              >
                <span v-if="!isSubmitting">Sign Up</span>
                <span v-else class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subscribing...
                </span>
              </button>
            </div>

            <!-- Terms Agreement (required by MailerLite) -->
            <div class="text-xs text-gray-500 dark:text-gray-400">
              I'll only email you about new reports. You can unsusbscribe at any time.
            </div>
          </form>

          <!-- Actual MailerLite Form (Hidden but functional) -->
          <div class="hidden">
            <form id="ml-form" ref="mlForm" :action="mailerliteFormAction" method="post" target="_blank">
              <input type="hidden" name="fields[email]" :value="email">
              <input type="hidden" name="ml-submit" value="1">
              <input type="hidden" name="anticsrf" :value="anticsrfToken">
            </form>
          </div>
        </div>
        
        <!-- Success Message -->
        <div v-else class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800 dark:text-green-300">Thank you!</h3>
              <div class="mt-2 text-sm text-green-700 dark:text-green-400">
                <p>You've successfully subscribed and will be the first to know about our upcoming reports.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Form state
const email = ref('');
const isSubmitting = ref(false);
const formError = ref('');
const formSuccess = ref(false);
const mlForm = ref(null);
const anticsrfToken = ref('');

// The MailerLite form ID and action URL
const FORM_ID = 'S3X9l8'; // Your MailerLite form ID
const mailerliteFormAction = `https://static.mailerlite.com/webforms/submit/${FORM_ID}`;

// Generate anti-CSRF token for security
const generateAnticsrf = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Handle form submission
const submitForm = async () => {
  try {
    // Reset state and show loading
    isSubmitting.value = true;
    formError.value = '';
    
    // Client-side validation
    if (!email.value || !/^\S+@\S+\.\S+$/.test(email.value)) {
      formError.value = 'Please enter a valid email address';
      isSubmitting.value = false;
      return;
    }
    
    // Directly submit form data to MailerLite
    const formData = new FormData();
    formData.append('fields[email]', email.value);
    formData.append('ml-submit', '1');
    formData.append('anticsrf', anticsrfToken.value);
    
    // Send the data to MailerLite
    const response = await fetch(mailerliteFormAction, {
      method: 'POST',
      body: formData,
      mode: 'no-cors' // Required for cross-origin requests to MailerLite
    });
    
    // Since we're using no-cors, we can't check response status
    // We'll assume success and let MailerLite handle any email validation issues
    
    // Show success and reset form
    formSuccess.value = true;
    email.value = '';
    
  } catch (error) {
    // Handle any error gracefully
    console.error('Subscription error:', error);
    formError.value = 'An error occurred. Please try again later.';
  } finally {
    // Always reset submitting state
    isSubmitting.value = false;
  }
};

// Initialize component when mounted
onMounted(() => {
  // Generate a new anti-CSRF token
  anticsrfToken.value = generateAnticsrf();
  
  // Add MailerLite script if not already present
  if (!document.getElementById('mailerlite-universal')) {
    const script = document.createElement('script');
    script.id = 'mailerlite-universal';
    script.src = 'https://static.mailerlite.com/js/universal.js';
    script.async = true;
    document.head.appendChild(script);
  }
});
</script>

<style scoped>
/* Custom styling */
</style>
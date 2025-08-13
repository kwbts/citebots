// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],
  css: ['~/assets/css/main.css'],
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    redirectOptions: {
      login: '/',
      callback: '/dashboard',
      exclude: ['/']
    }
  },
  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    perplexityApiKey: process.env.PERPLEXITY_API_KEY,
    scrapingbeeApiKey: process.env.SCRAPINGBEE_API_KEY,
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
    }
  },
  app: {
    head: {
      title: 'Citebots - GEO Analytics Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Generative Engine Optimization Dashboard' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  ssr: false, // SPA mode for MVP
  nitro: {
    preset: 'static'
  },
  // Add routes configuration to ensure dynamic routes are properly generated
  router: {
    options: {
      strict: false
    }
  },
  // Configure generate to handle dynamic routes
  generate: {
    fallback: true
  }
})
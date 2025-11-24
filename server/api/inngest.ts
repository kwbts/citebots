import { serve } from "inngest/nuxt";
import { inngest } from "../../inngest/client";

// Import all Inngest functions
import { helloWorld } from "../../inngest/functions/hello-world";
import { enhanceClientWithAI } from "../../inngest/functions/enhance-client-with-ai";

// Export the serve handler for Nuxt
export default serve({
  client: inngest,
  functions: [
    helloWorld,
    enhanceClientWithAI
  ]
});

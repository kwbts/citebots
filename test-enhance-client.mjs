// Test script for the migrated enhance-client-with-ai function
// Run with: node test-enhance-client.mjs

import { Inngest } from "inngest";

const inngest = new Inngest({ id: "citebots-test" });

async function testEnhanceClient() {
  console.log("🧪 Testing enhance-client-with-ai Inngest function...\n");

  // Example client data - replace with real client ID from your database
  const testData = {
    clientId: "00000000-0000-0000-0000-000000000000", // Replace with actual UUID
    clientName: "Anthropic",
    clientDomain: "anthropic.com"
  };

  console.log("📤 Sending event with data:");
  console.log(JSON.stringify(testData, null, 2));
  console.log();

  try {
    const result = await inngest.send({
      name: "client/enhance.requested",
      data: testData
    });

    console.log("✅ Event sent successfully!");
    console.log("Event IDs:", result.ids);
    console.log("\n📊 Check the Inngest Dev Server UI to see the function execution:");
    console.log("   http://localhost:8288");
    console.log("\nYou'll see:");
    console.log("  1. ⏳ Step 1: Calling OpenAI for business intelligence");
    console.log("  2. 🔄 Step 2: Processing and limiting AI data");
    console.log("  3. 💾 Step 3: Updating client record in database");
    console.log("  4. 🏢 Step 4: Upserting competitors");
    console.log("\nEach step is checkpointed - if any step fails, it won't re-run previous steps!");

  } catch (error) {
    console.error("❌ Error sending event:", error.message);
    console.log("\nMake sure:");
    console.log("1. Inngest Dev Server is running: npm run inngest:dev");
    console.log("2. Nuxt dev server is running: npm run dev");
    console.log("3. Environment variables are set (OPENAI_API_KEY, SUPABASE keys)");
  }
}

testEnhanceClient();

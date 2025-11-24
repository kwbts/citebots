// Simple script to test Inngest integration
// Run with: node test-inngest.mjs

import { Inngest } from "inngest";

const inngest = new Inngest({ id: "citebots-test" });

async function testHelloWorld() {
  console.log("🧪 Testing Inngest hello-world function...\n");

  try {
    // Send a test event
    const result = await inngest.send({
      name: "test/hello.world",
      data: {
        name: "Citebots Team"
      }
    });

    console.log("✅ Event sent successfully!");
    console.log("Event IDs:", result.ids);
    console.log("\n📊 Check the Inngest Dev Server UI to see the function run:");
    console.log("   http://localhost:8288");

  } catch (error) {
    console.error("❌ Error sending event:", error.message);
    console.log("\nMake sure:");
    console.log("1. Inngest Dev Server is running: npx inngest-cli@latest dev");
    console.log("2. Nuxt dev server is running: npm run dev");
  }
}

testHelloWorld();

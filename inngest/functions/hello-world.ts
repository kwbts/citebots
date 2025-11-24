import { inngest } from "../client";

// Simple test function to verify Inngest integration works
export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    name: "Hello World Test Function"
  },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const message = await step.run("create-greeting", async () => {
      return `Hello ${event.data.name || "World"}! Inngest is working!`;
    });

    const timestamp = await step.run("add-timestamp", async () => {
      return new Date().toISOString();
    });

    return {
      message,
      timestamp,
      eventData: event.data
    };
  }
);

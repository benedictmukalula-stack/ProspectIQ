import type { EmailOptions } from "./types.js";

// Always-failing provider for testing DLQ
const failingProvider = {
  send: async (options: EmailOptions) => {
    throw new Error("Simulated provider failure for testing");
  },
  name: "failing",
};

export const emailClient = {
  send: async (options: EmailOptions): Promise<void> => {
    await failingProvider.send(options);
  },
};

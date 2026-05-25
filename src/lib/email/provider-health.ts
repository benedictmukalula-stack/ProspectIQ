import type { EmailOptions } from "./types.js";

interface ScoredProvider {
  name: string;
  send: (options: EmailOptions) => Promise<void>;
  healthScore: number;
  lastErrorTime: number | null;
  successCount: number;
  failCount: number;
}

const mockProvider: ScoredProvider = {
  name: "mock",
  send: async (options) => console.log(`[MOCK] Sending to ${options.to}`),
  healthScore: 100,
  lastErrorTime: null,
  successCount: 0,
  failCount: 0,
};

let resendProvider: ScoredProvider | null = null;
if (process.env.RESEND_API_KEY) {
  resendProvider = {
    name: "resend",
    send: async (options) => {
      const { Resend } = await import('resend');
      const client = new Resend(process.env.RESEND_API_KEY);
      await client.emails.send({
        from: options.from || "onboarding@resend.dev",
        to: options.to,
        subject: options.subject,
        html: options.body,
      });
    },
    healthScore: 100,
    lastErrorTime: null,
    successCount: 0,
    failCount: 0,
  };
}

const providers: ScoredProvider[] = [];
if (resendProvider) providers.push(resendProvider);
providers.push(mockProvider);

setInterval(() => {
  for (const p of providers) {
    if (p.lastErrorTime && Date.now() - p.lastErrorTime < 60000) {
      p.healthScore = Math.max(0, p.healthScore - 10);
    } else {
      p.healthScore = Math.min(100, p.healthScore + 5);
    }
    const total = p.successCount + p.failCount;
    if (total > 10) {
      const ratio = p.successCount / total;
      p.healthScore = Math.min(100, (p.healthScore + ratio * 20) / 2);
    }
  }
}, 10000);

export const emailClientWithHealth = {
  send: async (options: EmailOptions): Promise<string> => {
    const sorted = [...providers].sort((a, b) => b.healthScore - a.healthScore);
    for (const provider of sorted) {
      try {
        await provider.send(options);
        provider.successCount++;
        provider.lastErrorTime = null;
        return provider.name;
      } catch (err) {
        provider.failCount++;
        provider.lastErrorTime = Date.now();
        console.error(`Provider ${provider.name} failed:`, err);
      }
    }
    throw new Error("All providers failed");
  },
};

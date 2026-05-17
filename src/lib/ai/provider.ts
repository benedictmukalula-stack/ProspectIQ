type AIMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

function createMockSalesOutput(prompt: string) {
  if (prompt.includes("email_draft")) {
    return `Subject: Improving prospecting and sales workflow visibility

Hi there,

I noticed your team may be handling prospect research, enrichment, outreach, and CRM follow-up across multiple tools.

ProspectIQ helps sales teams centralize lead intelligence, automate research workflows, score prospects, and prepare personalized outbound campaigns from one dashboard.

Would it make sense to schedule a short introduction to see whether this could improve your current sales process?

Best regards,
ProspectIQ Team`
  }

  if (prompt.includes("lead_score")) {
    return `Lead Score: 87/100

Reasoning:
This prospect appears to be a strong fit based on operational responsibility, likely buying influence, and relevance to sales intelligence automation.

Recommended next action:
Prioritize for a personalized discovery email and follow-up task.`
  }

  return `ProspectIQ AI Output

This workflow completed successfully in mock mode.

Add OPENAI_API_KEY and set DISABLE_REAL_AI=false to enable live AI execution.`
}

export async function runAI({
  system,
  prompt,
}: {
  system?: string
  prompt: string
}) {
  if (process.env.DISABLE_REAL_AI === "true" || !process.env.OPENAI_API_KEY) {
    return {
      provider: "mock",
      model: "mock-sales-intelligence",
      content: createMockSalesOutput(prompt),
      usage: {
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
      },
    }
  }

  const messages: AIMessage[] = [
    {
      role: "system",
      content:
        system ||
        "You are ProspectIQ, an AI sales intelligence assistant for CRM, lead scoring, enrichment, and outbound workflow automation.",
    },
    {
      role: "user",
      content: prompt,
    },
  ]

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.4,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message || "AI provider request failed")
  }

  return {
    provider: "openai",
    model: data.model,
    content: data.choices?.[0]?.message?.content || "",
    usage: {
      input_tokens: data.usage?.prompt_tokens || 0,
      output_tokens: data.usage?.completion_tokens || 0,
      total_tokens: data.usage?.total_tokens || 0,
    },
  }
}

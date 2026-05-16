type AIMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export async function runAI({
  system,
  prompt,
}: {
  system?: string
  prompt: string
}) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      provider: "mock",
      model: "mock-sales-intelligence",
      content:
        "Mock AI output: Add OPENAI_API_KEY to enable real AI workflow execution.",
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

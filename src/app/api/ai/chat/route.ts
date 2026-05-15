import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatRequest = {
  messages: ChatMessage[];
  workspaceContext: {
    leads: unknown[];
    campaigns: unknown[];
    overview: unknown;
  };
};

function buildSystemPrompt(context: ChatRequest["workspaceContext"]) {
  return `
You are ProspectIQ AI, a B2B sales intelligence assistant.

Use the workspace context below to answer clearly and practically.

Workspace Context:
${JSON.stringify(context, null, 2)}

Rules:
- Give direct sales/business recommendations.
- Prioritize leads by score, status, company, and role.
- Suggest next actions.
- Do not invent private contact details.
- If data is missing, say what is missing.
`;
}

async function callOpenAI(payload: ChatRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(payload.workspaceContext),
        },
        ...payload.messages,
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "OpenAI request failed.");
  }

  return data.choices?.[0]?.message?.content || "No response generated.";
}

async function callZhipu(payload: ChatRequest) {
  const apiKey = process.env.ZHIPU_API_KEY;

  if (!apiKey) {
    throw new Error("ZHIPU_API_KEY is not configured.");
  }

  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ZHIPU_MODEL || "glm-4-flash",
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(payload.workspaceContext),
        },
        ...payload.messages,
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Zhipu request failed.");
  }

  return data.choices?.[0]?.message?.content || "No response generated.";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ChatRequest;
    const provider = process.env.LLM_PROVIDER || "openai";

    if (!payload.messages?.length) {
      return NextResponse.json(
        { error: "Messages are required." },
        { status: 400 }
      );
    }

    const content =
      provider === "zhipu"
        ? await callZhipu(payload)
        : await callOpenAI(payload);

    return NextResponse.json({
      provider,
      content,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate AI response.",
      },
      { status: 500 }
    );
  }
}

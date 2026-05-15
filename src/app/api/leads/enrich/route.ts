import { NextResponse } from "next/server";

type EnrichRequest = {
  name?: string;
  company?: string;
  role?: string | null;
  email?: string | null;
  status?: string;
};

function calculateLeadScore(lead: EnrichRequest) {
  let score = 35;

  const role = (lead.role || "").toLowerCase();
  const company = (lead.company || "").toLowerCase();
  const email = lead.email || "";

  if (lead.name?.trim()) score += 8;
  if (lead.company?.trim()) score += 12;
  if (lead.role?.trim()) score += 12;
  if (email.includes("@")) score += 10;

  if (
    role.includes("director") ||
    role.includes("founder") ||
    role.includes("owner") ||
    role.includes("ceo") ||
    role.includes("manager") ||
    role.includes("head") ||
    role.includes("lead")
  ) {
    score += 18;
  }

  if (
    company.includes("freight") ||
    company.includes("logistics") ||
    company.includes("export") ||
    company.includes("trade") ||
    company.includes("cargo") ||
    company.includes("procurement") ||
    company.includes("supply")
  ) {
    score += 15;
  }

  return Math.max(0, Math.min(100, score));
}

function statusFromScore(score: number) {
  if (score >= 85) return "Hot";
  if (score >= 70) return "Qualified";
  if (score >= 55) return "Warm";
  return "New";
}

function buildInsights(lead: EnrichRequest, score: number) {
  const insights: string[] = [];

  if (score >= 85) {
    insights.push("High-priority prospect with strong buying potential.");
  } else if (score >= 70) {
    insights.push("Qualified lead worth active sales follow-up.");
  } else if (score >= 55) {
    insights.push("Moderate-fit lead that needs more qualification.");
  } else {
    insights.push("Early-stage lead with limited available qualification data.");
  }

  if (lead.role) {
    insights.push(`Role signal detected: ${lead.role}.`);
  }

  if (lead.email) {
    insights.push("Email available for direct outreach.");
  } else {
    insights.push("Email missing; enrichment or manual research recommended.");
  }

  return insights;
}

export async function POST(request: Request) {
  try {
    const lead = (await request.json()) as EnrichRequest;

    const score = calculateLeadScore(lead);
    const status = statusFromScore(score);
    const insights = buildInsights(lead, score);

    return NextResponse.json({
      score,
      status,
      insights,
      source: "ProspectIQ scoring engine",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to enrich lead." },
      { status: 400 }
    );
  }
}

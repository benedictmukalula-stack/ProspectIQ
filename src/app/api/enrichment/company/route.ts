import { NextResponse } from "next/server";

type EnrichmentRequest = {
  company: string;
  website?: string;
  email?: string;
};

function inferIndustry(company: string) {
  const name = company.toLowerCase();

  if (name.includes("freight") || name.includes("cargo") || name.includes("logistics")) {
    return "Logistics & Freight";
  }

  if (name.includes("trade") || name.includes("export") || name.includes("import")) {
    return "Trade & Export";
  }

  if (name.includes("procurement") || name.includes("supply")) {
    return "Procurement & Supply Chain";
  }

  return "General Business";
}

function fallbackEnrichment(input: EnrichmentRequest) {
  const industry = inferIndustry(input.company);

  return {
    provider: "ProspectIQ fallback enrichment",
    company: input.company,
    website: input.website || null,
    industry,
    size_estimate: "Unknown",
    region: "Unknown",
    confidence: 65,
    signals: [
      `Detected likely industry: ${industry}.`,
      "External enrichment provider not configured yet.",
      "Add ENRICHMENT_API_KEY to enable live provider enrichment.",
    ],
  };
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as EnrichmentRequest;

    if (!input.company?.trim()) {
      return NextResponse.json(
        { error: "Company name is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ENRICHMENT_API_KEY;
    const apiUrl = process.env.ENRICHMENT_API_URL;

    if (!apiKey || !apiUrl) {
      return NextResponse.json(fallbackEnrichment(input));
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        ...fallbackEnrichment(input),
        provider_error: data?.message || "External enrichment provider failed.",
      });
    }

    return NextResponse.json({
      provider: "External enrichment provider",
      company: input.company,
      raw: data,
      confidence: 90,
      signals: [
        "Live external enrichment completed.",
        "Review raw provider data before using for sales decisions.",
      ],
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to enrich company." },
      { status: 500 }
    );
  }
}

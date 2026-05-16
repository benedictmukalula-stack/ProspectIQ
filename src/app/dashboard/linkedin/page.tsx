"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  createBrowserSupabaseClient,
  isDemoMode,
  supabaseAuth,
} from "@/lib/supabase/client";

type LinkedInLead = {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  company_name: string;
  designation: string;
  phone_number: string;
  mobile_number: string;
  email: string;
  linkedin_url: string;
  country: string;
  city: string;
  comments: string;
  source: string;
};

const emptyLead = {
  first_name: "",
  middle_name: "",
  last_name: "",
  company_name: "",
  designation: "",
  phone_number: "",
  mobile_number: "",
  email: "",
  linkedin_url: "",
  country: "",
  city: "",
  comments: "",
  source: "Public LinkedIn URL / manual entry",
};

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    first_name: parts[0] || "",
    middle_name: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    last_name: parts.length > 1 ? parts[parts.length - 1] : "",
  };
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
}

function extractPhone(text: string) {
  return (
    text.match(/(?:\+?\d{1,4}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/)?.[0] ||
    ""
  );
}

function extractLinkedInUrl(text: string) {
  return text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s]+/i)?.[0] || "";
}

function inferDesignation(lines: string[]) {
  return (
    lines.find((line) =>
      /(director|manager|founder|owner|ceo|head|lead|officer|executive|specialist|coordinator|procurement|logistics|operations)/i.test(line)
    ) || ""
  );
}

function inferCompany(lines: string[]) {
  const atLine = lines.find((line) => /\sat\s/i.test(line);
  if (atLine) return atLine.split(/\sat\s/i).pop()?.trim() || "";

  return (
    lines.find((line) =>
      /(freight|logistics|cargo|trade|export|import|procurement|supply|solutions|group|limited|ltd|pty)/i.test(line)
    ) || ""
  );
}

function inferLocation(lines: string[]) {
  const locationLine =
    lines.find((line) =>
      /(south africa|zambia|botswana|namibia|kenya|nigeria|ghana|johannesburg|sandton|cape town|durban|lusaka|ndola|kitwe|nairobi|lagos|accra)/i.test(line)
    ) || "";

  const lower = locationLine.toLowerCase();

  let country = "";
  if (lower.includes("south africa")) country = "South Africa";
  if (lower.includes("zambia")) country = "Zambia";
  if (lower.includes("botswana")) country = "Botswana";
  if (lower.includes("namibia")) country = "Namibia";
  if (lower.includes("kenya")) country = "Kenya";
  if (lower.includes("nigeria")) country = "Nigeria";
  if (lower.includes("ghana")) country = "Ghana";

  const cities = [
    "Johannesburg",
    "Sandton",
    "Cape Town",
    "Durban",
    "Lusaka",
    "Ndola",
    "Kitwe",
    "Nairobi",
    "Lagos",
    "Accra",
  ];

  const city = cities.find((item) => lower.includes(item.toLowerCase())) || "";

  return { country, city };
}

export default function LinkedInSearchPage() {
  const [keywords, setKeywords] = useState("");
  const [designation, setDesignation] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [directUrl, setDirectUrl] = useState("");
  const [publicProfileText, setPublicProfileText] = useState("");
  const [leadForm, setLeadForm] = useState(emptyLead);
  const [leads, setLeads] = useState<LinkedInLead[]>([]);
  const [savingToCrmId, setSavingToCrmId] = useState<string | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [message, setMessage] = useState("");

  const searchQueries = useMemo(() => {
    const locationQuery = [city, country, location].filter(Boolean).join(" ");
    const parts = [
      keywords,
      designation ? `"${designation}"` : "",
      company ? `"${company}"` : "",
      locationQuery ? `"${locationQuery}"` : "",
      industry ? `"${industry}"` : "",
    ].filter(Boolean);

    const query = parts.join(" ");

    return {
      google: `site:linkedin.com/in ${query}`,
      googleContacts: `site:linkedin.com/in ${query} email OR phone OR mobile`,
      linkedinPeople: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`,
      linkedinCompanies: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company || keywords || "")}`,
    };
  }, [keywords, designation, company, location, country, city, industry]);

  async function getWorkspace() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return { supabase: null, userId: null, organizationId: null, error: "Supabase unavailable." };
    }

    const userResult = await supabaseAuth.getUser();

    if (userResult.error || !userResult.data.user) {
      return { supabase, userId: null, organizationId: null, error: "No active session." };
    }

    const workspaceResult = await supabase.rpc("ensure_user_workspace");

    if (workspaceResult.error || !workspaceResult.data?.[0]) {
      return { supabase, userId: userResult.data.user.id, organizationId: null, error: "Workspace not ready." };
    }

    return {
      supabase,
      userId: userResult.data.user.id,
      organizationId: workspaceResult.data[0].organization_id,
      error: null,
    };
  }

  function extractFromPublicText() {
    const lines = publicProfileText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const fullName = lines[0] || "";
    const nameParts = splitName(fullName);
    const email = extractEmail(publicProfileText);
    const phone = extractPhone(publicProfileText);
    const linkedinUrl = extractLinkedInUrl(publicProfileText);
    const locationData = inferLocation(lines);

    setLeadForm({
      ...leadForm,
      ...nameParts,
      email,
      phone_number: phone,
      mobile_number: phone.startsWith("+") ? phone : "",
      linkedin_url: linkedinUrl,
      designation: inferDesignation(lines),
      company_name: inferCompany(lines),
      country: locationData.country || country,
      city: locationData.city || city,
      comments: publicProfileText.slice(0, 500),
      source: "Public profile text extraction",
    });

    setMessage("Public profile text extracted into the capture form.");
  }

  async function enrichLinkedInProfile(url: string) {
    if (!url.trim()) {
      setMessage("Paste a LinkedIn profile URL first.");
      return;
    }

    setEnriching(true);
    setMessage("");

    const response = await fetch("/api/linkedin/enrich", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ linkedinUrl: url.trim() }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "LinkedIn enrichment failed.");
      setEnriching(false);
      return;
    }

    const profile = data.profile;

    const enrichedLead: LinkedInLead = {
      id: crypto.randomUUID(),
      first_name: profile.first_name || "",
      middle_name: "",
      last_name: profile.last_name || "",
      company_name: profile.company || "",
      designation: profile.title || profile.occupation || profile.headline || "",
      phone_number: profile.phones?.[0] || "",
      mobile_number: profile.phones?.[0] || "",
      email: profile.emails?.[0] || "",
      linkedin_url: profile.linkedin_url || url,
      country: profile.country || "",
      city: profile.city || "",
      comments: profile.summary || profile.headline || "",
      source: "Proxycurl enrichment",
    };

    setLeads((current) => [enrichedLead, ...current]);
    setLeadForm(enrichedLead);
    setDirectUrl("");
    setMessage("LinkedIn profile enriched successfully.");
    setEnriching(false);
  }

  function addLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!leadForm.first_name.trim() || !leadForm.company_name.trim()) {
      setMessage("First name and company name are required.");
      return;
    }

    const lead: LinkedInLead = {
      id: crypto.randomUUID(),
      ...leadForm,
    };

    setLeads((current) => [lead, ...current]);
    setLeadForm(emptyLead);
    setPublicProfileText("");
    setMessage("Lead captured locally. You can now save it into CRM leads.");
  }

  async function saveToCrm(lead: LinkedInLead) {
    setSavingToCrmId(lead.id);
    setMessage("");

    if (isDemoMode) {
      setMessage("Demo mode active. Lead captured locally but not saved to Supabase.");
      setSavingToCrmId(null);
      return;
    }

    const workspace = await getWorkspace();

    if (workspace.error || !workspace.supabase || !workspace.organizationId || !workspace.userId) {
      setMessage(`${workspace.error} Lead was not saved to CRM.`);
      setSavingToCrmId(null);
      return;
    }

    const fullName = [lead.first_name, lead.middle_name, lead.last_name]
      .filter(Boolean)
      .join(" ");

    const result = await workspace.supabase
      .from("leads")
      .insert({
        organization_id: workspace.organizationId,
        created_by: workspace.userId,
        name: fullName,
        company: lead.company_name,
        role: lead.designation || null,
        email: lead.email || null,
        score: lead.email || lead.phone_number || lead.mobile_number ? 80 : 65,
        status: lead.email ? "Qualified" : "Warm",
      })
      .select("id")
      .single();

    if (result.error) {
      setMessage(result.error.message);
      setSavingToCrmId(null);
      return;
    }

    setMessage(`${fullName} saved to CRM leads.`);
    setSavingToCrmId(null);
  }

  function exportCsv() {
    const rows = [
      [
        "First Name",
        "Middle Name",
        "Last Name",
        "Company Name",
        "Designation",
        "Phone Number",
        "Mobile Number",
        "Email",
        "LinkedIn URL",
        "Country",
        "City",
        "Comments",
        "Source",
      ],
      ...leads.map((lead) => [
        lead.first_name,
        lead.middle_name,
        lead.last_name,
        lead.company_name,
        lead.designation,
        lead.phone_number,
        lead.mobile_number,
        lead.email,
        lead.linkedin_url,
        lead.country,
        lead.city,
        lead.comments,
        lead.source,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value || "").replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "prospectiq-linkedin-leads.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Research</p>
        <h1 className="mt-2 text-3xl font-bold">LinkedIn Lead Intelligence Engine</h1>
        <p className="mt-2 text-slate-400">
          Search, enrich via Proxycurl, capture public profile data, and save qualified leads into CRM.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <div className="mb-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm text-amber-100">
        This module uses approved API enrichment and public/manual profile input. It does not bypass LinkedIn login, scrape restricted pages, or evade LinkedIn protections.
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-lg font-semibold">Direct Proxycurl Enrichment</h2>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            placeholder="Paste LinkedIn profile URL"
            value={directUrl}
            onChange={(event) => setDirectUrl(event.target.value)}
          />

          <button
            type="button"
            disabled={enriching}
            onClick={() => enrichLinkedInProfile(directUrl)}
            className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {enriching ? "Enriching..." : "Enrich Profile"}
          </button>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-lg font-semibold">Advanced Search Builder</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Keywords e.g. logistics director" value={keywords} onChange={(event) => setKeywords(event.target.value)} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Designation" value={designation} onChange={(event) => setDesignation(event.target.value)} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Company" value={company} onChange={(event) => setCompany(event.target.value)} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Industry" value={industry} onChange={(event) => setIndustry(event.target.value)} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Country e.g. South Africa" value={country} onChange={(event) => setCountry(event.target.value)} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="City e.g. Johannesburg" value={city} onChange={(event) => setCity(event.target.value)} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none md:col-span-2" placeholder="Extra location terms" value={location} onChange={(event) => setLocation(event.target.value)} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-white">Google X-Ray Query</p>
            <p className="mt-3 break-all text-sm text-slate-400">{searchQueries.google}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-white">Contact X-Ray Query</p>
            <p className="mt-3 break-all text-sm text-slate-400">{searchQueries.googleContacts}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-white">LinkedIn People Search</p>
            <a href={searchQueries.linkedinPeople} target="_blank" rel="noreferrer" className="mt-3 block break-all text-sm text-blue-300">
              Open people search
            </a>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-white">LinkedIn Company Search</p>
            <a href={searchQueries.linkedinCompanies} target="_blank" rel="noreferrer" className="mt-3 block break-all text-sm text-blue-300">
              Open company search
            </a>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-lg font-semibold">Extract From Public Profile Text</h2>

        <textarea
          className="min-h-40 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          placeholder="Paste publicly visible profile text here."
          value={publicProfileText}
          onChange={(event) => setPublicProfileText(event.target.value)}
        />

        <button
          type="button"
          onClick={extractFromPublicText}
          className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white"
        >
          Extract Public Details
        </button>
      </div>

      <form onSubmit={addLead} className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-lg font-semibold">Capture Lead Details</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="First name" value={leadForm.first_name} onChange={(e) => setLeadForm({ ...leadForm, first_name: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Middle name" value={leadForm.middle_name} onChange={(e) => setLeadForm({ ...leadForm, middle_name: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Last name" value={leadForm.last_name} onChange={(e) => setLeadForm({ ...leadForm, last_name: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Company name" value={leadForm.company_name} onChange={(e) => setLeadForm({ ...leadForm, company_name: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Designation" value={leadForm.designation} onChange={(e) => setLeadForm({ ...leadForm, designation: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Email if publicly listed" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Phone if publicly listed" value={leadForm.phone_number} onChange={(e) => setLeadForm({ ...leadForm, phone_number: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Mobile if publicly listed" value={leadForm.mobile_number} onChange={(e) => setLeadForm({ ...leadForm, mobile_number: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="LinkedIn profile URL" value={leadForm.linkedin_url} onChange={(e) => setLeadForm({ ...leadForm, linkedin_url: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Country" value={leadForm.country} onChange={(e) => setLeadForm({ ...leadForm, country: e.target.value })} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="City" value={leadForm.city} onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })} />
        </div>

        <textarea
          className="mt-4 min-h-28 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          placeholder="Comments"
          value={leadForm.comments}
          onChange={(event) => setLeadForm({ ...leadForm, comments: event.target.value })}
        />

        <button className="mt-5 rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white">
          Capture Lead
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">Captured LinkedIn Leads</h2>

          <button type="button" onClick={exportCsv} className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white">
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-3">First</th>
                <th className="py-3">Middle</th>
                <th className="py-3">Last</th>
                <th className="py-3">Company</th>
                <th className="py-3">Designation</th>
                <th className="py-3">Phone</th>
                <th className="py-3">Mobile</th>
                <th className="py-3">Email</th>
                <th className="py-3">Country</th>
                <th className="py-3">City</th>
                <th className="py-3">LinkedIn URL</th>
                <th className="py-3">Comments</th>
                <th className="py-3 text-right">CRM</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-white/10 text-slate-300">
                  <td className="py-4">{lead.first_name}</td>
                  <td className="py-4">{lead.middle_name || "—"}</td>
                  <td className="py-4">{lead.last_name || "—"}</td>
                  <td className="py-4">{lead.company_name}</td>
                  <td className="py-4">{lead.designation || "—"}</td>
                  <td className="py-4">{lead.phone_number || "—"}</td>
                  <td className="py-4">{lead.mobile_number || "—"}</td>
                  <td className="py-4">{lead.email || "—"}</td>
                  <td className="py-4">{lead.country || "—"}</td>
                  <td className="py-4">{lead.city || "—"}</td>
                  <td className="py-4">
                    {lead.linkedin_url ? (
                      <a href={lead.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-300">
                        Open
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-4">{lead.comments ? `${lead.comments.slice(0, 80)}...` : "—"}</td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      disabled={savingToCrmId === lead.id}
                      onClick={() => saveToCrm(lead)}
                      className="rounded-lg border border-emerald-400/30 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-60"
                    >
                      {savingToCrmId === lead.id ? "Saving..." : "Save to Leads"}
                    </button>
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr className="border-t border-white/10 text-slate-400">
                  <td className="py-6 text-center" colSpan={13}>
                    No LinkedIn leads captured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

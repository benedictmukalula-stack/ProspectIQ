"use client";

import { FormEvent, useMemo, useState } from "react";

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
  comments: "",
  source: "Public LinkedIn URL / manual entry",
};

export default function LinkedInSearchPage() {
  const [keywords, setKeywords] = useState("");
  const [designation, setDesignation] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [leadForm, setLeadForm] = useState(emptyLead);
  const [leads, setLeads] = useState<LinkedInLead[]>([]);
  const [message, setMessage] = useState("");

  const searchQueries = useMemo(() => {
    const parts = [
      keywords,
      designation ? `"${designation}"` : "",
      company ? `"${company}"` : "",
      location ? `"${location}"` : "",
      industry ? `"${industry}"` : "",
    ].filter(Boolean);

    const query = parts.join(" ");

    return {
      google: `site:linkedin.com/in ${query}`,
      linkedinPeople: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`,
      linkedinCompanies: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company || keywords || "")}`,
    };
  }, [keywords, designation, company, location, industry]);

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
    setMessage("Lead captured. Only public/manual contact fields were stored.");
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
        <h1 className="mt-2 text-3xl font-bold">LinkedIn Lead Search Engine</h1>
        <p className="mt-2 text-slate-400">
          Build advanced LinkedIn search queries, capture public profile URLs, and store compliant lead details.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <div className="mb-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm text-amber-100">
        This module does not bypass LinkedIn login, scrape restricted pages, or extract private contact data.
        Phone, mobile, and email fields should be added only when publicly listed, user-provided, or returned by an approved enrichment API.
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-lg font-semibold">Advanced Search Builder</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Keywords e.g. logistics director" value={keywords} onChange={(event) => setKeywords(event.target.value)} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Designation" value={designation} onChange={(event) => setDesignation(event.target.value)} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Company" value={company} onChange={(event) => setCompany(event.target.value)} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
          <input className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" placeholder="Industry" value={industry} onChange={(event) => setIndustry(event.target.value)} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-white">Google X-Ray Query</p>
            <p className="mt-3 break-all text-sm text-slate-400">{searchQueries.google}</p>
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

      <form onSubmit={addLead} className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-lg font-semibold">Capture Public Lead Details</h2>

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
        </div>

        <textarea
          className="mt-4 min-h-28 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
          placeholder="Comments"
          value={leadForm.comments}
          onChange={(event) => setLeadForm({ ...leadForm, comments: event.target.value })}
        />

        <button className="mt-5 rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white">
          Save Lead
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
          <table className="w-full min-w-[1200px] text-left text-sm">
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
                <th className="py-3">LinkedIn URL</th>
                <th className="py-3">Comments</th>
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
                  <td className="py-4">
                    {lead.linkedin_url ? (
                      <a href={lead.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-300">
                        Open
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-4">{lead.comments || "—"}</td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr className="border-t border-white/10 text-slate-400">
                  <td className="py-6 text-center" colSpan={10}>
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

"use client";
import { useEffect, useState } from "react";

export default function RevenueCommandPage() {
  const [agent, setAgent] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [copilot, setCopilot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [agentRes, leadsRes, recRes, copilotRes] = await Promise.allSettled([
          fetch("/api/agents/runtime"),
          fetch("/api/leads"),
          fetch("/api/ai/recommendations"),
          fetch("/api/intelligence/copilot"),
        ]);

        const agentData = agentRes.status === "fulfilled" ? await agentRes.value.json().catch(() => ({})) : {};
        const leadsData = leadsRes.status === "fulfilled" ? await leadsRes.value.json().catch(() => ({ leads: [] })) : { leads: [] };
        const recData = recRes.status === "fulfilled" ? await recRes.value.json().catch(() => ({ recommendations: [] })) : { recommendations: [] };
        const copilotData = copilotRes.status === "fulfilled" ? await copilotRes.value.json().catch(() => ({})) : {};

        setAgent(agentData);
        setLeads(leadsData.leads || []);
        setRecommendations(recData.recommendations || []);
        setCopilot(copilotData);
      } catch (err) {
        setError("Failed to load command center");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Revenue Command Center...</div>;
  if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Revenue Command Center</h1>

      {/* Agent Status */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Agent Runtime</h2>
        <p>Status: <span className="font-mono">{agent?.status || "idle"}</span></p>
        <p className="text-sm text-gray-500">Last run: {agent?.lastRun ? new Date(agent.lastRun).toLocaleString() : "never"}</p>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Active Leads</h2>
        {leads.length === 0 ? (
          <p className="text-gray-500">No leads yet. Add some leads to see them here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Intent</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-4 py-2 text-sm">{lead.email}</td>
                    <td className="px-4 py-2 text-sm">{lead.company || "-"}</td>
                    <td className="px-4 py-2 text-sm">{lead.score}</td>
                    <td className="px-4 py-2 text-sm">{lead.intent || "-"}</td>
                    <td className="px-4 py-2 text-sm">{lead.source || "-"}</td>
                    <td className="px-4 py-2 text-sm">{lead.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">AI Recommendations</h2>
        {recommendations.length === 0 ? (
          <p className="text-gray-500">No recommendations at this time.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-gray-700">{rec}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Copilot Suggestions */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Copilot Suggestions</h2>
        {copilot?.suggestions?.length ? (
          <ul className="list-disc pl-5 space-y-1">
            {copilot.suggestions.map((sug: string, idx: number) => (
              <li key={idx} className="text-gray-700">{sug}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No suggestions available.</p>
        )}
        {copilot?.context && <p className="text-xs text-gray-400 mt-4">{copilot.context}</p>}
      </div>
    </div>
  );
}

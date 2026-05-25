"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Step = { id: string; step_order: number; delay_days: number; subject: string; body: string };
type Sequence = { id: string; name: string; steps: Step[] };
type Lead = { id: string; email: string; company: string };

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedSeq, setSelectedSeq] = useState("");
  const [selectedLead, setSelectedLead] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingSeq, setEditingSeq] = useState<Sequence | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSteps, setEditSteps] = useState<Step[]>([]);

  useEffect(() => {
    fetchSequences();
    fetchLeads();
  }, []);

  async function fetchSequences() {
    const { data, error } = await supabase.from("sequences").select("*, steps:sequence_steps(*)");
    if (!error) setSequences(data || []);
    setLoading(false);
  }
  async function fetchLeads() {
    const { data } = await supabase.from("leads").select("id, email, company");
    setLeads(data || []);
  }
  async function handleEnroll() {
    if (!selectedSeq || !selectedLead) {
      setMessage("Select both sequence and lead");
      return;
    }
    setMessage("Enrolling...");
    const res = await fetch("/api/sequences/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sequenceId: selectedSeq, leadIds: [selectedLead] }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Enrolled successfully!");
      setSelectedSeq("");
      setSelectedLead("");
    } else {
      setMessage(`Error: ${data.error}`);
    }
  }
  async function saveSequence() {
    if (!editName) return alert("Name required");
    const payload = { name: editName, steps: editSteps.filter(s => s.subject && s.body) };
    if (editingSeq) {
      // Update
      await supabase.from("sequences").update({ name: editName }).eq("id", editingSeq.id);
      await supabase.from("sequence_steps").delete().eq("sequence_id", editingSeq.id);
      if (payload.steps.length) {
        const stepsWithId = payload.steps.map((s, idx) => ({ ...s, sequence_id: editingSeq.id, step_order: idx + 1 }));
        await supabase.from("sequence_steps").insert(stepsWithId);
      }
    } else {
      // Create new
      const { data: newSeq } = await supabase.from("sequences").insert({ name: editName }).select().single();
      if (newSeq && payload.steps.length) {
        const stepsWithId = payload.steps.map((s, idx) => ({ ...s, sequence_id: newSeq.id, step_order: idx + 1 }));
        await supabase.from("sequence_steps").insert(stepsWithId);
      }
    }
    fetchSequences();
    setShowModal(false);
    setEditingSeq(null);
    setEditName("");
    setEditSteps([{ id: "", step_order: 1, delay_days: 0, subject: "", body: "" }]);
  }
  function addStep() {
    setEditSteps([...editSteps, { id: "", step_order: editSteps.length + 1, delay_days: 0, subject: "", body: "" }]);
  }
  function updateStep(idx: number, field: keyof Step, value: any) {
    const newSteps = [...editSteps];
    newSteps[idx] = { ...newSteps[idx], [field]: value };
    setEditSteps(newSteps);
  }
  function removeStep(idx: number) {
    if (editSteps.length === 1) return;
    const newSteps = editSteps.filter((_, i) => i !== idx);
    setEditSteps(newSteps.map((s, i) => ({ ...s, step_order: i + 1 })));
  }

  if (loading) return <div className="p-8">Loading sequences...</div>;

  const totalSteps = sequences.reduce((acc, s) => acc + (s.steps?.length || 0), 0);
  const activeCount = sequences.length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Outbound Automation</h1>
        <button onClick={() => { setEditingSeq(null); setEditName(""); setEditSteps([{ id: "", step_order: 1, delay_days: 0, subject: "", body: "" }]); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">
          + New Sequence
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow text-center"><div className="text-2xl font-bold">{sequences.length}</div><div className="text-sm text-gray-500">Sequences</div></div>
        <div className="bg-white p-4 rounded shadow text-center"><div className="text-2xl font-bold">{leads.length}</div><div className="text-sm text-gray-500">CRM Contacts</div></div>
        <div className="bg-white p-4 rounded shadow text-center"><div className="text-2xl font-bold">{totalSteps}</div><div className="text-sm text-gray-500">Sequence Steps</div></div>
        <div className="bg-white p-4 rounded shadow text-center"><div className="text-2xl font-bold">{activeCount}</div><div className="text-sm text-gray-500">Active Sequences</div></div>
      </div>

      {/* Enrollment Form */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h2 className="text-lg font-semibold mb-3">Enroll CRM Contact</h2>
        <div className="flex flex-wrap gap-4">
          <select value={selectedSeq} onChange={(e) => setSelectedSeq(e.target.value)} className="border rounded p-2 flex-1 min-w-[200px]">
            <option value="">Select sequence</option>
            {sequences.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={selectedLead} onChange={(e) => setSelectedLead(e.target.value)} className="border rounded p-2 flex-1 min-w-[200px]">
            <option value="">Select contact</option>
            {leads.map(l => <option key={l.id} value={l.id}>{l.email} ({l.company})</option>)}
          </select>
          <button onClick={handleEnroll} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Enroll Contact</button>
        </div>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>

      {/* Sequences List */}
      <div className="space-y-6">
        {sequences.map(seq => (
          <div key={seq.id} className="border rounded-lg p-4 bg-white shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{seq.name}</h3>
                <p className="text-sm text-gray-500">{seq.steps?.length || 0} steps</p>
              </div>
              <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Active</div>
            </div>
            <p className="text-gray-600 mb-2">AI-assisted outbound engagement sequence.</p>
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Performance</span>
                <span className="text-sm text-green-600">82% engagement score</span>
              </div>
              {seq.steps?.map(step => (
                <div key={step.id} className="border-l-4 border-blue-400 pl-3 mb-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Step {step.step_order}</span>
                    <span className="text-sm text-gray-500">Day {step.delay_days} · email</span>
                  </div>
                  <p className="text-sm font-medium">{step.subject}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{step.body?.slice(0, 120)}...</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => { setEditingSeq(seq); setEditName(seq.name); setEditSteps(seq.steps || []); setShowModal(true); }} className="text-blue-600 text-sm">Edit Sequence</button>
              <button onClick={() => window.location.href = `/dashboard/sequences/progress`} className="text-blue-600 text-sm">View Analytics</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{editingSeq ? "Edit Sequence" : "New Sequence"}</h2>
            <input type="text" placeholder="Sequence Name" value={editName} onChange={e => setEditName(e.target.value)} className="border p-2 rounded w-full mb-4" />
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Steps</h3>
                <button onClick={addStep} className="text-blue-600 text-sm">+ Add Step</button>
              </div>
              {editSteps.map((step, idx) => (
                <div key={idx} className="border p-3 rounded mb-3">
                  <div className="flex justify-between"><span className="font-medium">Step {step.step_order}</span><button onClick={() => removeStep(idx)} className="text-red-500 text-sm">Remove</button></div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input type="number" placeholder="Delay (days)" value={step.delay_days} onChange={e => updateStep(idx, "delay_days", parseInt(e.target.value) || 0)} className="border p-1 rounded" />
                    <input type="text" placeholder="Subject" value={step.subject} onChange={e => updateStep(idx, "subject", e.target.value)} className="border p-1 rounded" />
                  </div>
                  <textarea placeholder="Email body" rows={3} value={step.body} onChange={e => updateStep(idx, "body", e.target.value)} className="border p-1 rounded w-full mt-2"></textarea>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={saveSequence} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

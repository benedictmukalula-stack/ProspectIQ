"use client";
import { useEffect, useState } from "react";

type Enrollment = {
  id: string;
  current_step: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  next_email_at: string | null;
  progress: number;
  totalSteps: number;
  lead: { id: string; email: string; company: string };
  sequence: { id: string; name: string };
  nextStep: { step_order: number; delay_days: number; subject: string } | null;
};

export default function EnrollmentProgressPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProgress() {
    try {
      const res = await fetch("/api/sequences/progress");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEnrollments(data);
    } catch (err) {
      setError("Could not load enrollment progress");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-center">Loading enrollment progress...</div>;
  if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Enrollment Progress Dashboard</h1>
      {enrollments.length === 0 ? (
        <p className="text-gray-500">No enrollments yet. Enroll leads from the Sequences page.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 text-left">Lead</th>
                <th className="px-4 py-2 text-left">Sequence</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Progress</th>
                <th className="px-4 py-2 text-left">Current Step</th>
                <th className="px-4 py-2 text-left">Next Email</th>
                <th className="px-4 py-2 text-left">Started</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enr) => (
                <tr key={enr.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-medium">{enr.lead.email}</div>
                    <div className="text-xs text-gray-500">{enr.lead.company}</div>
                  </td>
                  <td className="px-4 py-2">{enr.sequence.name}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      enr.status === "active" ? "bg-green-100 text-green-800" :
                      enr.status === "completed" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {enr.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${enr.progress}%` }}
                        />
                      </div>
                      <span className="text-sm">{Math.round(enr.progress)}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Step {enr.current_step} of {enr.totalSteps}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {enr.nextStep ? (
                      <div>
                        <div className="text-sm font-medium">Step {enr.nextStep.step_order}</div>
                        <div className="text-xs text-gray-500">Day {enr.nextStep.delay_days}</div>
                        <div className="text-xs truncate max-w-[200px]">{enr.nextStep.subject}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {enr.next_email_at ? new Date(enr.next_email_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(enr.started_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

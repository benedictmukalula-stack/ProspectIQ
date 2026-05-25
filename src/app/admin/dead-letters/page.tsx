"use client";
import { useEffect, useState } from "react";

type DeadLetter = {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  last_error: string;
  retry_count: number;
  failed_at: string;
};

export default function DeadLettersPage() {
  const [deadLetters, setDeadLetters] = useState<DeadLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingAll, setRetryingAll] = useState(false);

  const fetchDeadLetters = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/queue/dead-letters");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDeadLetters(data);
        setError(null);
      } else if (data.error) {
        setError(data.error);
        setDeadLetters([]);
      } else {
        setError("Unexpected response format");
        setDeadLetters([]);
      }
    } catch (err) {
      setError("Failed to fetch dead letters");
      setDeadLetters([]);
    } finally {
      setLoading(false);
    }
  };

  const retryJob = async (id: string) => {
    try {
      const res = await fetch("/api/queue/dead-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchDeadLetters();
      } else {
        alert(`Retry failed: ${data.error}`);
      }
    } catch (err) {
      alert("Network error while retrying");
    }
  };

  const retryAll = async () => {
    if (!confirm(`Retry all ${deadLetters.length} dead letters?`)) return;
    setRetryingAll(true);
    for (const dl of deadLetters) {
      try {
        await fetch("/api/queue/dead-letters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: dl.id }),
        });
        // small delay to avoid overwhelming the server
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        console.error(`Failed to retry ${dl.id}`, err);
      }
    }
    setRetryingAll(false);
    await fetchDeadLetters();
  };

  const clearAll = async () => {
    if (!confirm("Delete all dead letters?")) return;
    try {
      const res = await fetch("/api/queue/dead-letters", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchDeadLetters();
      } else {
        alert(`Clear failed: ${data.error}`);
      }
    } catch (err) {
      alert("Network error while clearing");
    }
  };

  useEffect(() => {
    fetchDeadLetters();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dead Letter Queue</h1>
        <div className="space-x-3">
          {deadLetters.length > 0 && (
            <button
              onClick={retryAll}
              disabled={retryingAll}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {retryingAll ? "Retrying..." : `Retry All (${deadLetters.length})`}
            </button>
          )}
          <button
            onClick={clearAll}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Clear All
          </button>
        </div>
      </div>
      {deadLetters.length === 0 ? (
        <p className="text-gray-500">No dead letters.</p>
      ) : (
        <div className="space-y-4">
          {deadLetters.map((dl) => (
            <div key={dl.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">To: {dl.recipient}</p>
                  <p className="text-sm text-gray-600">Subject: {dl.subject}</p>
                  <p className="text-sm text-gray-600 mt-1">Error: {dl.last_error}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Failed at: {new Date(dl.failed_at).toLocaleString()} (retries: {dl.retry_count})
                  </p>
                </div>
                <button
                  onClick={() => retryJob(dl.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
              <details className="mt-2">
                <summary className="text-xs cursor-pointer text-gray-500">Show body</summary>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                  {dl.body}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

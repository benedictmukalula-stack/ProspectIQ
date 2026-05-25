"use client";
import { useEffect, useState } from "react";

type Metrics = {
  queue: { pending: number; sent: number; failed: number };
  deadLetters: number;
};

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/queue/metrics");
      const data = await res.json();
      if (res.ok) {
        setMetrics(data);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch metrics");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8">Loading metrics...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!metrics) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Queue Metrics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Main Queue</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Pending:</span>
              <span className="font-mono font-bold">{metrics.queue.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sent:</span>
              <span className="font-mono font-bold">{metrics.queue.sent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failed (retrying):</span>
              <span className="font-mono font-bold">{metrics.queue.failed}</span>
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Dead Letter Queue</h2>
          <div className="flex justify-between">
            <span className="text-gray-600">Total dead letters:</span>
            <span className="font-mono font-bold text-red-600">{metrics.deadLetters}</span>
          </div>
          {metrics.deadLetters > 0 && (
            <div className="mt-4">
              <a href="/admin/dead-letters" className="text-blue-600 hover:underline text-sm">
                View dead letters →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

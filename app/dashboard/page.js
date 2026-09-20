"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState, useCallback } from "react";

export default function DashboardPage() {
  const [cards, setCards] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/rfid/list");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCards(data.cards);
      setLogs(data.logs);
      setError(null);
    } catch (err) {
      setError("Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleReset = async (rfid_uid) => {
    if (!confirm(`Reset card ${rfid_uid}?`)) return;
    const res = await fetch("/api/rfid/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfid_uid }),
    });
    if (res.ok) fetchData();
    else alert("Reset failed");
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-8">
      <Navbar/>
      <h1 className="text-2xl font-bold">Visitor RFID Dashboard</h1>

      <section>
        <h2 className="text-lg font-semibold mb-2">Cards</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">RFID UID</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Visitor</th>
              <th className="py-2 pr-4">Members</th>
              <th className="py-2 pr-4">Access</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.rfid_uid} className="border-b">
                <td className="py-2 pr-4">{c.rfid_uid}</td>
                <td className="py-2 pr-4">{c.status}</td>
                <td className="py-2 pr-4">{c.visitor?.person_name ?? "-"}</td>
                <td className="py-2 pr-4">
                  {c.visitor?.total_visitor_members ?? "-"}
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={c.access ? "text-green-600" : "text-red-600"}
                  >
                    {c.access ? "TRUE" : "FALSE"}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  {c.visitor
                    ? new Date(c.visitor.created_at).toLocaleTimeString()
                    : "-"}
                </td>
                <td className="py-2 pr-4">
                  {c.status === "assigned" && (
                    <button
                      onClick={() => handleReset(c.rfid_uid)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      Reset
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Recent Scans</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">RFID UID</th>
              <th className="py-2 pr-4">Result</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.log_id} className="border-b">
                <td className="py-2 pr-4">
                  {new Date(log.scanned_at).toLocaleTimeString()}
                </td>
                <td className="py-2 pr-4">{log.rfid_uid}</td>
                <td className="py-2 pr-4">{log.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

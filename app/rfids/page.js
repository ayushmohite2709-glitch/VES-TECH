"use client";

import { useState, useEffect, useRef } from "react";

const initialForm = {
  rfid_uid: "",
  person_name: "",
  age: "",
  contact_no: "",
  total_visitor_members: 1,
};

const POLL_INTERVAL_MS = 2000;
const SCAN_FRESHNESS_MS = 10000; // ignore scans older than this (e.g. on first load)

export default function RegisterCardPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [scanning, setScanning] = useState(false);

  // tracks the last scan we've already reacted to, so we don't re-fill on every poll
  const lastSeenScanRef = useRef(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/rfid/latest-scan");
        if (!res.ok) return;
        const { log } = await res.json();
        if (!log) return;

        const scanKey = `${log.rfid_uid}-${log.scanned_at}`;
        if (scanKey === lastSeenScanRef.current) return; // already handled

        lastSeenScanRef.current = scanKey;

        // only react to unregistered-card taps, and only if the tap is recent
        // (prevents an old log row from auto-filling the form on page load)
        const age_ms = Date.now() - new Date(log.scanned_at).getTime();
        if (log.result === "denied_unknown" && age_ms < SCAN_FRESHNESS_MS) {
          setForm((prev) => ({ ...prev, rfid_uid: log.rfid_uid }));
          setScanning(true);
          setTimeout(() => setScanning(false), 1500);
        }
      } catch {
        // silent - just try again next tick
      }
    };

    poll(); // run once immediately so a fresh scan on load isn't missed
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/rfid/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfid_uid: form.rfid_uid.trim(),
          person_name: form.person_name.trim(),
          age: form.age ? Number(form.age) : null,
          contact_no: form.contact_no.trim(),
          total_visitor_members: Number(form.total_visitor_members) || 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Registration failed",
        });
        return;
      }

      setMessage({
        type: "success",
        text: `Card ${form.rfid_uid} assigned to ${form.person_name}`,
      });
      setForm(initialForm);
      lastSeenScanRef.current = null; // allow the same UID to be re-detected later if re-scanned
    } catch (err) {
      setMessage({ type: "error", text: "Network error, try again" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Register / Assign RFID Card</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">RFID UID</label>
          <input
            name="rfid_uid"
            value={form.rfid_uid}
            onChange={handleChange}
            required
            placeholder="Scan card or enter UID"
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {scanning && (
            <p className="text-xs text-blue-600 mt-1">Card detected ✓</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Visitor Name</label>
          <input
            name="person_name"
            value={form.person_name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Contact Number
          </label>
          <input
            name="contact_no"
            value={form.contact_no}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Total Visitor Members
          </label>
          <input
            name="total_visitor_members"
            type="number"
            min="1"
            value={form.total_visitor_members}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50"
        >
          {submitting ? "Registering..." : "Register Card"}
        </button>
      </form>

      {message && (
        <div
          className={`p-3 rounded text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

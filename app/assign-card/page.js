"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect, useRef } from "react";

const ROLES = [
  { value: "visitor", label: "Visitor", prefix: "VIS" },
  { value: "doctor", label: "Doctor", prefix: "DCT" },
  { value: "staff", label: "Staff", prefix: "STF" },
];

const VISITING_WINDOWS = [
  { startH: 10, startM: 0, endH: 14, endM: 0 },
  { startH: 16, startM: 0, endH: 18, endM: 0 },
];

const MAX_VISITORS_AT_A_TIME = 4;
const SLOT_DURATION_MS = 60 * 60 * 1000; // 1 hour
const ROUND_TO_MS = 30 * 60 * 1000; // round starting point to next 30-min mark

const initialForm = {
  rfid_uid: "",
  role: "visitor",
  person_name: "",
  age: "",
  contact_no: "",
  total_visitor_members: 1,
  agree_rules: false,
};

const POLL_INTERVAL_MS = 2000;
const SCAN_FRESHNESS_MS = 10000; // ignore scans older than this (e.g. on first load)

function getRolePrefix(role) {
  return ROLES.find((r) => r.value === role)?.prefix || "VIS";
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function roundUpToStep(date, stepMs) {
  const t = date.getTime();
  return new Date(Math.ceil(t / stepMs) * stepMs);
}

// Finds the next 1-hour slot that starts at/after `now`, is rounded to the
// nearest 30-minute mark, and fits entirely inside one of the visiting windows.
// If today's windows are exhausted, rolls over to the first window tomorrow.
function getNextAvailableSlot(now = new Date()) {
  const roundedStart = roundUpToStep(now, ROUND_TO_MS);

  const tryDay = (dayOffset) => {
    const dayBase = new Date(now);
    dayBase.setDate(dayBase.getDate() + dayOffset);

    for (const w of VISITING_WINDOWS) {
      const windowStart = new Date(dayBase);
      windowStart.setHours(w.startH, w.startM, 0, 0);
      const windowEnd = new Date(dayBase);
      windowEnd.setHours(w.endH, w.endM, 0, 0);

      const earliestCandidate = dayOffset === 0 ? roundedStart : windowStart;
      const candidateStart =
        earliestCandidate < windowStart ? windowStart : earliestCandidate;
      const candidateEnd = new Date(candidateStart.getTime() + SLOT_DURATION_MS);

      if (candidateStart >= now && candidateEnd <= windowEnd) {
        return { start: candidateStart, end: candidateEnd };
      }
    }
    return null;
  };

  return tryDay(0) || tryDay(1);
}

export default function RegisterCardPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [slot, setSlot] = useState(null);
  const [rulesOpen, setRulesOpen] = useState(true);

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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleBookNextSlot = () => {
    setSlot(getNextAvailableSlot(new Date()));
  };

  const isDoctor = form.role === "doctor";
  const assignedId = form.rfid_uid.trim()
    ? `${getRolePrefix(form.role)}-${form.rfid_uid.trim()}`
    : "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.agree_rules) {
      setMessage({
        type: "error",
        text: "Please confirm you have read the visiting rules & regulations.",
      });
      return;
    }

    if (!slot) {
      setMessage({ type: "error", text: "Please book a visiting time slot." });
      return;
    }

    if (!isDoctor && Number(form.total_visitor_members) > MAX_VISITORS_AT_A_TIME) {
      setMessage({
        type: "error",
        text: `Maximum ${MAX_VISITORS_AT_A_TIME} visitors are allowed at a time.`,
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/rfid/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfid_uid: form.rfid_uid.trim(),
          assigned_id: assignedId,
          role: form.role,
          person_name: form.person_name.trim(),
          age: form.age ? Number(form.age) : null,
          contact_no: form.contact_no.trim(),
          total_visitor_members: isDoctor ? null : Number(form.total_visitor_members) || 1,
          slot_start: slot.start.toISOString(),
          slot_end: slot.end.toISOString(),
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
        text: `Card ${assignedId} assigned to ${form.person_name} for ${formatTime(
          slot.start
        )} - ${formatTime(slot.end)}`,
      });
      setForm(initialForm);
      setSlot(null);
      lastSeenScanRef.current = null; // allow the same UID to be re-detected later if re-scanned
    } catch (err) {
      setMessage({ type: "error", text: "Network error, try again" });
    } finally {
      setSubmitting(false);
    }
  };

  return (<>
        <Navbar/>

    <div className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Register / Assign RFID Card</h1>

      {/* Rules & Regulations */}
      <div className="border rounded overflow-hidden">
        <button
          type="button"
          onClick={() => setRulesOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 text-amber-900 text-sm font-medium"
        >
          <span>Visiting Rules & Regulations</span>
          <span>{rulesOpen ? "▲" : "▼"}</span>
        </button>
        {rulesOpen && (
          <ul className="p-3 space-y-1 text-xs text-gray-700 list-disc list-inside bg-amber-50/50">
            <li>Visiting hours: 10:00 AM – 2:00 PM and 4:00 PM – 6:00 PM only.</li>
            <li>Maximum {MAX_VISITORS_AT_A_TIME} visitors are allowed at a time per patient.</li>
            <li>Maintain silence — avoid loud conversations or phone calls.</li>
            <li>Do not damage, share, or forget to return your access card.</li>
            <li>Card is non-transferable and must be worn/carried at all times on premises.</li>
            <li>Follow staff and security instructions at all times.</li>
            <li>Children under 12 are discouraged from visiting patient wards.</li>
            <li>Report lost cards immediately to the front desk.</li>
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, role: r.value }))}
                className={`py-2 rounded text-sm border ${
                  form.role === r.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

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
          {assignedId && (
            <p className="text-xs text-gray-500 mt-1">
              Assigned ID: <span className="font-mono">{assignedId}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {isDoctor ? "Doctor Name" : "Visitor Name"}
          </label>
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
            maxLength={3}
            max={100}
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
            type="tel"
            maxLength={10}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Doctors don't need a visitor headcount */}
        {!isDoctor && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Visitor Members (max {MAX_VISITORS_AT_A_TIME})
            </label>
            <input
              name="total_visitor_members"
              type="number"
              min="1"
              max={MAX_VISITORS_AT_A_TIME}
              value={form.total_visitor_members}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        )}

        {/* Time slot booking */}
        <div className="border rounded p-3 space-y-2 bg-gray-50">
          <label className="block text-sm font-medium">Visiting Time Slot</label>
          {slot ? (
            <p className="text-sm text-green-700">
              Booked: {formatTime(slot.start)} – {formatTime(slot.end)}
            </p>
          ) : (
            <p className="text-xs text-gray-500">No slot booked yet.</p>
          )}
          <button
            type="button"
            onClick={handleBookNextSlot}
            className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded"
          >
            Book Next Available Slot
          </button>
        </div>

        <div className="flex items-start gap-2">
          <input
            id="agree_rules"
            name="agree_rules"
            type="checkbox"
            checked={form.agree_rules}
            onChange={handleChange}
            className="mt-1"
          />
          <label htmlFor="agree_rules" className="text-xs text-gray-600">
            I have read and agree to the visiting rules & regulations above.
          </label>
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
    </>
  );
}
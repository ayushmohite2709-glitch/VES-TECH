"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";

const STREAM_URL =
  process.env.NEXT_PUBLIC_STREAM_URL || "http://localhost:8000/api/stream";

const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 15000;

export default function RoomMonitor() {
  const [roomData, setRoomData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  // Mutable refs so the connect function can be recreated safely
  // without re-running the effect or going stale in closures.
  const eventSourceRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY_MS);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;

    function connect() {
      if (unmountedRef.current) return;

      const eventSource = new EventSource(STREAM_URL);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnected(true);
        setReconnecting(false);
        retryDelayRef.current = INITIAL_RETRY_DELAY_MS; // reset backoff
      };

      eventSource.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setRoomData(parsedData);
        } catch (err) {
          console.error("Failed to parse JSON stream:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE Connection Error:", err);
        setConnected(false);

        // The browser only auto-retries while readyState is CONNECTING.
        // Once it's CLOSED (server down, CORS failure, bad response, etc.)
        // it will never reconnect on its own — so we do it ourselves.
        if (eventSource.readyState === EventSource.CLOSED) {
          eventSource.close();
          if (unmountedRef.current) return;

          setReconnecting(true);
          const delay = retryDelayRef.current;
          retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY_MS);

          retryTimeoutRef.current = setTimeout(connect, delay);
        }
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  const statusLabel = connected
    ? "LIVE"
    : reconnecting
      ? "RECONNECTING..."
      : "DISCONNECTED";

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <Navbar/>
      <h1>Room Crowd Status</h1>
      <p>
        Connection Status: <strong>{statusLabel}</strong>
      </p>

      {roomData ? (
        <pre
          style={{
            background: "#1e1e1e",
            color: "#00ff00",
            padding: "1.5rem",
            borderRadius: "8px",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(roomData, null, 2)}
        </pre>
      ) : (
        <p>Waiting for data stream...</p>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";


const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

const VALUE_POINTS = [
  {
    title: "Real-time occupancy tracking",
    body: "Every ward and ICU tracks who's inside as it happens, not from a register someone updates after their shift.",
  },
  {
    title: "Server-side rule enforcement",
    body: "Access rules run on the server, not the door reader. Change a policy once and it applies at every door in seconds.",
  },
  {
    title: "Role-based access",
    body: "Doctors, staff and visitors each get access that matches their role and schedule, without manual overrides.",
  },
  {
    title: "Full audit trail",
    body: "Every scan, grant and denial is logged with a timestamp and searchable later, for every door on the site.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Scan identity",
    body: "A card, QR code or biometric scan identifies who's requesting entry, at any door.",
  },
  {
    n: "02",
    title: "Server validates",
    body: "The request is checked against live occupancy, role, and time-window rules in real time.",
  },
  {
    n: "03",
    title: "Door unlocks",
    body: "Access is granted or denied instantly, and the event is written to the audit trail.",
  },
];

const FEATURES = [
  {
    title: "RFID, QR & biometric identity",
    body: "Support any credential a hospital already issues, on the same rule engine.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 10.5a3 3 0 0 1 5 0M7 13.5a5 5 0 0 1 7.5 0" strokeLinecap="round" />
        <circle cx="17" cy="14" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Dynamic rule engine",
    body: "Change who can go where, and when, without touching a single door controller's firmware.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Anti-passback",
    body: "Stops one credential from being used to let a second person in behind it before it exits.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 7h11a3 3 0 0 1 0 6H9" strokeLinecap="round" />
        <path d="M12 10l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 17H9a3 3 0 0 1 0-6h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Real-time alerts",
    body: "A denied badge, a propped door or an over-capacity ward flags the security desk the moment it happens.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 4v9M12 17.5v.01" strokeLinecap="round" />
        <path d="M10.3 4.9 3.6 17a2 2 0 0 0 1.8 3h13.2a2 2 0 0 0 1.8-3L13.7 4.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    ),
  },
  {
    title: "Centralized dashboard",
    body: "Every door, every building, every site your hospital network runs — on one screen.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path d="M8 20h8M12 16v4" strokeLinecap="round" />
      </svg>
    ),
  },
];

const LOG_FEED = [
  { time: "09:42:17", name: "A. Kapoor", loc: "Ward 4B", status: "granted" },
  { time: "09:42:05", name: "Unknown card", loc: "ICU corridor", status: "denied" },
  { time: "09:41:58", name: "R. Fernandes", loc: "Radiology", status: "granted" },
  { time: "09:41:40", name: "M. Iqbal", loc: "Pharmacy", status: "granted" },
];

const Page = () => {
    const { isLoaded, isSignedIn } = useUser();
    if (!isLoaded) return null;
  return (
    <div className="min-h-screen bg-[#F6F8F9] text-[#0A1B2E] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-sans-brand { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }
        .font-mono-brand { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .live-dot { animation: livePulse 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .live-dot { animation: none; }
        }
      `}</style>

      <div className="font-sans-brand">
        {/* Navbar */}
        <header className="sticky top-0 z-40 border-b border-[#DCE3E6] bg-[#F6F8F9]/95 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <a href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#0F2A4A]">
                <span className="h-2.5 w-2.5 rounded-[2px] bg-[#12958C]" />
              </span>
              <span className="text-[17px] font-semibold tracking-tight">proAccess</span>
            </a>

            <ul className="hidden items-center gap-8 text-sm text-[#48586A] md:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition-colors hover:text-[#0A1B2E]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            
                 {isSignedIn ? (
  <UserButton afterSignOutUrl="/" />
) : (
  <div className="flex flex-col items-center">
    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
      <p
              className="rounded-[4px] bg-[#0F2A4A] px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0A1B2E]"
            >
              Login
            </p>
    </SignInButton>
  </div>
)}
          </nav>
        </header>

        {/* Hero */}
        <section id="product" className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
          <div className="grid items-center gap-14 md:grid-cols-2 md:gap-10">
            <div>
              <h1 className="text-[2.5rem] leading-[1.1] tracking-tight text-[#0A1B2E] sm:text-5xl">
                Access control that never looks away.
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#48586A]">
                A paper register can be signed after the fact. It can't stop a
                fifth visitor walking into an ICU, or a card being passed back
                to let someone else in. proAccess checks every request against
                your rules the instant it happens — and records what it did.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#contact"
                  className="rounded-[4px] border border-[#0F2A4A] px-5 py-2.5 text-sm font-medium text-[#0F2A4A] transition-colors hover:bg-[#0F2A4A] hover:text-white"
                >
                  Request a demo
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-[#48586A] underline decoration-[#DCE3E6] decoration-2 underline-offset-4 transition-colors hover:text-[#0A1B2E]"
                >
                  See how it works
                </a>
              </div>
            </div>

            {/* Live access feed mock panel */}
            <div className="rounded-[6px] border border-[#DCE3E6] bg-white shadow-[0_1px_2px_rgba(10,27,46,0.06)]">
              <div className="flex items-center justify-between border-b border-[#DCE3E6] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#12958C]" />
                  <span className="text-[13px] font-medium text-[#0A1B2E]">Live access feed</span>
                </div>
                <span className="font-mono-brand text-[11px] text-[#8493A3]">SITE: 04</span>
              </div>

              <ul className="divide-y divide-[#EEF1F2]">
                {LOG_FEED.map((row, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-[#0A1B2E]">{row.name}</span>
                      <span className="font-mono-brand text-[11px] text-[#8493A3]">
                        {row.time} · {row.loc}
                      </span>
                    </div>
                    <span
                      className={`font-mono-brand text-[11px] font-medium ${
                        row.status === "granted" ? "text-[#12958C]" : "text-[#B4443B]"
                      }`}
                    >
                      {row.status === "granted" ? "granted" : "denied"}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-t border-[#DCE3E6] px-4 py-3">
                <span className="text-[12px] text-[#48586A]">ICU corridor occupancy</span>
                <span className="font-mono-brand text-[12px] font-medium text-[#0A1B2E]">3 / 4</span>
              </div>
            </div>
          </div>
        </section>

        {/* Problem / Value */}
        <section className="border-t border-[#DCE3E6] bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-lg">
              <h2 className="text-2xl font-semibold tracking-tight text-[#0A1B2E] sm:text-[1.75rem]">
                What a physical register can't do
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#48586A]">
                proAccess replaces manual sign-in sheets with rules a server
                enforces at every door, all the time.
              </p>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-[6px] border border-[#DCE3E6] bg-[#DCE3E6] sm:grid-cols-2">
              {VALUE_POINTS.map((point) => (
                <div key={point.title} className="border-l-2 border-l-[#12958C] bg-white p-6">
                  <h3 className="text-[15px] font-semibold text-[#0A1B2E]">{point.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#48586A]">{point.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-lg">
            <h2 className="text-2xl font-semibold tracking-tight text-[#0A1B2E] sm:text-[1.75rem]">
              One request, checked in real time
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#48586A]">
              The same three steps run at every door, for every credential.
            </p>
          </div>

          <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative">
                <div className="flex items-center gap-3">
                  <span className="font-mono-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-[#12958C] text-[13px] text-[#12958C]">
                    {step.n}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="hidden h-px flex-1 bg-[#DCE3E6] sm:block" />
                  )}
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-[#0A1B2E]">{step.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#48586A]">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-[#DCE3E6] bg-[#0A1B2E]">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-lg">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                Built for how hospitals actually run
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#9FB0BE]">
                Every credential type, every rule change and every door, in
                one system.
              </p>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-[6px] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="bg-[#0F2A4A] p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-[#12958C]/40 text-[#12958C]">
                    {feature.icon}
                  </span>
                  <h3 className="mt-4 text-[14.5px] font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#9FB0BE]">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[6px] border border-[#DCE3E6] bg-white p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#0A1B2E] sm:text-2xl">
                See proAccess running on your floor plan
              </h2>
              <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[#48586A]">
                We'll walk through your wards, your existing readers, and where
                real-time enforcement would have stopped last month's incidents.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="rounded-[4px] bg-[#0F2A4A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0A1B2E]"
              >
                Request a demo
              </a>
                      {isSignedIn ? (
  <UserButton afterSignOutUrl="/" />
) : (
  <div className="flex flex-col items-center">
    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
      <p
              className="rounded-[4px] bg-[#0F2A4A] px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0A1B2E]"
            >
              Login
            </p>
    </SignInButton>
  </div>
)}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#DCE3E6] bg-white">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-[#0F2A4A]">
                <span className="h-2 w-2 rounded-[2px] bg-[#12958C]" />
              </span>
              <span className="text-[14px] font-semibold text-[#0A1B2E]">proAccess</span>
            </div>

            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#48586A]">
              <li><a href="#product" className="hover:text-[#0A1B2E]">Product</a></li>
              <li><a href="#features" className="hover:text-[#0A1B2E]">Features</a></li>
              <li><a href="#contact" className="hover:text-[#0A1B2E]">Contact</a></li>
              <li><a href="/privacy" className="hover:text-[#0A1B2E]">Privacy</a></li>
              <li><a href="/terms" className="hover:text-[#0A1B2E]">Terms</a></li>
            </ul>

            <span className="text-[12.5px] text-[#8493A3]">© 2026 proAccess. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Page;
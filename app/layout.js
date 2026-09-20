import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "proAccess — Smart Hospital Access Control",
  description:
    "Real-time, server-enforced access control and visitor management for hospitals. Role-based entry, live occupancy tracking, and a full audit trail at every door.",
  openGraph: {
    title: "proAccess — Smart Hospital Access Control",
    description:
      "Real-time, server-enforced access control and visitor management for hospitals. Role-based entry, live occupancy tracking, and a full audit trail at every door.",
    images: [
      {
        url: "https://pro-access.vercel.app/bg.jpeg",
        width: 1200,
        height: 630,
        alt: "proAccess — Smart Hospital Access Control",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "proAccess — Smart Hospital Access Control",
    description:
      "Real-time, server-enforced access control and visitor management for hospitals.",
    images: ["https://pro-access.vercel.app/bg.jpeg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      <ClerkProvider>
        {children}
      </ClerkProvider>
      </body>
    </html>
  );
}
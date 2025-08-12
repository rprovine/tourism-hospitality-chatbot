import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hawaii Business Intelligence System - AI-Powered Hospitality Platform",
  description: "Revolutionary AI platform for Hawaii's hospitality industry. GPT-5 + Claude dual AI, real-time analytics, revenue optimization, and 85% automation.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'Hawaii Business Intelligence System',
    description: 'AI-powered platform increasing revenue by 35% for Hawaii hospitality businesses',
    url: 'https://hawaii-business-intelligence.vercel.app',
    siteName: 'Hawaii Business Intelligence System',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

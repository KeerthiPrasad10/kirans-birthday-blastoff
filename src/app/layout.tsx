import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050714",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://kirans-birthday-blastoff.vercel.app"),
  title: "Kiran's Birthday Blast-Off!",
  description:
    "Kiran is turning 4! You're invited to the birthday party. May 10, 2026 at 3:00-5:30 PM in Haarlem.",
  openGraph: {
    title: "Kiran's Birthday Blast-Off!",
    description:
      "Kiran is turning 4! You're invited to the birthday party. May 10, 2026 at 3:00-5:30 PM in Haarlem.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiran's Birthday Blast-Off!",
    description:
      "Kiran is turning 4! You're invited to the birthday party. May 10, 2026 at 3:00-5:30 PM in Haarlem.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen overflow-x-hidden">{children}</body>
    </html>
  );
}

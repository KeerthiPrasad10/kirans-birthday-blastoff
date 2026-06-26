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
  themeColor: "#0c1929",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nicola-by-the-sea.vercel.app"),
  title: "Nicola Turns 40 by The Sea",
  description:
    "Nicola is turning 40! You're invited to celebrate. July 18, 2026 at 3:00-6:00 PM at Baia Beachclub, Scheveningen.",
  openGraph: {
    title: "Nicola Turns 40 by The Sea",
    description:
      "Nicola is turning 40! You're invited to celebrate. July 18, 2026 at 3:00-6:00 PM at Baia Beachclub, Scheveningen.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nicola Turns 40 by The Sea",
    description:
      "Nicola is turning 40! You're invited to celebrate. July 18, 2026 at 3:00-6:00 PM at Baia Beachclub, Scheveningen.",
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

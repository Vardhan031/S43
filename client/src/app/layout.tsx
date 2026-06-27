import type { Metadata } from "next";
import { Geist, Geist_Mono, Kanit } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "S43",
  description: "Public Discord community esports tournaments for S43 VSA and H2H modes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${kanit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-100 font-sans selection:bg-orange-500 selection:text-black" style={{ background: "#050505" }}>
        <Navbar />
        <main className="flex-grow flex flex-col">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}


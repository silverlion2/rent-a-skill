import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Rent-a-Skill",
    default: "Rent-a-Skill | Knowledge-as-a-Service",
  },
  description: "Monetize and rent out your verified AI contexts, RAG systems, and executable MCP agents to professionals via zero-friction subscriptions.",
  openGraph: {
    title: "Rent-a-Skill | Elite AI Marketplace",
    description: "Monetize and rent out your verified AI contexts, RAG systems, and executable MCP agents to professionals via zero-friction subscriptions.",
    siteName: "Rent-a-Skill",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rent-a-Skill | Elite AI Marketplace",
    description: "Rent premium AI contexts and MCP agents.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}

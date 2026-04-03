import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Autopilot - All-in-One CRM for Home Service & Rental Businesses",
  description:
    "Run your business on Autopilot. Scheduling, invoicing, payments, CRM, phone system, marketing automation, and short-term rental management. More jobs. Less admin. Faster pay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

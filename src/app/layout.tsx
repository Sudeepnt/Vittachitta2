import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VitthaChittha | Virtual Accounting, Tax, and CFO Services",
  description:
    "Virtual accounting, tax, compliance, and CFO services for Indian service entrepreneurs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

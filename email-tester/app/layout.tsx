import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeedRadar — Email Deliverability Tester",
  description: "Real-time email deliverability testing across seed accounts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="noise-overlay scan-lines">
        {children}
      </body>
    </html>
  );
}

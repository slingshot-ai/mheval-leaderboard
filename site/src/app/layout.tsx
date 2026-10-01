import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mental Health Evaluation Leaderboard",
  description: "Language models on published therapy and mental-health benchmarks, run with the Mental Health Evaluation Harness.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

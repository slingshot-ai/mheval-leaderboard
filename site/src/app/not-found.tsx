import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export default function NotFound() {
  return (
    <PageHeader
      title="Page not found"
      lede="This page doesn't exist, or it has moved."
      facts={[{ label: "Leaderboard", value: <Link href="/">All results →</Link> }]}
    />
  );
}

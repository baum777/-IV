import { Observatory } from "@/components/observatory/observatory";
import "./observatory.css";

export const metadata = { title: "Trading Desk" };

export default function DeskPage() {
  const revision = process.env.VERCEL_GIT_COMMIT_SHA;
  return <Observatory deploymentRevision={revision && /^[a-f0-9]{40}$/.test(revision) ? revision : undefined} />;
}

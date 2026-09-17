import { createFileRoute } from "@tanstack/react-router";
import { VerificationPage } from "@/components/admin/VerificationPage";

export const Route = createFileRoute("/admin/riders")({
  head: () => ({ meta: [{ title: "Riders · Kora Admin" }] }),
  component: () => <VerificationPage kind="rider" />,
});

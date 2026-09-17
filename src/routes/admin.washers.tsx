import { createFileRoute } from "@tanstack/react-router";
import { VerificationPage } from "@/components/admin/VerificationPage";

export const Route = createFileRoute("/admin/washers")({
  head: () => ({ meta: [{ title: "Washers · Kora Admin" }] }),
  component: () => <VerificationPage kind="washer" />,
});

import type { ReactNode } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function LoadingPanel({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-2xl border bg-card">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" /> {label}
      </div>
    </div>
  );
}

export function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="flex min-h-36 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
      <div>
        <AlertCircle className="mx-auto mb-2 h-5 w-5 text-destructive" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

export function EmptyPanel({ message = "No records found." }: { message?: string }) {
  return (
    <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function PaginationBar({
  page = 1,
  totalPages = 1,
  total,
  onPageChange,
}: {
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Page {page} of {Math.max(totalPages, 1)}{typeof total === "number" ? ` · ${total} records` : ""}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= Math.max(totalPages, 1)}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  const value = status || "unknown";
  const normalized = value.toLowerCase();
  const positive = ["verified", "delivered", "active", "paid", "cleaned", "sp_accepted"].includes(normalized);
  const negative = ["rejected", "cancelled", "inactive", "failed"].includes(normalized);
  const pending = normalized.includes("pending") || normalized.includes("assigned") || normalized === "picked_up" || normalized === "at_sp";

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent capitalize",
        positive && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        negative && "bg-red-500/10 text-red-700 dark:text-red-300",
        pending && "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        !positive && !negative && !pending && "bg-muted text-muted-foreground",
      )}
    >
      {value.replaceAll("_", " ")}
    </Badge>
  );
}

export function formatCurrency(value?: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

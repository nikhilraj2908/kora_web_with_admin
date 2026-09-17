import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, ImageIcon, LifeBuoy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  AdminPageHeader,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  PaginationBar,
  formatDate,
} from "@/components/admin/AdminCommon";

import { useAdminAuth } from "@/components/admin/AdminAuth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Textarea } from "@/components/ui/textarea";

import {
  COMPLAINT_STATUSES,
  adminApi,
  type Complaint,
  type ComplaintManageStatus,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/complaints")({
  head: () => ({
    meta: [{ title: "Help & Support · Kora Admin" }],
  }),

  component: ComplaintsPage,
});

function ComplaintsPage() {
  const { hasPermission } = useAdminAuth();

  const canView = hasPermission("complaints.view");
  const canManage = hasPermission("complaints.manage");

  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin", "complaints", { page, status }],

    queryFn: () =>
      adminApi.complaints({
        page,
        limit: 20,
        status: status === "all" ? undefined : status,
      }),

    enabled: canView,
  });

  const detailQuery = useQuery({
    queryKey: ["admin", "complaint", selectedId],

    queryFn: () => adminApi.complaint(selectedId!),

    enabled: canView && !!selectedId,
  });

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin", "complaints"],
      }),

      selectedId
        ? queryClient.invalidateQueries({
            queryKey: ["admin", "complaint", selectedId],
          })
        : Promise.resolve(),

      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      }),
    ]);
  }

  if (!canView) {
    return (
      <ErrorPanel message="Your account does not have complaints.view permission." />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Customer support"
        title="Help & Support"
        description="Review customer complaints, inspect attached photos, add admin remarks and resolve or reject support requests."
      />

      <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LifeBuoy className="h-4 w-4" />

            {listQuery.data?.total ?? 0} support requests
          </div>

          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All statuses
              </SelectItem>

              {COMPLAINT_STATUSES.map((value) => (
                <SelectItem
                  key={value}
                  value={value}
                >
                  {formatComplaintStatus(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {listQuery.isLoading ? (
          <div className="p-4">
            <LoadingPanel label="Loading support requests..." />
          </div>
        ) : listQuery.isError ? (
          <div className="p-4">
            <ErrorPanel message={listQuery.error.message} />
          </div>
        ) : !listQuery.data?.complaints?.length ? (
          <div className="p-4">
            <EmptyPanel message="No help requests match this filter." />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Created</TableHead>

                  <TableHead className="text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {listQuery.data.complaints.map(
                  (complaint) => (
                    <TableRow key={complaint._id}>
                      <TableCell>
                        <p className="max-w-64 truncate text-sm font-semibold">
                          {complaint.subject ||
                            "Untitled support request"}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {complaint.orderId ||
                            complaint._id}
                        </p>
                      </TableCell>

                      <TableCell>
                        <p className="text-sm font-medium">
                          {complaint.user?.fullName ||
                            "Unknown customer"}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {complaint.user?.phone || "—"}
                        </p>
                      </TableCell>

                      <TableCell>
                        <p className="max-w-60 truncate text-sm">
                          {complaint.category || "—"}
                        </p>
                      </TableCell>

                      <TableCell>
                        <ComplaintStatusBadge
                          status={complaint.status}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />

                          {complaint.photoUrls?.length ??
                            0}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(
                          complaint.createdAt,
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              setSelectedId(
                                complaint._id,
                              )
                            }
                          >
                            <Eye />

                            <span className="sr-only">
                              View complaint
                            </span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>

            <PaginationBar
              page={
                listQuery.data.page ?? page
              }
              totalPages={
                listQuery.data.totalPages ?? 1
              }
              total={listQuery.data.total}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      {/* Complaint detail drawer */}
      <Sheet
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>
              Support request
            </SheetTitle>

            <SheetDescription>
              Review the customer message and
              attachments before updating the
              ticket.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {detailQuery.isLoading ? (
              <LoadingPanel />
            ) : detailQuery.isError ? (
              <ErrorPanel
                message={detailQuery.error.message}
              />
            ) : detailQuery.data ? (
              <ComplaintDetail
                complaint={detailQuery.data}
                canManage={canManage}
                onChanged={refresh}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ComplaintDetail({
  complaint,
  canManage,
  onChanged,
}: {
  complaint: Complaint;
  canManage: boolean;
  onChanged: () => Promise<void>;
}) {
  const [status, setStatus] =
    useState<ComplaintManageStatus>(
      complaint.status === "resolved" ||
        complaint.status === "rejected"
        ? complaint.status
        : "in-review",
    );

  const [remarks, setRemarks] =
    useState(
      complaint.adminRemarks || "",
    );

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    setStatus(
      complaint.status === "resolved" ||
        complaint.status === "rejected"
        ? complaint.status
        : "in-review",
    );

    setRemarks(
      complaint.adminRemarks || "",
    );
  }, [
    complaint._id,
    complaint.status,
    complaint.adminRemarks,
  ]);

  async function save() {
    setSaving(true);

    try {
      await adminApi.updateComplaint(
        complaint._id,
        {
          status,
          adminRemarks: remarks.trim(),
        },
      );

      toast.success(
        "Support request updated",
      );

      await onChanged();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update support request",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Ticket heading */}
      <div className="rounded-2xl bg-muted/50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {complaint.category ||
                "Customer support"}
            </p>

            <h2 className="mt-1 font-display text-xl font-bold">
              {complaint.subject ||
                "Untitled support request"}
            </h2>
          </div>

          <ComplaintStatusBadge
            status={complaint.status}
          />
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Created{" "}
          {formatDate(
            complaint.createdAt,
          )}
        </p>
      </div>

      {/* Basic details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Info
          label="Customer"
          value={
            complaint.user?.fullName ||
            "Unknown customer"
          }
        />

        <Info
          label="Phone"
          value={
            complaint.user?.phone || "—"
          }
        />

        <Info
          label="Order ID"
          value={
            complaint.orderId || "—"
          }
        />

        <Info
          label="Ticket ID"
          value={complaint._id}
        />
      </div>

      {/* Description */}
      <section>
        <h3 className="mb-2 font-display text-base font-bold">
          Description
        </h3>

        <div className="whitespace-pre-wrap rounded-xl border bg-card p-4 text-sm leading-6 text-muted-foreground">
          {complaint.description ||
            "No description was provided."}
        </div>
      </section>

      {/* Photos */}
      <section>
        <h3 className="mb-3 font-display text-base font-bold">
          Attached photos
        </h3>

        {complaint.photoUrls?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {complaint.photoUrls.map(
              (url, index) => (
                <a
                  key={`${url}-${index}`}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-xl border bg-card transition hover:border-primary/40"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={url}
                      alt={`Complaint attachment ${
                        index + 1
                      }`}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="p-3 text-xs font-medium text-muted-foreground">
                    Attachment {index + 1}
                  </div>
                </a>
              ),
            )}
          </div>
        ) : (
          <EmptyPanel message="No photos were attached to this request." />
        )}
      </section>

      {/* Admin actions */}
      {canManage ? (
        <section className="space-y-4 rounded-2xl border p-4">
          <div>
            <h3 className="font-display text-base font-bold">
              Admin response
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Move the request into review,
              resolve it, or reject it with
              admin remarks.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>

            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(
                  value as ComplaintManageStatus,
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="in-review">
                  In review
                </SelectItem>

                <SelectItem value="resolved">
                  Resolved
                </SelectItem>

                <SelectItem value="rejected">
                  Rejected
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>
              Admin remarks
            </Label>

            <Textarea
              value={remarks}
              onChange={(event) =>
                setRemarks(
                  event.target.value,
                )
              }
              placeholder="Add notes about the resolution or rejection..."
              rows={5}
            />
          </div>

          <Button
            disabled={saving}
            onClick={() => void save()}
          >
            {saving
              ? "Saving..."
              : "Update support request"}
          </Button>
        </section>
      ) : (
        <section className="rounded-2xl border p-4">
          <p className="text-sm font-semibold">
            Admin remarks
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {complaint.adminRemarks ||
              "No admin remarks yet."}
          </p>
        </section>
      )}
    </div>
  );
}

function ComplaintStatusBadge({
  status,
}: {
  status?: string;
}) {
  const value = status || "pending";

  const styles =
    value === "resolved"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : value === "rejected"
        ? "bg-red-500/10 text-red-700 dark:text-red-300"
        : value === "in-review"
          ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-300";

  return (
    <Badge
      variant="outline"
      className={`border-transparent ${styles}`}
    >
      {formatComplaintStatus(value)}
    </Badge>
  );
}

function formatComplaintStatus(
  value: string,
) {
  return value
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/components/admin/AdminAuth";
import { AdminPageHeader, EmptyPanel, ErrorPanel, LoadingPanel, PaginationBar, StatusBadge, formatCurrency, formatDate } from "@/components/admin/AdminCommon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { absoluteUploadUrl, adminApi, type Rider, type Washer } from "@/lib/admin-api";

type Kind = "rider" | "washer";
type RecordType = Rider | Washer;

export function VerificationPage({ kind }: { kind: Kind }) {
  const plural = kind === "rider" ? "riders" : "washers";
  const { hasPermission, isSuperAdmin } = useAdminAuth();
  const canView = hasPermission(`${plural}.view`);
  const canVerify = hasPermission(`${plural}.verify`);
  const canEdit = hasPermission(`${plural}.edit`);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin", plural, { status, page }],
    queryFn: () => kind === "rider"
      ? adminApi.riders({ status: status === "all" ? undefined : status, page, limit: 20 })
      : adminApi.washers({ status: status === "all" ? undefined : status, page, limit: 20 }),
    enabled: canView,
  });

  const detailQuery = useQuery({
    queryKey: ["admin", kind, selectedId],
    queryFn: () => kind === "rider" ? adminApi.rider(selectedId!) : adminApi.washer(selectedId!),
    enabled: canView && !!selectedId,
  });

  const records = kind === "rider"
    ? (listQuery.data as Awaited<ReturnType<typeof adminApi.riders>> | undefined)?.riders ?? []
    : (listQuery.data as Awaited<ReturnType<typeof adminApi.washers>> | undefined)?.washers ?? [];

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", plural] }),
      selectedId ? queryClient.invalidateQueries({ queryKey: ["admin", kind, selectedId] }) : Promise.resolve(),
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] }),
    ]);
  }

  async function remove(record: RecordType) {
    const name = getName(record, kind);
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      if (kind === "rider") await adminApi.deleteRider(record._id);
      else await adminApi.deleteWasher(record._id);
      toast.success(`${kind === "rider" ? "Rider" : "Washer"} deleted`);
      if (selectedId === record._id) setSelectedId(null);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  if (!canView) return <ErrorPanel message={`Your account does not have ${plural}.view permission.`} />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="KYC & availability"
        title={kind === "rider" ? "Riders" : "Washers"}
        description={kind === "rider" ? "Review rider profiles, vehicle details and identity documents." : "Review service provider profiles, shop information, services and KYC documents."}
      />

      <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Verification queue</p>
            <p className="text-xs text-muted-foreground">Filter by current KYC status.</p>
          </div>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {listQuery.isLoading ? <div className="p-4"><LoadingPanel /></div> : listQuery.isError ? <div className="p-4"><ErrorPanel message={listQuery.error.message} /></div> : !records.length ? <div className="p-4"><EmptyPanel message={`No ${plural} found.`} /></div> : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>{kind === "rider" ? "Vehicle" : "Shop / services"}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={getProfilePhoto(record, kind)} />
                          <AvatarFallback>{getName(record, kind).slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div><p className="font-semibold">{getName(record, kind)}</p><p className="text-xs text-muted-foreground">{getContact(record)}</p></div>
                      </div>
                    </TableCell>
                    <TableCell>{kind === "rider" ? <><p className="font-medium">{(record as Rider).vehicleType || "—"}</p><p className="text-xs text-muted-foreground">{(record as Rider).vehicleRegNo || "No registration"}</p></> : <><p className="max-w-56 truncate font-medium">{(record as Washer).shopAddress || "—"}</p><p className="max-w-56 truncate text-xs text-muted-foreground">{(record as Washer).services?.join(", ") || "No services"}</p></>}</TableCell>
                    <TableCell><StatusBadge status={record.verificationStatus} /></TableCell>
                    <TableCell><StatusBadge status={record.isAvailable ? "active" : "inactive"} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(record.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setSelectedId(record._id)}><Eye /><span className="sr-only">View</span></Button>
                        {isSuperAdmin ? <Button size="icon" variant="ghost" className="text-destructive" onClick={() => void remove(record)}><Trash2 /><span className="sr-only">Delete</span></Button> : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationBar page={listQuery.data?.page ?? page} totalPages={listQuery.data?.totalPages ?? 1} total={listQuery.data?.total} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{kind === "rider" ? "Rider" : "Washer"} review</SheetTitle>
            <SheetDescription>Check profile information and uploaded documents before taking action.</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {detailQuery.isLoading ? <LoadingPanel /> : detailQuery.isError ? <ErrorPanel message={detailQuery.error.message} /> : detailQuery.data ? (
              <VerificationDetail kind={kind} record={detailQuery.data} canVerify={canVerify} canEdit={canEdit} isSuperAdmin={isSuperAdmin} onChanged={refresh} onDelete={() => void remove(detailQuery.data!)} />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function VerificationDetail({ kind, record, canVerify, canEdit, isSuperAdmin, onChanged, onDelete }: { kind: Kind; record: RecordType; canVerify: boolean; canEdit: boolean; isSuperAdmin: boolean; onChanged: () => Promise<void>; onDelete: () => void }) {
  const rider = record as Rider;
  const washer = record as Washer;
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(getName(record, kind));
  const [primaryField, setPrimaryField] = useState(kind === "rider" ? rider.vehicleRegNo || "" : washer.shopAddress || "");
  const [secondaryField, setSecondaryField] = useState(kind === "rider" ? rider.currentAddress || "" : String(washer.experience ?? ""));

  useEffect(() => {
    setFullName(getName(record, kind));
    setPrimaryField(kind === "rider" ? rider.vehicleRegNo || "" : washer.shopAddress || "");
    setSecondaryField(kind === "rider" ? rider.currentAddress || "" : String(washer.experience ?? ""));
  }, [record._id]);

  const documents = useMemo(() => getDocuments(record, kind), [record, kind]);

  async function action(fn: () => Promise<unknown>, message: string) {
    setSaving(true);
    try {
      await fn();
      toast.success(message);
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setSaving(false);
    }
  }

  async function verify(actionName: "verify" | "reject") {
    await action(
      () => kind === "rider" ? adminApi.verifyRider(record._id, actionName, reason) : adminApi.verifyWasher(record._id, actionName, reason),
      actionName === "verify" ? "KYC approved" : "KYC rejected",
    );
  }

  async function saveEdit() {
    const body = kind === "rider"
      ? { fullName, vehicleRegNo: primaryField, currentAddress: secondaryField }
      : { name: fullName, shopAddress: primaryField, experience: secondaryField ? Number(secondaryField) : undefined };
    await action(() => kind === "rider" ? adminApi.updateRider(record._id, body) : adminApi.updateWasher(record._id, body), "Profile updated");
    setEditing(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl bg-muted/50 p-4">
        <Avatar className="h-14 w-14"><AvatarImage src={getProfilePhoto(record, kind)} /><AvatarFallback>{getName(record, kind).slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1"><p className="truncate font-display text-xl font-bold">{getName(record, kind)}</p><p className="text-sm text-muted-foreground">{getContact(record)}</p></div>
        <StatusBadge status={record.verificationStatus} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {kind === "rider" ? <>
          <Info label="Gender" value={rider.gender || "—"} />
          <Info label="Date of birth" value={rider.dob ? formatDate(rider.dob) : "—"} />
          <Info label="Vehicle" value={`${rider.vehicleType || "—"} · ${rider.vehicleRegNo || "No reg."}`} />
          <Info label="Own two wheeler" value={rider.hasTwoWheeler ? "Yes" : "No"} />
          <Info label="Current address" value={rider.currentAddress || "—"} />
          <Info label="Permanent address" value={rider.permanentAddress || "—"} />
          <Info label="Emergency contact" value={`${rider.emergencyContact?.name || "—"} · ${rider.emergencyContact?.mobile || "—"}`} />
          <Info label="Total earnings" value={formatCurrency(rider.totalEarnings)} />
        </> : <>
          <Info label="Gender" value={washer.gender || "—"} />
          <Info label="Experience" value={washer.experience !== undefined ? `${washer.experience} years` : "—"} />
          <Info label="Shop address" value={washer.shopAddress || "—"} />
          <Info label="Services" value={washer.services?.join(", ") || "—"} />
          <Info label="Phone" value={washer.phone || "—"} />
          <Info label="Email" value={washer.email || "—"} />
        </>}
      </div>

      <section>
        <h3 className="mb-3 font-display text-base font-bold">Documents</h3>
        {documents.length ? <div className="grid gap-3 sm:grid-cols-2">
          {documents.map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border bg-card transition hover:border-primary/40">
              <div className="aspect-[16/10] overflow-hidden bg-muted"><img src={url} alt={label} className="h-full w-full object-cover transition group-hover:scale-[1.02]" /></div>
              <div className="flex items-center justify-between p-3 text-sm font-medium"><span>{label}</span><ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /></div>
            </a>
          ))}
        </div> : <EmptyPanel message="No document URLs were returned." />}
      </section>

      {canVerify ? <section className="space-y-3 rounded-2xl border p-4">
        <h3 className="font-display text-base font-bold">KYC decision</h3>
        <Textarea placeholder="Reason (recommended for rejection)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <Button disabled={saving} onClick={() => void verify("verify")}>Approve KYC</Button>
          <Button variant="destructive" disabled={saving} onClick={() => void verify("reject")}>Reject KYC</Button>
        </div>
      </section> : null}

      {canEdit ? <section className="rounded-2xl border p-4">
        <div className="flex items-center justify-between gap-3"><div><h3 className="font-display text-base font-bold">Profile fields</h3><p className="text-xs text-muted-foreground">Edit common fields supported by the API.</p></div><Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}><Pencil /> {editing ? "Close" : "Edit"}</Button></div>
        {editing ? <div className="mt-4 space-y-3">
          <div className="space-y-1.5"><Label>{kind === "rider" ? "Full name" : "Name"}</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>{kind === "rider" ? "Vehicle registration" : "Shop address"}</Label><Input value={primaryField} onChange={(e) => setPrimaryField(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>{kind === "rider" ? "Current address" : "Experience (years)"}</Label><Input type={kind === "washer" ? "number" : "text"} value={secondaryField} onChange={(e) => setSecondaryField(e.target.value)} /></div>
          <Button disabled={saving} onClick={() => void saveEdit()}>Save changes</Button>
        </div> : null}
      </section> : null}

      {isSuperAdmin ? <Button variant="destructive" className="w-full" onClick={onDelete}><Trash2 /> Delete {kind}</Button> : null}
    </div>
  );
}

function getName(record: RecordType, kind: Kind) {
  return kind === "rider" ? (record as Rider).fullName || "Unnamed rider" : (record as Washer).name || (record as Washer).fullName || "Unnamed washer";
}

function getContact(record: RecordType) {
  const phone = (record as Rider).phone || (record as Washer).phone;
  const email = (record as Rider).email || (record as Washer).email;
  return phone || email || record._id;
}

function getProfilePhoto(record: RecordType, kind: Kind) {
  const path = kind === "rider" ? (record as Rider).documents?.profilePhoto : (record as Washer).profilePhoto;
  return absoluteUploadUrl(path);
}

function getDocuments(record: RecordType, kind: Kind) {
  const values: Array<[string, string | undefined]> = kind === "rider"
    ? [
        ["Aadhaar front", (record as Rider).documents?.aadhaarFront],
        ["Aadhaar back", (record as Rider).documents?.aadhaarBack],
        ["Driving licence", (record as Rider).documents?.drivingLicense],
        ["Vehicle RC", (record as Rider).documents?.rc],
      ]
    : [
        ["Aadhaar front", (record as Washer).aadhaarFront],
        ["Aadhaar back", (record as Washer).aadhaarBack],
        ["Shop photo", (record as Washer).shopPhoto],
      ];
  return values.filter((entry): entry is [string, string] => !!entry[1]).map(([label, path]) => [label, absoluteUploadUrl(path)] as [string, string]);
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}

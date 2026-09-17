import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, EmptyPanel, ErrorPanel, LoadingPanel, PaginationBar, StatusBadge, formatDate } from "@/components/admin/AdminCommon";
import { useAdminAuth } from "@/components/admin/AdminAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { absoluteUploadUrl, adminApi, type Customer } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers · Kora Admin" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const { hasPermission, isSuperAdmin } = useAdminAuth();
  const canView = hasPermission("customers.view");
  const canEdit = hasPermission("customers.edit");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const listQuery = useQuery({
    queryKey: ["admin", "customers", { page, search }],
    queryFn: () => adminApi.customers({ page, limit: 20, search }),
    enabled: canView,
  });

  const detailQuery = useQuery({
    queryKey: ["admin", "customer", selectedId],
    queryFn: () => adminApi.customer(selectedId!),
    enabled: canView && !!selectedId,
  });

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] }),
      selectedId ? queryClient.invalidateQueries({ queryKey: ["admin", "customer", selectedId] }) : Promise.resolve(),
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] }),
    ]);
  }

  async function remove(customer: Customer) {
    if (!window.confirm(`Delete ${customer.fullName || "this customer"}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteCustomer(customer._id);
      toast.success("Customer deleted");
      if (selectedId === customer._id) setSelectedId(null);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  if (!canView) return <ErrorPanel message="Your account does not have customers.view permission." />;

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Accounts" title="Customers" description="Search customer accounts, inspect addresses and update profile information." />
      <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border">
        <div className="border-b p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customer name" className="pl-9" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
        </div>

        {listQuery.isLoading ? <div className="p-4"><LoadingPanel /></div> : listQuery.isError ? <div className="p-4"><ErrorPanel message={listQuery.error.message} /></div> : !listQuery.data?.customers?.length ? <div className="p-4"><EmptyPanel message="No customers found." /></div> : (
          <>
            <Table>
              <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Contact</TableHead><TableHead>Addresses</TableHead><TableHead>Account</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {listQuery.data.customers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarImage src={absoluteUploadUrl(customer.profilePhoto)} /><AvatarFallback>{customer.fullName?.slice(0, 2).toUpperCase() || "CU"}</AvatarFallback></Avatar><div><p className="font-semibold">{customer.fullName || "Unnamed customer"}</p><p className="text-xs text-muted-foreground">{customer._id}</p></div></div></TableCell>
                    <TableCell><p className="text-sm">{customer.phone || customer.accountId?.mobile || "—"}</p><p className="text-xs text-muted-foreground">{customer.accountId?.email || "—"}</p></TableCell>
                    <TableCell><p className="text-sm font-medium">{customer.addresses?.length ?? 0} saved</p><p className="max-w-52 truncate text-xs text-muted-foreground">{customer.addresses?.[0]?.city || "No city"}</p></TableCell>
                    <TableCell><StatusBadge status={customer.accountId?.isVerified ? "verified" : "pending"} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(customer.createdAt)}</TableCell>
                    <TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => setSelectedId(customer._id)}><Eye /><span className="sr-only">View</span></Button>{isSuperAdmin ? <Button size="icon" variant="ghost" className="text-destructive" onClick={() => void remove(customer)}><Trash2 /><span className="sr-only">Delete</span></Button> : null}</div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationBar page={listQuery.data.page ?? page} totalPages={listQuery.data.totalPages ?? 1} total={listQuery.data.total} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader><SheetTitle>Customer profile</SheetTitle><SheetDescription>View account and saved address information.</SheetDescription></SheetHeader>
          <div className="mt-6">{detailQuery.isLoading ? <LoadingPanel /> : detailQuery.isError ? <ErrorPanel message={detailQuery.error.message} /> : detailQuery.data ? <CustomerDetail customer={detailQuery.data} canEdit={canEdit} isSuperAdmin={isSuperAdmin} onChanged={refresh} onDelete={() => void remove(detailQuery.data!)} /> : null}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CustomerDetail({ customer, canEdit, isSuperAdmin, onChanged, onDelete }: { customer: Customer; canEdit: boolean; isSuperAdmin: boolean; onChanged: () => Promise<void>; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(customer.fullName || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await adminApi.updateCustomer(customer._id, { fullName, phone });
      toast.success("Customer updated");
      setEditing(false);
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return <div className="space-y-6">
    <div className="flex items-center gap-4 rounded-2xl bg-muted/50 p-4"><Avatar className="h-14 w-14"><AvatarImage src={absoluteUploadUrl(customer.profilePhoto)} /><AvatarFallback>{customer.fullName?.slice(0, 2).toUpperCase() || "CU"}</AvatarFallback></Avatar><div><p className="font-display text-xl font-bold">{customer.fullName || "Unnamed customer"}</p><p className="text-sm text-muted-foreground">{customer.accountId?.email || customer.phone || "—"}</p></div></div>
    <div className="grid gap-4 sm:grid-cols-2"><Info label="Phone" value={customer.phone || customer.accountId?.mobile || "—"} /><Info label="Email" value={customer.accountId?.email || "—"} /><Info label="Date of birth" value={customer.dob ? formatDate(customer.dob) : "—"} /><Info label="Account verification" value={customer.accountId?.isVerified ? "Verified" : "Not verified"} /></div>
    <section><h3 className="mb-3 font-display text-base font-bold">Saved addresses</h3><div className="space-y-2">{customer.addresses?.length ? customer.addresses.map((address, index) => <div key={`${address.label}-${index}`} className="rounded-xl border p-3"><p className="text-sm font-semibold">{address.label || `Address ${index + 1}`}</p><p className="mt-1 text-sm text-muted-foreground">{[address.addressLine, address.city, address.pincode].filter(Boolean).join(", ")}</p></div>) : <EmptyPanel message="No saved addresses." />}</div></section>
    {canEdit ? <section className="rounded-2xl border p-4"><div className="flex items-center justify-between"><div><h3 className="font-display text-base font-bold">Edit profile</h3><p className="text-xs text-muted-foreground">Update common editable fields.</p></div><Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}><Pencil /> {editing ? "Close" : "Edit"}</Button></div>{editing ? <div className="mt-4 space-y-3"><div className="space-y-1.5"><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div><div className="space-y-1.5"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div><Button disabled={saving} onClick={() => void save()}>Save changes</Button></div> : null}</section> : null}
    {isSuperAdmin ? <Button variant="destructive" className="w-full" onClick={onDelete}><Trash2 /> Delete customer</Button> : null}
  </div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>; }

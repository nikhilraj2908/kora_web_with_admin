import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AdminPageHeader, EmptyPanel, ErrorPanel, LoadingPanel, PaginationBar, formatDate } from "@/components/admin/AdminCommon";
import { useAdminAuth } from "@/components/admin/AdminAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi, type SubAdmin } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/subadmins")({
  head: () => ({ meta: [{ title: "Sub-admins · Kora Admin" }] }),
  component: SubAdminsPage,
});

function SubAdminsPage() {
  const { isSuperAdmin } = useAdminAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SubAdmin | null>(null);

  const listQuery = useQuery({ queryKey: ["admin", "subadmins", page], queryFn: () => adminApi.subAdmins(page, 20), enabled: isSuperAdmin });
  const permissionsQuery = useQuery({ queryKey: ["admin", "permissions"], queryFn: adminApi.permissions, enabled: isSuperAdmin });

  if (!isSuperAdmin) return <Navigate to="/admin" />;

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "subadmins"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] }),
    ]);
  }

  async function toggleActive(item: SubAdmin, value: boolean) {
    const id = item._id || item.id;
    if (!id) return toast.error("Sub-admin id missing from API response");
    try {
      await adminApi.updateSubAdmin(id, { isActive: value });
      toast.success(value ? "Sub-admin activated" : "Sub-admin suspended");
      await refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Update failed"); }
  }

  async function remove(item: SubAdmin) {
    const id = item._id || item.id;
    if (!id) return;
    if (!window.confirm(`Delete ${item.fullName || "this sub-admin"}?`)) return;
    try { await adminApi.deleteSubAdmin(id); toast.success("Sub-admin deleted"); await refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Delete failed"); }
  }

  return <div className="space-y-6">
    <AdminPageHeader eyebrow="Access control" title="Sub-admins" description="Create restricted admin accounts and grant only the permissions each teammate needs." action={<Button onClick={() => setCreateOpen(true)}><Plus /> Add sub-admin</Button>} />
    <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border">
      {listQuery.isLoading ? <div className="p-4"><LoadingPanel /></div> : listQuery.isError ? <div className="p-4"><ErrorPanel message={listQuery.error.message} /></div> : !listQuery.data?.subAdmins?.length ? <div className="p-4"><EmptyPanel message="No sub-admins created yet." /></div> : <>
        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Permissions</TableHead><TableHead>Active</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{listQuery.data.subAdmins.map((item) => { const account = typeof item.accountId === "object" ? item.accountId : undefined; return <TableRow key={item._id || item.id}><TableCell><p className="font-semibold">{item.fullName || "—"}</p><p className="text-xs text-muted-foreground">{item._id || item.id}</p></TableCell><TableCell><p className="text-sm">{item.email || account?.email || "—"}</p><p className="text-xs text-muted-foreground">{item.mobile || account?.mobile || "—"}</p></TableCell><TableCell><div className="flex max-w-72 flex-wrap gap-1">{item.permissions?.slice(0, 3).map((p) => <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>)}{(item.permissions?.length ?? 0) > 3 ? <Badge variant="outline" className="text-[10px]">+{(item.permissions?.length ?? 0)-3}</Badge> : null}</div></TableCell><TableCell><Switch checked={item.isActive !== false} onCheckedChange={(value) => void toggleActive(item, value)} /></TableCell><TableCell className="text-xs text-muted-foreground">{formatDate(item.createdAt || account?.createdAt)}</TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => setEditing(item)}>Edit</Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => void remove(item)}><Trash2 /><span className="sr-only">Delete</span></Button></div></TableCell></TableRow>; })}</TableBody></Table>
        <PaginationBar page={listQuery.data.page ?? page} totalPages={listQuery.data.totalPages ?? 1} total={listQuery.data.total} onPageChange={setPage} />
      </>}
    </Card>
    <SubAdminDialog open={createOpen} onOpenChange={setCreateOpen} permissions={permissionsQuery.data ?? []} mode="create" onSaved={refresh} />
    <SubAdminDialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)} permissions={permissionsQuery.data ?? []} mode="edit" item={editing ?? undefined} onSaved={refresh} />
  </div>;
}

function SubAdminDialog({ open, onOpenChange, permissions, mode, item, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; permissions: string[]; mode: "create" | "edit"; item?: SubAdmin; onSaved: () => Promise<void> }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && item) {
      setFullName(item.fullName || "");
      setEmail(item.email || (typeof item.accountId === "object" ? item.accountId.email || "" : ""));
      setMobile(item.mobile || (typeof item.accountId === "object" ? item.accountId.mobile || "" : ""));
      setSelected(item.permissions || []);
    } else {
      setFullName("");
      setEmail("");
      setMobile("");
      setSelected([]);
    }
    setPassword("");
  }, [open, mode, item]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (mode === "create") {
        await adminApi.createSubAdmin({ fullName, email, mobile, password, permissions: selected });
      } else {
        const id = item?._id || item?.id;
        if (!id) throw new Error("Sub-admin id missing");
        await adminApi.updateSubAdmin(id, { fullName, permissions: selected });
      }
      toast.success(mode === "create" ? "Sub-admin created" : "Sub-admin updated");
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Create sub-admin" : "Edit sub-admin"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a team login and choose permissions returned by the backend."
                : "Update the sub-admin name and permission set."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Full name</Label>
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            {mode === "create" ? (
              <>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Mobile</Label>
                  <Input required value={mobile} onChange={(e) => setMobile(e.target.value)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Password</Label>
                  <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </>
            ) : null}

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Permissions</Label>
                <span className="text-xs text-muted-foreground">{selected.length} selected</span>
              </div>
              <div className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2">
                {permissions.length ? (
                  permissions.map((permission) => {
                    const checked = selected.includes(permission);
                    return (
                      <label key={permission} className="flex cursor-pointer items-start gap-2 rounded-lg p-2 hover:bg-muted">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            setSelected((current) =>
                              value
                                ? Array.from(new Set([...current, permission]))
                                : current.filter((p) => p !== permission),
                            )
                          }
                        />
                        <span>
                          <span className="block text-xs font-semibold">{permission}</span>
                          <span className="text-[11px] text-muted-foreground">{permissionDescription(permission)}</span>
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <p className="col-span-2 text-sm text-muted-foreground">Permission list could not be loaded.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !fullName}>
              {saving ? "Saving..." : mode === "create" ? "Create sub-admin" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function permissionDescription(key: string) { const map: Record<string,string> = { "dashboard.view":"View dashboard stats", "orders.view":"View orders", "orders.manage":"Manage order lifecycle", "riders.view":"View riders", "riders.verify":"Approve or reject rider KYC", "riders.edit":"Edit rider profiles", "washers.view":"View washers", "washers.verify":"Approve or reject washer KYC", "washers.edit":"Edit washer profiles", "customers.view":"View customers", "customers.edit":"Edit customer profiles", "complaints.view":"Reserved: view complaints", "complaints.manage":"Reserved: manage complaints", "config.manage":"Reserved: platform config" }; return map[key] || "Backend-defined permission"; }

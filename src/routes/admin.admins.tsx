import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AdminPageHeader, EmptyPanel, ErrorPanel, LoadingPanel, formatDate } from "@/components/admin/AdminCommon";
import { useAdminAuth } from "@/components/admin/AdminAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/admins")({
  head: () => ({ meta: [{ title: "Super Admins · Kora Admin" }] }),
  component: AdminsPage,
});

function AdminsPage() {
  const { isSuperAdmin } = useAdminAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: ["admin", "admins"], queryFn: adminApi.admins, enabled: isSuperAdmin });

  if (!isSuperAdmin) return <Navigate to="/admin" />;

  return <div className="space-y-6">
    <AdminPageHeader eyebrow="Access control" title="Super admins" description="View unrestricted admin accounts or create another super admin when required." action={<Button onClick={() => setOpen(true)}><Plus /> Add super admin</Button>} />
    <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border">
      {query.isLoading ? <div className="p-4"><LoadingPanel /></div> : query.isError ? <div className="p-4"><ErrorPanel message={query.error.message} /></div> : !query.data?.length ? <div className="p-4"><EmptyPanel message="No super-admin accounts returned." /></div> : <Table><TableHeader><TableRow><TableHead>Admin</TableHead><TableHead>Email</TableHead><TableHead>Mobile</TableHead><TableHead>Level</TableHead><TableHead>Created</TableHead></TableRow></TableHeader><TableBody>{query.data.map((item, index) => <TableRow key={item._id || item.accountId?._id || index}><TableCell><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary">{item.fullName?.slice(0,2).toUpperCase() || "SA"}</AvatarFallback></Avatar><div><p className="font-semibold">{item.fullName || "Super Admin"}</p><p className="text-xs text-muted-foreground">{item._id || "—"}</p></div></div></TableCell><TableCell>{item.accountId?.email || "—"}</TableCell><TableCell>{item.accountId?.mobile || "—"}</TableCell><TableCell><Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> {item.level || "admin"}</Badge></TableCell><TableCell className="text-xs text-muted-foreground">{formatDate(item.accountId?.createdAt)}</TableCell></TableRow>)}</TableBody></Table>}
    </Card>
    <CreateAdminDialog open={open} onOpenChange={setOpen} onSaved={async () => { await queryClient.invalidateQueries({ queryKey: ["admin", "admins"] }); }} />
  </div>;
}

function CreateAdminDialog({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => Promise<void> }) {
  const [fullName, setFullName] = useState(""); const [email, setEmail] = useState(""); const [mobile, setMobile] = useState(""); const [password, setPassword] = useState(""); const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); try { await adminApi.createAdmin({ fullName, email, mobile, password }); toast.success("Super admin created"); onOpenChange(false); setFullName(""); setEmail(""); setMobile(""); setPassword(""); await onSaved(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create admin"); } finally { setSaving(false); } }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><form onSubmit={submit}><DialogHeader><DialogTitle>Create super admin</DialogTitle><DialogDescription>This account will have unrestricted admin access.</DialogDescription></DialogHeader><div className="mt-5 space-y-4"><div className="space-y-1.5"><Label>Full name</Label><Input required value={fullName} onChange={(e)=>setFullName(e.target.value)} /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label>Email</Label><Input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} /></div><div className="space-y-1.5"><Label>Mobile</Label><Input required value={mobile} onChange={(e)=>setMobile(e.target.value)} /></div></div><div className="space-y-1.5"><Label>Password</Label><Input required type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /></div></div><DialogFooter className="mt-6"><Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create super admin"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AdminPageHeader, EmptyPanel, ErrorPanel, LoadingPanel, PaginationBar, StatusBadge, formatCurrency, formatDate } from "@/components/admin/AdminCommon";
import { useAdminAuth } from "@/components/admin/AdminAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUSES, adminApi, type Order } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders · Kora Admin" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const { hasPermission, isSuperAdmin } = useAdminAuth();
  const canView = hasPermission("orders.view");
  const canManage = hasPermission("orders.manage");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const listQuery = useQuery({
    queryKey: ["admin", "orders", { page, search, status, from, to }],
    queryFn: () => adminApi.orders({ page, limit: 20, search, status: status === "all" ? undefined : status, from, to }),
    enabled: canView,
  });

  const detailQuery = useQuery({
    queryKey: ["admin", "order", selectedId],
    queryFn: () => adminApi.order(selectedId!),
    enabled: canView && !!selectedId,
  });

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
      selectedId ? queryClient.invalidateQueries({ queryKey: ["admin", "order", selectedId] }) : Promise.resolve(),
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] }),
    ]);
  }

  async function removeOrder(order: Order) {
    if (!window.confirm(`Delete order ${order.orderNumber || order._id}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteOrder(order._id);
      toast.success("Order deleted");
      if (selectedId === order._id) setSelectedId(null);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete order");
    }
  }

  if (!canView) return <ErrorPanel message="Your account does not have orders.view permission." />;

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Fulfillment" title="Orders" description="Search, review and manually manage the complete order lifecycle." />

      <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border">
        <div className="grid gap-3 border-b p-4 md:grid-cols-[minmax(220px,1fr)_190px_160px_160px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search order number" className="pl-9" />
          </div>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ORDER_STATUSES.map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} aria-label="From date" />
          <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} aria-label="To date" />
        </div>

        {listQuery.isLoading ? <div className="p-4"><LoadingPanel /></div> : listQuery.isError ? <div className="p-4"><ErrorPanel message={listQuery.error.message} /></div> : !listQuery.data?.orders?.length ? <div className="p-4"><EmptyPanel message="No orders match these filters." /></div> : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.data.orders.map((order) => {
                  const customer = typeof order.customerId === "object" ? order.customerId : undefined;
                  return (
                    <TableRow key={order._id}>
                      <TableCell><p className="font-semibold">{order.orderNumber || "—"}</p><p className="max-w-36 truncate text-xs text-muted-foreground">{order._id}</p></TableCell>
                      <TableCell><p className="font-medium">{customer?.fullName || "Unknown"}</p><p className="text-xs text-muted-foreground">{customer?.phone || "—"}</p></TableCell>
                      <TableCell><StatusBadge status={order.status} /></TableCell>
                      <TableCell><div className="flex flex-col items-start gap-1"><StatusBadge status={order.paymentStatus} /><span className="text-xs capitalize text-muted-foreground">{order.paymentMethod || "—"}</span></div></TableCell>
                      <TableCell className="font-semibold">{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setSelectedId(order._id)}><Eye /><span className="sr-only">View order</span></Button>
                          {isSuperAdmin ? <Button size="icon" variant="ghost" className="text-destructive" onClick={() => void removeOrder(order)}><Trash2 /><span className="sr-only">Delete order</span></Button> : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <PaginationBar page={listQuery.data.page ?? page} totalPages={listQuery.data.totalPages ?? 1} total={listQuery.data.total} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Order details</SheetTitle>
            <SheetDescription>Review status history, addresses, items and admin actions.</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {detailQuery.isLoading ? <LoadingPanel /> : detailQuery.isError ? <ErrorPanel message={detailQuery.error.message} /> : detailQuery.data ? (
              <OrderDetail order={detailQuery.data} canManage={canManage} isSuperAdmin={isSuperAdmin} onChanged={refresh} onDelete={() => void removeOrder(detailQuery.data!)} />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function OrderDetail({ order, canManage, isSuperAdmin, onChanged, onDelete }: { order: Order; canManage: boolean; isSuperAdmin: boolean; onChanged: () => Promise<void>; onDelete: () => void }) {
  const [nextStatus, setNextStatus] = useState(order.status || "pending_sp");
  const [statusNote, setStatusNote] = useState("");
  const [serviceProviderId, setServiceProviderId] = useState("");
  const [riderPickupId, setRiderPickupId] = useState("");
  const [riderDeliveryId, setRiderDeliveryId] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function action(fn: () => Promise<unknown>, success: string) {
    setSaving(true);
    try {
      await fn();
      toast.success(success);
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl bg-muted/50 p-4 sm:grid-cols-2">
        <Info label="Order number" value={order.orderNumber || "—"} />
        <Info label="Status" value={<StatusBadge status={order.status} />} />
        <Info label="Payment" value={<span className="capitalize">{order.paymentMethod || "—"} · {order.paymentStatus || "—"}</span>} />
        <Info label="Total" value={formatCurrency(order.totalAmount)} />
        <Info label="Pickup" value={order.pickupAddress?.address || "—"} />
        <Info label="Delivery" value={order.deliveryAddress?.address || "—"} />
      </div>

      <section>
        <h3 className="mb-3 font-display text-base font-bold">Items</h3>
        <div className="divide-y rounded-xl border">
          {(order.items ?? []).map((item, index) => (
            <div key={`${item.serviceName}-${index}`} className="flex items-center justify-between gap-4 p-3 text-sm">
              <div><p className="font-medium">{item.serviceName || "Service"}</p><p className="text-xs text-muted-foreground">Qty {item.quantity ?? 0} × {formatCurrency(item.unitPrice)}</p></div>
              <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
            </div>
          ))}
          {!order.items?.length ? <p className="p-4 text-sm text-muted-foreground">No items returned.</p> : null}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-base font-bold">Status history</h3>
        <div className="space-y-0">
          {(order.statusHistory ?? []).map((entry, index) => (
            <div key={`${entry.status}-${index}`} className="relative flex gap-3 pb-5 pl-1 before:absolute before:left-[9px] before:top-5 before:h-full before:w-px before:bg-border last:before:hidden">
              <span className="relative z-10 mt-1.5 h-[18px] w-[18px] shrink-0 rounded-full border-4 border-background bg-primary" />
              <div><StatusBadge status={entry.status} /><p className="mt-1 text-sm">{entry.note || "No note"}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(entry.updatedAt)}</p></div>
            </div>
          ))}
          {!order.statusHistory?.length ? <p className="text-sm text-muted-foreground">No status history returned.</p> : null}
        </div>
      </section>

      {canManage ? (
        <section className="space-y-5 rounded-2xl border p-4">
          <h3 className="font-display text-base font-bold">Manage order</h3>
          <div className="space-y-2">
            <Label>Change status</Label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Select value={nextStatus} onValueChange={setNextStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ORDER_STATUSES.map((value) => <SelectItem key={value} value={value}>{value.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select>
              <Button disabled={saving} onClick={() => void action(() => adminApi.updateOrderStatus(order._id, nextStatus, statusNote), "Order status updated")}>Update</Button>
            </div>
            <Textarea placeholder="Optional status note" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} />
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label>Assign provider / riders</Label>
            <Input placeholder="Service provider / washer ID" value={serviceProviderId} onChange={(e) => setServiceProviderId(e.target.value)} />
            <Input placeholder="Pickup rider ID" value={riderPickupId} onChange={(e) => setRiderPickupId(e.target.value)} />
            <Input placeholder="Delivery rider ID" value={riderDeliveryId} onChange={(e) => setRiderDeliveryId(e.target.value)} />
            <Button variant="secondary" disabled={saving || (!serviceProviderId && !riderPickupId && !riderDeliveryId)} onClick={() => void action(() => adminApi.assignOrder(order._id, { serviceProviderId, riderPickupId, riderDeliveryId }), "Assignment updated")}>Save assignment</Button>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label>Cancel order</Label>
            <Textarea placeholder="Reason for cancellation (optional)" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            <Button variant="outline" disabled={saving} onClick={() => { if (window.confirm("Cancel this order?")) void action(() => adminApi.cancelOrder(order._id, cancelReason), "Order cancelled"); }}>Cancel order</Button>
          </div>
        </section>
      ) : null}

      {isSuperAdmin ? <Button variant="destructive" className="w-full" onClick={onDelete}><Trash2 /> Delete order permanently</Button> : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return <div><p className="text-xs font-medium text-muted-foreground">{label}</p><div className="mt-1 text-sm font-semibold">{value}</div></div>;
}

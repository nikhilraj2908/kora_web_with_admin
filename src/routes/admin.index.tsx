import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CircleDollarSign,
  ClipboardList,
  ShieldAlert,
  Shirt,
  TrendingUp,
  UserCog,
  Users,
  WashingMachine,
} from "lucide-react";
import { AdminPageHeader, ErrorPanel, LoadingPanel, StatusBadge, formatCurrency } from "@/components/admin/AdminCommon";
import { useAdminAuth } from "@/components/admin/AdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { adminApi, type DashboardStats } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard · Kora Admin" }] }),
  component: AdminDashboardPage,
});

const statCards = [
  { key: "customers", label: "Customers", icon: Users },
  { key: "riders", label: "Riders", icon: Shirt },
  { key: "washers", label: "Washers", icon: WashingMachine },
  { key: "orders", label: "Orders", icon: ClipboardList },
] as const;

function AdminDashboardPage() {
  const { hasPermission } = useAdminAuth();
  const canView = hasPermission("dashboard.view");
  const query = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.dashboard,
    enabled: canView,
  });

  if (!canView) return <ErrorPanel message="Your account does not have dashboard.view permission." />;
  if (query.isLoading) return <LoadingPanel label="Loading dashboard metrics..." />;
  if (query.isError) return <ErrorPanel message={query.error.message} />;

  const data = (query.data ?? {}) as DashboardStats;
  const orderStatuses = (Object.entries(data.orders?.byStatus ?? {}) as Array<[string, number]>).sort((a, b) => b[1] - a[1]);
  const orderTotal = data.orders?.total ?? orderStatuses.reduce((sum, [, value]) => sum + value, 0);

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Overview"
        title="Operations dashboard"
        description="A live snapshot of customers, fulfillment teams, orders and platform revenue."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon }) => (
          <Card key={key} className="overflow-hidden border-0 shadow-sm ring-1 ring-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <p className="mt-2 font-display text-3xl font-black">{data[key]?.total ?? 0}</p>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              {key === "riders" || key === "washers" ? (
                <p className="mt-4 text-xs text-muted-foreground">
                  <span className="font-semibold text-amber-600">{data[key]?.pending ?? 0} pending</span>
                  {" · "}{data[key]?.verified ?? 0} verified
                </p>
              ) : key === "orders" ? (
                <p className="mt-4 text-xs text-muted-foreground">{data.orders?.byStatus?.delivered ?? 0} delivered</p>
              ) : (
                <p className="mt-4 text-xs text-muted-foreground">Total registered accounts</p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Order pipeline</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Current distribution across fulfillment stages.</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {orderStatuses.length ? orderStatuses.map(([status, count]) => {
              const percent = orderTotal ? Math.round((count / orderTotal) * 100) : 0;
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge status={status} />
                    <span className="text-sm font-semibold">{count} <span className="font-normal text-muted-foreground">({percent}%)</span></span>
                  </div>
                  <Progress value={percent} className="h-2" />
                </div>
              );
            }) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No order status data yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <Card className="border-0 bg-primary text-primary-foreground shadow-sm">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
                  <CircleDollarSign className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Total paid</span>
              </div>
              <p className="text-sm text-primary-foreground/70">Revenue collected</p>
              <p className="mt-2 font-display text-3xl font-black">{formatCurrency(data.revenue?.totalPaid)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-border">
            <CardContent className="grid gap-4 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-coral/10 text-coral"><ShieldAlert className="h-4 w-4" /></div>
                  <span className="text-sm font-medium">Complaints</span>
                </div>
                <span className="font-display text-xl font-bold">{data.complaints?.total ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><UserCog className="h-4 w-4" /></div>
                  <span className="text-sm font-medium">Sub-admins</span>
                </div>
                <span className="font-display text-xl font-bold">{data.subAdmins?.total ?? 0}</span>
              </div>
              <p className="border-t pt-4 text-xs text-muted-foreground">
  {data.complaints?.pending ?? 0} pending support requests need review.
</p>            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

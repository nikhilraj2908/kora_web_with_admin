import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Shirt,
  Sun,
  UserCog,
  Users,
  WashingMachine,
   LifeBuoy,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "./AdminAuth";
import { getAdminDefaultRoute } from "@/lib/admin-access";

const navItems = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: Home,
    permission: "dashboard.view",
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: ClipboardList,
    permission: "orders.view",
  },
  {
    to: "/admin/riders",
    label: "Riders",
    icon: Shirt,
    permission: "riders.view",
  },
  {
    to: "/admin/washers",
    label: "Washers",
    icon: WashingMachine,
    permission: "washers.view",
  },
  {
    to: "/admin/customers",
    label: "Customers",
    icon: Users,
    permission: "customers.view",
  },
  {
    to: "/admin/complaints",
    label: "Help & Support",
    icon: LifeBuoy,
    permission: "complaints.view",
  },
] as const;
function KoraMark() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-foreground shadow-sm">
      K
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, hasPermission, isSuperAdmin, logout } = useAdminAuth();

  const links = navItems.filter((item) => hasPermission(item.permission));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <KoraMark />
        <div>
          <p className="font-display text-lg font-bold leading-none">Kora Admin</p>
          <p className="mt-1 text-xs text-muted-foreground">Operations console</p>
        </div>
      </div>

      <div className="px-3 py-2">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
        <nav className="space-y-1">
          {links.map((item) => {
            const active = item.to === "/admin" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {isSuperAdmin ? (
        <div className="px-3 py-2">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Access control</p>
          <nav className="space-y-1">
            <Link
              to="/admin/subadmins"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                pathname.startsWith("/admin/subadmins")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <UserCog className="h-4 w-4" /> Sub-admins
            </Link>
            <Link
              to="/admin/admins"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                pathname.startsWith("/admin/admins")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <ShieldCheck className="h-4 w-4" /> Super admins
            </Link>
          </nav>
        </div>
      ) : null}

      <div className="mt-auto border-t p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-muted/60 p-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 font-bold text-primary">
              {profile?.fullName?.slice(0, 2).toUpperCase() || "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{profile?.fullName || "Admin"}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{profile?.level || "admin"}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout}>
          <LogOut /> Sign out
        </Button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { status, profile, hasPermission } = useAdminAuth();
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (status === "booting") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto flex max-w-7xl gap-6">
          <Skeleton className="hidden h-[calc(100vh-3rem)] w-64 rounded-3xl lg:block" />
          <div className="flex-1 space-y-5">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return <Navigate to="/" />;

  if ((pathname === "/admin" || pathname === "/admin/") && !hasPermission("dashboard.view")) {
    const firstAllowed = getAdminDefaultRoute(profile);
    if (firstAllowed && firstAllowed !== "/admin") return <Navigate to={firstAllowed} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-card lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu />
                  <span className="sr-only">Open navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 sm:max-w-72">
                <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="hidden items-center gap-2 sm:flex">
              <Badge variant="outline" className="gap-1 rounded-full px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> API connected
              </Badge>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
                {theme === "dark" ? <Sun /> : <Moon />}
              </Button>
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold leading-tight">{profile?.fullName}</p>
                <p className="text-xs capitalize text-muted-foreground">{profile?.level}</p>
              </div>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                  {profile?.fullName?.slice(0, 2).toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

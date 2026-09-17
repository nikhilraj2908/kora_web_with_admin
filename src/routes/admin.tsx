import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { AdminAuthProvider } from "@/components/admin/AdminAuth";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  component: AdminRoot,
});

function AdminRoot() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isLogin = pathname === "/admin/login";

  return (
    <AdminAuthProvider>
      {isLogin ? (
        <Outlet />
      ) : (
        <AdminShell>
          <Outlet />
        </AdminShell>
      )}
    </AdminAuthProvider>
  );
}

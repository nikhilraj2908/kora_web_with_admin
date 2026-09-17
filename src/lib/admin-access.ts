import type { AdminProfile } from "@/lib/admin-api";

export type AdminRoutePath =
  | "/admin"
  | "/admin/orders"
  | "/admin/riders"
  | "/admin/washers"
  | "/admin/customers"
  | "/admin/complaints";

export function getAdminDefaultRoute(
  profile: AdminProfile | null,
): AdminRoutePath | null {
  if (!profile) return null;

  if (
    profile.level === "admin" ||
    profile.permissions?.includes("dashboard.view")
  ) {
    return "/admin";
  }

  if (profile.permissions?.includes("orders.view")) {
    return "/admin/orders";
  }

  if (profile.permissions?.includes("riders.view")) {
    return "/admin/riders";
  }

  if (profile.permissions?.includes("washers.view")) {
    return "/admin/washers";
  }

  if (profile.permissions?.includes("customers.view")) {
    return "/admin/customers";
  }

  if (profile.permissions?.includes("complaints.view")) {
    return "/admin/complaints";
  }

  return null;
}
export const ADMIN_TOKEN_KEY = "kora-admin-token";

export const ADMIN_API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

export type AdminLevel = "admin" | "subadmin";

export type AdminProfile = {
  accountId: string;
  fullName: string;
  level: AdminLevel;
  permissions: string[];
  isActive: boolean;
};

export type DashboardStats = {
  customers?: { total?: number };
  riders?: { total?: number; pending?: number; verified?: number; rejected?: number };
  washers?: { total?: number; pending?: number; verified?: number; rejected?: number };
  orders?: { total?: number; byStatus?: Record<string, number> };
  complaints?: { total?: number; pending?: number };
  subAdmins?: { total?: number };
  revenue?: { totalPaid?: number };
};

export type PaginationData<T> = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
} & T;

export const ORDER_STATUSES = [
  "pending_sp",
  "sp_assigned",
  "sp_accepted",
  "rider_pickup_assigned",
  "picked_up",
  "at_sp",
  "cleaned",
  "rider_delivery_assigned",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  _id: string;
  orderNumber?: string;
  customerId?: { _id?: string; fullName?: string; phone?: string } | string;
  items?: Array<{
    serviceName?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
  subtotal?: number;
  tax?: number;
  discount?: number;
  totalAmount?: number;
  status?: OrderStatus | string;
  statusHistory?: Array<{ status?: string; note?: string; updatedAt?: string }>;
  pickupAddress?: { address?: string; coordinates?: number[] };
  deliveryAddress?: { address?: string; coordinates?: number[] };
  serviceProviderId?: { _id?: string; name?: string; fullName?: string } | string;
  riderPickupId?: { _id?: string; fullName?: string } | string;
  riderDeliveryId?: { _id?: string; fullName?: string } | string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt?: string;
};

export type Rider = {
  _id: string;
  fullName?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  permanentAddress?: string;
  currentAddress?: string;
  hasTwoWheeler?: boolean;
  vehicleType?: string;
  vehicleRegNo?: string;
  emergencyContact?: { name?: string; mobile?: string };
  documents?: Record<string, string | undefined>;
  verificationStatus?: string;
  isVerified?: boolean;
  totalEarnings?: number;
  isOnline?: boolean;
  isAvailable?: boolean;
  createdAt?: string;
  [key: string]: unknown;
};

export type Washer = {
  _id: string;
  name?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  dob?: string;
  gender?: string;
  shopAddress?: string;
  shopPhoto?: string;
  services?: string[];
  experience?: number;
  aadhaarFront?: string;
  aadhaarBack?: string;
  profilePhoto?: string;
  verificationStatus?: string;
  isVerified?: boolean;
  isAvailable?: boolean;
  createdAt?: string;
  [key: string]: unknown;
};

export type Customer = {
  _id: string;
  fullName?: string;
  dob?: string;
  profilePhoto?: string;
  phone?: string;
  addresses?: Array<{
    label?: string;
    addressLine?: string;
    city?: string;
    pincode?: string;
  }>;
  accountId?: {
    _id?: string;
    email?: string;
    mobile?: string;
    isVerified?: boolean;
  };
  createdAt?: string;
  [key: string]: unknown;
};

export type SubAdmin = {
  _id?: string;
  id?: string;
  accountId?: { _id?: string; email?: string; mobile?: string; createdAt?: string } | string;
  fullName?: string;
  email?: string;
  mobile?: string;
  permissions?: string[];
  isActive?: boolean;
  createdAt?: string;
};

export type FullAdmin = {
  _id?: string;
  fullName?: string;
  level?: string;
  accountId?: { _id?: string; email?: string; mobile?: string; createdAt?: string };
};

export class AdminApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.payload = payload;
  }
}
export const COMPLAINT_STATUSES = [
  "pending",
  "in-review",
  "resolved",
  "rejected",
] as const;

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export type ComplaintManageStatus = Exclude<ComplaintStatus, "pending">;

export type Complaint = {
  _id: string;

  user?: {
    _id?: string;
    fullName?: string;
    phone?: string;
  };

  category?: string;
  orderId?: string;
  subject?: string;
  description?: string;

  photoUrls?: string[];

  status?: ComplaintStatus | string;
  adminRemarks?: string;

  createdAt?: string;
  updatedAt?: string;
};
function storedToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

function emit(name: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(name));
}

function buildQuery(params: Record<string, string | number | undefined | null>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query.set(key, String(value));
    }
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null; auth?: boolean } = {},
): Promise<T> {
  const { token = storedToken(), auth = true, headers, ...fetchOptions } = options;
  const finalHeaders = new Headers(headers);
  if (!finalHeaders.has("Content-Type") && fetchOptions.body) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth && token) finalHeaders.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers: finalHeaders,
    });
  } catch (error) {
    throw new AdminApiError(
      error instanceof Error
        ? `Could not reach API at ${ADMIN_API_BASE_URL}. ${error.message}`
        : `Could not reach API at ${ADMIN_API_BASE_URL}.`,
      0,
    );
  }

  let payload: any = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok || payload?.success === false) {
    if (response.status === 401) emit("admin:unauthorized");
    if (response.status === 403) emit("admin:forbidden");
    throw new AdminApiError(
      payload?.message || `Request failed with status ${response.status}`,
      response.status,
      payload,
    );
  }

  return payload as T;
}

function unwrap<T>(payload: any): T {
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
}

export function absoluteUploadUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${ADMIN_API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const adminApi = {
  async login(identifier: string, password: string) {
    const payload = await request<any>("/api/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ identifier, password }),
    });
    const data = unwrap<any>(payload);
    return {
      token: data?.token ?? payload?.token,
      role: data?.role ?? payload?.role,
    } as { token: string; role: AdminLevel };
  },

  async me(token?: string | null) {
    return unwrap<AdminProfile>(await request("/api/admin/me", { token }));
  },

  async permissions() {
    const data = unwrap<{ permissions?: string[] } | string[]>(
      await request("/api/admin/permissions"),
    );
    return Array.isArray(data) ? data : data?.permissions ?? [];
  },

  async dashboard() {
    return unwrap<DashboardStats>(await request("/api/admin/dashboard"));
  },

  async admins() {
    const data = unwrap<FullAdmin[] | { admins?: FullAdmin[] }>(
      await request("/api/admin/admins"),
    );
    return Array.isArray(data) ? data : data?.admins ?? [];
  },

  async createAdmin(body: { fullName: string; email: string; mobile: string; password: string }) {
    return unwrap<FullAdmin>(
      await request("/api/admin/admins", { method: "POST", body: JSON.stringify(body) }),
    );
  },

  async subAdmins(page = 1, limit = 20) {
    const data = unwrap<any>(
      await request(`/api/admin/subadmins${buildQuery({ page, limit })}`),
    );
    if (Array.isArray(data)) return { subAdmins: data, page, limit, total: data.length, totalPages: 1 };
    return {
      ...data,
      subAdmins: data?.subAdmins ?? data?.subadmins ?? data?.admins ?? [],
    } as PaginationData<{ subAdmins: SubAdmin[] }>;
  },

  async subAdmin(id: string) {
    return unwrap<SubAdmin>(await request(`/api/admin/subadmins/${id}`));
  },

  async createSubAdmin(body: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
    permissions: string[];
  }) {
    return unwrap<SubAdmin>(
      await request("/api/admin/subadmins", { method: "POST", body: JSON.stringify(body) }),
    );
  },

  async updateSubAdmin(
    id: string,
    body: { fullName?: string; permissions?: string[]; isActive?: boolean },
  ) {
    return unwrap<SubAdmin>(
      await request(`/api/admin/subadmins/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    );
  },

  async deleteSubAdmin(id: string) {
    return unwrap(await request(`/api/admin/subadmins/${id}`, { method: "DELETE" }));
  },

  async orders(params: {
    status?: string;
    search?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    return unwrap<PaginationData<{ orders: Order[] }>>(
      await request(`/api/admin/orders${buildQuery(params)}`),
    );
  },

  async order(id: string) {
    return unwrap<Order>(await request(`/api/admin/orders/${id}`));
  },

  async updateOrderStatus(id: string, status: string, note?: string) {
    return unwrap<Order>(
      await request(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...(note ? { note } : {}) }),
      }),
    );
  },

  async assignOrder(
    id: string,
    body: { serviceProviderId?: string; riderPickupId?: string; riderDeliveryId?: string },
  ) {
    const clean = Object.fromEntries(Object.entries(body).filter(([, value]) => value?.trim()));
    return unwrap<Order>(
      await request(`/api/admin/orders/${id}/assign`, {
        method: "PATCH",
        body: JSON.stringify(clean),
      }),
    );
  },

  async cancelOrder(id: string, reason?: string) {
    return unwrap<Order>(
      await request(`/api/admin/orders/${id}/cancel`, {
        method: "PATCH",
        body: JSON.stringify(reason ? { reason } : {}),
      }),
    );
  },

  async deleteOrder(id: string) {
    return unwrap(await request(`/api/admin/orders/${id}`, { method: "DELETE" }));
  },

  async riders(params: { status?: string; page?: number; limit?: number }) {
    return unwrap<PaginationData<{ riders: Rider[] }>>(
      await request(`/api/admin/riders${buildQuery(params)}`),
    );
  },

  async rider(id: string) {
    return unwrap<Rider>(await request(`/api/admin/riders/${id}`));
  },

  async verifyRider(id: string, action: "verify" | "reject", reason?: string) {
    return unwrap<Rider>(
      await request(`/api/admin/riders/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ action, ...(reason ? { reason } : {}) }),
      }),
    );
  },

  async updateRider(id: string, body: Record<string, unknown>) {
    return unwrap<Rider>(
      await request(`/api/admin/riders/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    );
  },

  async deleteRider(id: string) {
    return unwrap(await request(`/api/admin/riders/${id}`, { method: "DELETE" }));
  },

  async washers(params: { status?: string; page?: number; limit?: number }) {
    return unwrap<PaginationData<{ washers: Washer[] }>>(
      await request(`/api/admin/washers${buildQuery(params)}`),
    );
  },

  async washer(id: string) {
    return unwrap<Washer>(await request(`/api/admin/washers/${id}`));
  },

  async verifyWasher(id: string, action: "verify" | "reject", reason?: string) {
    return unwrap<Washer>(
      await request(`/api/admin/washers/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ action, ...(reason ? { reason } : {}) }),
      }),
    );
  },

  async updateWasher(id: string, body: Record<string, unknown>) {
    return unwrap<Washer>(
      await request(`/api/admin/washers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    );
  },

  async deleteWasher(id: string) {
    return unwrap(await request(`/api/admin/washers/${id}`, { method: "DELETE" }));
  },

  async customers(params: { search?: string; page?: number; limit?: number }) {
    return unwrap<PaginationData<{ customers: Customer[] }>>(
      await request(`/api/admin/customers${buildQuery(params)}`),
    );
  },

  async customer(id: string) {
    return unwrap<Customer>(await request(`/api/admin/customers/${id}`));
  },

  async updateCustomer(id: string, body: Record<string, unknown>) {
    return unwrap<Customer>(
      await request(`/api/admin/customers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    );
  },

  async deleteCustomer(id: string) {
    return unwrap(await request(`/api/admin/customers/${id}`, { method: "DELETE" }));
  },
    async complaints(params: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return unwrap<PaginationData<{ complaints: Complaint[] }>>(
      await request(
        `/api/admin/complaints${buildQuery(params)}`,
      ),
    );
  },

  async complaint(id: string) {
    return unwrap<Complaint>(
      await request(`/api/admin/complaints/${id}`),
    );
  },

  async updateComplaint(
    id: string,
    body: {
      status?: ComplaintManageStatus;
      adminRemarks?: string;
    },
  ) {
    return unwrap<Complaint>(
      await request(`/api/admin/complaints/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    );
  },
};

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  ADMIN_TOKEN_KEY,
  adminApi,
  type AdminProfile,
} from "@/lib/admin-api";

type AuthStatus = "booting" | "authenticated" | "unauthenticated";

type AdminAuthValue = {
  status: AuthStatus;
  token: string | null;
  profile: AdminProfile | null;
  login: (identifier: string, password: string) => Promise<AdminProfile>;
  logout: () => void;
  refreshProfile: () => Promise<AdminProfile | null>;
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: boolean;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("booting");
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  const clearSession = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setProfile(null);
    setStatus("unauthenticated");
  }, []);

  const refreshProfile = useCallback(async () => {
    const currentToken =
      token || (typeof window !== "undefined" ? window.localStorage.getItem(ADMIN_TOKEN_KEY) : null);
    if (!currentToken) {
      setStatus("unauthenticated");
      return null;
    }
    try {
      const me = await adminApi.me(currentToken);
      if (!me?.isActive) throw new Error("This admin account is inactive.");
      setToken(currentToken);
      setProfile(me);
      setStatus("authenticated");
      return me;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession, token]);

  useEffect(() => {
    const currentToken = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!currentToken) {
      setStatus("unauthenticated");
      return;
    }

    let cancelled = false;
    adminApi
      .me(currentToken)
      .then((me) => {
        if (cancelled) return;
        if (!me?.isActive) throw new Error("This admin account is inactive.");
        setToken(currentToken);
        setProfile(me);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  useEffect(() => {
    const onUnauthorized = () => clearSession();
    const onForbidden = () => toast.error("You don't have permission for this action.");
    window.addEventListener("admin:unauthorized", onUnauthorized);
    window.addEventListener("admin:forbidden", onForbidden);
    return () => {
      window.removeEventListener("admin:unauthorized", onUnauthorized);
      window.removeEventListener("admin:forbidden", onForbidden);
    };
  }, [clearSession]);

  const login = useCallback(async (identifier: string, password: string) => {
    const result = await adminApi.login(identifier, password);
    if (!result?.token) throw new Error("Login succeeded but no token was returned.");
    if (result.role !== "admin" && result.role !== "subadmin") {
      throw new Error("This account does not have admin access.");
    }
    window.localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
    setToken(result.token);
    const me = await adminApi.me(result.token);
    if (!me?.isActive) {
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
      throw new Error("This admin account is inactive.");
    }
    setProfile(me);
    setStatus("authenticated");
    return me;
  }, []);

  const hasPermission = useCallback(
    (permission: string) => profile?.level === "admin" || !!profile?.permissions?.includes(permission),
    [profile],
  );

  const value = useMemo<AdminAuthValue>(
    () => ({
      status,
      token,
      profile,
      login,
      logout: clearSession,
      refreshProfile,
      hasPermission,
      isSuperAdmin: profile?.level === "admin",
    }),
    [status, token, profile, login, clearSession, refreshProfile, hasPermission],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return value;
}

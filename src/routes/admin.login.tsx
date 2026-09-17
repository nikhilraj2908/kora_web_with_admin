import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/components/admin/AdminAuth";
import { getAdminDefaultRoute } from "@/lib/admin-access";
import { yearsToDays } from "date-fns";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Kora Admin Login" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { status, login } = useAdminAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") return <Navigate to="/admin" />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const me = await login(identifier.trim(), password);
      toast.success("Welcome to Kora Admin");
      await navigate({ to: getAdminDefaultRoute(me) ?? "/admin" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-coral/15 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border bg-card shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden min-h-[620px] flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-xl font-black">K</div>
            <div>
              <p className="font-display text-xl font-bold">Kora Admin</p>
              <p className="text-xs text-primary-foreground/70">Operations & access control</p>
            </div>
          </div>

          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Built for daily operations
            </div>
            <h1 className="max-w-md text-5xl font-black leading-[1.03]">Everything your laundry network needs, in one console.</h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-primary-foreground/75">
              Review KYC, manage orders, customers, service providers and team permissions without leaving the dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <ShieldCheck className="mb-3 h-5 w-5" />
              <p className="font-semibold">Permission aware</p>
              <p className="mt-1 text-xs text-primary-foreground/70">Super-admin & sub-admin access</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <LockKeyhole className="mb-3 h-5 w-5" />
              <p className="font-semibold">JWT protected</p>
              <p className="mt-1 text-xs text-primary-foreground/70">API permissions remain source of truth</p>
            </div>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-10 lg:p-12">
          <Card className="w-full border-0 bg-transparent shadow-none">
            <CardHeader className="px-0">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary lg:hidden">
                <span className="font-display text-xl font-black">K</span>
              </div>
              <CardTitle className="text-3xl">Admin sign in</CardTitle>
              <CardDescription>Use your registered email or mobile number and password.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="identifier">Email or mobile</Label>
                  <Input
                    id="identifier"
                    autoComplete="username"
                    placeholder="admin@kora.com or 9876543210"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-11"
                  />


                </div>
                <Button className="h-11 w-full" type="submit" disabled={submitting || status === "booting"}>
                  {submitting ? "Signing in..." : "Sign in to dashboard"}
                </Button>
              </form>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                The API must be running at the configured <code>VITE_API_BASE_URL</code>.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}



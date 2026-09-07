import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChurchMark } from "@/components/AppShell";
import { CHURCH, OFFICIAL_MINISTRIES } from "@/data/church";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Member Login & Sign Up — TACT Connect" },
      {
        name: "description",
        content:
          "Sign in or create your TACT Connect member account to save church events, register to attend and manage your profile.",
      },
      { property: "og:title", content: "Join TACT Connect" },
      {
        property: "og:description",
        content: "Member accounts for The Twelve Apostles Church in Trinity.",
      },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your full name").max(100),
    email: z.string().trim().email("Please enter a valid email address").max(255),
    phone: z
      .string()
      .trim()
      .min(7, "Please enter a valid phone number")
      .max(20, "Phone number is too long"),
    ministry: z.string().trim().max(80).optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72)
      .regex(/[A-Za-z]/, "Password must include a letter")
      .regex(/[0-9]/, "Password must include a number"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 pr-12 text-base"
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
        >
          {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
    </div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    ministry: "",
    password: "",
    confirmPassword: "",
  });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const email = form.email.trim();
    if (!email || !form.password) {
      setErrors({ form: "Please enter your email address and password." });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: form.password });
    setBusy(false);
    if (error) {
      setErrors({
        form:
          error.message.toLowerCase().includes("invalid")
            ? "That email address or password is not correct."
            : error.message,
      });
      return;
    }
    toast.success("Welcome back to TACT Connect");
    void navigate({ to: "/dashboard" });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone,
          ministry: parsed.data.ministry ?? "",
        },
      },
    });
    setBusy(false);
    if (error) {
      setErrors({
        form: error.message.toLowerCase().includes("already")
          ? "An account with this email already exists. Please log in instead."
          : error.message,
      });
      return;
    }
    if (data.session) {
      toast.success("Your member account is ready");
      void navigate({ to: "/dashboard" });
      return;
    }
    setPendingEmail(parsed.data.email);
    toast.success("Account created — please confirm your email address");
  }

  async function handleForgotPassword() {
    const email = form.email.trim();
    if (!email) {
      setErrors({ form: "Enter your email address first, then choose Forgot password." });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      setErrors({ form: error.message });
      return;
    }
    toast.success("Password reset link sent", { description: `Check the inbox for ${email}.` });
  }

  if (pendingEmail) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card-elegant p-8 text-center">
          <ChurchMark className="mx-auto size-16" />
          <h1 className="mt-4 text-3xl">Almost there</h1>
          <div className="gold-rule mx-auto mt-3 mb-4 max-w-24" />
          <p className="text-lg text-muted-foreground">
            We sent a confirmation link to <strong>{pendingEmail}</strong>. Open it to activate your
            member account, then come back and log in.
          </p>
          <Button
            size="lg"
            className="mt-6"
            onClick={() => {
              setPendingEmail(null);
              setMode("login");
            }}
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="card-elegant p-6 sm:p-8">
        <div className="text-center">
          <ChurchMark className="mx-auto size-16" />
          <h1 className="mt-3 text-3xl">
            {mode === "login" ? "Member Login" : "Join TACT Connect"}
          </h1>
          <div className="gold-rule mx-auto mt-3 max-w-24" />
          <p className="mt-3 text-base text-muted-foreground">{CHURCH.motto}</p>
        </div>

        <div
          role="tablist"
          aria-label="Member access"
          className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-primary-soft p-1"
        >
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setErrors({});
              }}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-full text-base font-semibold transition-colors ${
                mode === m ? "bg-primary text-primary-foreground" : "text-primary"
              }`}
            >
              {m === "login" ? <LogIn className="size-5" /> : <UserPlus className="size-5" />}
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        {errors["form"] && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-base font-semibold text-destructive"
          >
            {errors["form"]}
          </p>
        )}

        {mode === "login" ? (
          <form className="mt-6 space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-base">
                Email address
              </Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <PasswordField
              id="login-password"
              label="Password"
              value={form.password}
              onChange={set("password")}
              autoComplete="current-password"
            />
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Log in"}
            </Button>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button type="button" variant="ghost" onClick={handleForgotPassword} disabled={busy}>
                Forgot password?
              </Button>
              <Button type="button" variant="link" onClick={() => setMode("signup")}>
                Create an account
              </Button>
            </div>
          </form>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSignUp}>
            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-base">
                Full name
              </Label>
              <Input
                id="full-name"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => set("fullName")(e.target.value)}
                className="h-12 text-base"
                aria-invalid={Boolean(errors["fullName"])}
              />
              {errors["fullName"] && (
                <p className="text-sm font-semibold text-destructive">{errors["fullName"]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-base">
                Email address
              </Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                className="h-12 text-base"
                aria-invalid={Boolean(errors["email"])}
              />
              {errors["email"] && (
                <p className="text-sm font-semibold text-destructive">{errors["email"]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base">
                Phone number
              </Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                className="h-12 text-base"
                aria-invalid={Boolean(errors["phone"])}
              />
              {errors["phone"] && (
                <p className="text-sm font-semibold text-destructive">{errors["phone"]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ministry" className="text-base">
                Ministry / Department <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="ministry"
                list="ministry-options"
                value={form.ministry}
                onChange={(e) => set("ministry")(e.target.value)}
                className="h-12 text-base"
              />
              <datalist id="ministry-options">
                {OFFICIAL_MINISTRIES.map((m) => (
                  <option key={m.id} value={m.name} />
                ))}
              </datalist>
            </div>
            <PasswordField
              id="signup-password"
              label="Password"
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
              {...(errors["password"] ? { error: errors["password"] } : {})}
            />
            <PasswordField
              id="confirm-password"
              label="Confirm password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              autoComplete="new-password"
              {...(errors["confirmPassword"] ? { error: errors["confirmPassword"] } : {})}
            />
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Creating account…" : "Create my account"}
            </Button>
            <p className="text-center text-base text-muted-foreground">
              Already a member?{" "}
              <button
                type="button"
                className="font-semibold text-primary underline"
                onClick={() => setMode("login")}
              >
                Log in here
              </button>
            </p>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-base text-muted-foreground">
        <Link to="/" className="font-semibold text-primary underline">
          Continue browsing without an account
        </Link>
      </p>
    </div>
  );
}

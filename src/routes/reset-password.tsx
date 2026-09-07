import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChurchMark } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password — TACT Connect" },
      {
        name: "description",
        content: "Choose a new password for your TACT Connect member account.",
      },
      { property: "og:title", content: "Set a New Password — TACT Connect" },
      { property: "og:description", content: "Complete your password reset for TACT Connect." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setError("");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    toast.success("Your password has been updated");
    void navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto max-w-lg">
      <form onSubmit={submit} className="card-elegant space-y-5 p-6 sm:p-8">
        <div className="text-center">
          <ChurchMark className="mx-auto size-14" />
          <h1 className="mt-3 text-3xl">Set a new password</h1>
          <div className="gold-rule mx-auto mt-3 max-w-24" />
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-base font-semibold text-destructive"
          >
            {error}
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-base">
            New password
          </Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-new-password" className="text-base">
            Confirm new password
          </Label>
          <Input
            id="confirm-new-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}

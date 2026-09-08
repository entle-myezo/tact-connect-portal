import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OFFICIAL_MINISTRIES } from "@/data/church";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — TACT Connect" },
      {
        name: "description",
        content:
          "View and update your TACT Connect member details: phone number, ministry and password.",
      },
      { property: "og:title", content: "My Profile — TACT Connect" },
      { property: "og:description", content: "Manage your TACT Connect member account." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, user, role, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [phone, setPhone] = useState("");
  const [ministry, setMinistry] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setPhone(profile?.phone ?? "");
    setMinistry(profile?.ministry ?? "");
  }, [profile]);

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingDetails(true);
    const { error } = await supabase
      .from("profiles")
      .update({ phone: phone.trim() || null, ministry: ministry.trim() || null })
      .eq("id", user.id);
    setSavingDetails(false);
    if (error) {
      toast.error("Could not save your details", { description: error.message });
      return;
    }
    await refreshProfile();
    toast.success("Your details have been updated");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      // @ts-expect-error current_password is supported by Lovable Cloud auth
      current_password: currentPassword,
    });
    setSavingPassword(false);
    if (error) {
      toast.error("Could not change your password", { description: error.message });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Your password has been changed");
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("You have been logged out");
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-8">
      <PageHeader title="My Profile" subtitle="Your TACT Connect member account details." />

      <section className="card-elegant space-y-2 p-6">
        <h2 className="text-2xl">{profile?.full_name || "Member"}</h2>
        <div className="gold-rule mt-2 mb-3" />
        <p className="text-lg text-muted-foreground">{user?.email}</p>
        <p className="text-base text-muted-foreground">
          Account type: <span className="font-semibold text-foreground">{role ?? "member"}</span>
        </p>
      </section>

      <form onSubmit={saveDetails} className="card-elegant space-y-5 p-6">
        <h2 className="text-2xl">Contact details</h2>
        <div className="gold-rule mt-2 mb-2" />
        <div className="space-y-2">
          <Label htmlFor="profile-phone" className="text-base">
            Phone number
          </Label>
          <Input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-ministry" className="text-base">
            Ministry / Department
          </Label>
          <Input
            id="profile-ministry"
            list="profile-ministry-options"
            value={ministry}
            onChange={(e) => setMinistry(e.target.value)}
            className="h-12 text-base"
          />
          <datalist id="profile-ministry-options">
            {OFFICIAL_MINISTRIES.map((m) => (
              <option key={m.id} value={m.name} />
            ))}
          </datalist>
        </div>
        <Button type="submit" size="lg" disabled={savingDetails}>
          {savingDetails ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <form onSubmit={changePassword} className="card-elegant space-y-5 p-6">
        <h2 className="text-2xl">Change password</h2>
        <div className="gold-rule mt-2 mb-2" />
        <div className="space-y-2">
          <Label htmlFor="current-password" className="text-base">
            Current password
          </Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-new-password" className="text-base">
            New password
          </Label>
          <Input
            id="profile-new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-confirm-password" className="text-base">
            Confirm new password
          </Label>
          <Input
            id="profile-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <Button type="submit" size="lg" disabled={savingPassword}>
          {savingPassword ? "Updating…" : "Change password"}
        </Button>
      </form>

      <section className="card-elegant p-6">
        <h2 className="text-2xl">Log out</h2>
        <div className="gold-rule mt-2 mb-4" />
        <Button variant="outline" size="lg" onClick={signOut}>
          <LogOut className="size-5" aria-hidden="true" /> Log out of TACT Connect
        </Button>
      </section>
    </div>
  );
}

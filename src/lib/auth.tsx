import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface MemberProfile {
  id: string;
  full_name: string;
  phone: string | null;
  ministry: string | null;
}

export type MemberRole = "admin" | "member";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: MemberProfile | null;
  role: MemberRole | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [role, setRole] = useState<MemberRole | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = session?.user.id ?? null;

  const loadMember = useCallback(async (id: string) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, ministry").eq("id", id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", id),
    ]);
    setProfile((p as MemberProfile | null) ?? null);
    const roles = (r ?? []).map((x) => x.role as MemberRole);
    setRole(roles.includes("admin") ? "admin" : roles.length ? "member" : null);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        setProfile(null);
        setRole(null);
      }
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    void loadMember(userId);
  }, [userId, loadMember]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      loading,
      refreshProfile: async () => {
        if (userId) await loadMember(userId);
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setRole(null);
      },
    }),
    [session, profile, role, loading, userId, loadMember],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** Friendly first name for greetings. */
export function firstName(profile: MemberProfile | null, fallback = "Member"): string {
  const name = profile?.full_name?.trim();
  if (!name) return fallback;
  return name.split(/\s+/)[0] ?? fallback;
}

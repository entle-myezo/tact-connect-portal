import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  OFFICIAL_ANNOUNCEMENTS,
  OFFICIAL_EVENTS,
  OFFICIAL_MINISTRIES,
  type Announcement,
  type ChurchEvent,
  type Ministry,
} from "@/data/church";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";


export interface Reminder {
  id: string;
  eventId: string;
  daysBefore: number;
  createdAt: string;
}

interface StoreState {
  events: ChurchEvent[];
  announcements: Announcement[];
  ministries: Ministry[];
  saved: string[];
  reminders: Reminder[];
  isAdmin: boolean;
}

const STORAGE_KEY = "tact-connect-v1";

const initialState: StoreState = {
  events: OFFICIAL_EVENTS,
  announcements: OFFICIAL_ANNOUNCEMENTS,
  ministries: OFFICIAL_MINISTRIES,
  saved: [],
  reminders: [],
  isAdmin: false,
};

interface StoreContextValue extends StoreState {
  hydrated: boolean;
  signedIn: boolean;
  registrations: string[];
  isRegistered: (eventId: string) => boolean;
  registerForEvent: (eventId: string) => Promise<"registered" | "duplicate" | "signed-out">;
  cancelRegistration: (eventId: string) => Promise<void>;
  toggleSaved: (eventId: string) => boolean;
  isSaved: (eventId: string) => boolean;
  removeSaved: (eventId: string) => void;
  addReminder: (eventId: string, daysBefore: number) => void;
  removeReminder: (id: string) => void;
  remindersFor: (eventId: string) => Reminder[];
  setIsAdmin: (value: boolean) => void;
  saveEvent: (event: ChurchEvent) => void;
  deleteEvent: (id: string) => void;
  saveAnnouncement: (a: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  saveMinistry: (m: Ministry) => void;
  deleteMinistry: (id: string) => void;
  resetToOfficial: () => void;
}


const StoreContext = createContext<StoreContextValue | null>(null);

function mergeEvents(stored: ChurchEvent[] | undefined): ChurchEvent[] {
  if (!stored?.length) return OFFICIAL_EVENTS;
  return stored;
}

export function ChurchStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoreState>;
        setState({
          events: mergeEvents(parsed.events),
          announcements: parsed.announcements ?? OFFICIAL_ANNOUNCEMENTS,
          ministries: parsed.ministries ?? OFFICIAL_MINISTRIES,
          saved: parsed.saved ?? [],
          reminders: parsed.reminders ?? [],
          isAdmin: parsed.isAdmin ?? false,
        });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable */
    }
  }, [state, hydrated]);

  // ---- Member account sync (saved events + registrations) ----
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = userId;
  const [registrations, setRegistrations] = useState<string[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (!userId) {
      setRegistrations([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const localSaved = state.saved;
      if (localSaved.length) {
        await supabase
          .from("saved_events")
          .upsert(
            localSaved.map((event_id) => ({ user_id: userId, event_id })),
            { onConflict: "user_id,event_id", ignoreDuplicates: true },
          );
      }
      const [{ data: savedRows }, { data: regRows }] = await Promise.all([
        supabase.from("saved_events").select("event_id").eq("user_id", userId),
        supabase.from("event_registrations").select("event_id").eq("user_id", userId),
      ]);
      if (cancelled) return;
      if (savedRows) {
        const ids = savedRows.map((r) => r.event_id);
        setState((s) => ({ ...s, saved: Array.from(new Set([...ids, ...s.saved])) }));
      }
      setRegistrations((regRows ?? []).map((r) => r.event_id));
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally runs on sign-in / sign-out only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, hydrated]);

  const stamp = () => new Date().toISOString();

  const value = useMemo<StoreContextValue>(() => {
    const isSaved = (eventId: string) => state.saved.includes(eventId);
    const syncSaved = (eventId: string, next: boolean) => {
      const uid = userIdRef.current;
      if (!uid) return;
      if (next) {
        void supabase
          .from("saved_events")
          .upsert({ user_id: uid, event_id: eventId }, { onConflict: "user_id,event_id" });
      } else {
        void supabase.from("saved_events").delete().eq("user_id", uid).eq("event_id", eventId);
      }
    };
    return {
      ...state,
      hydrated,
      isSaved,
      signedIn: Boolean(userId),
      registrations,
      isRegistered: (eventId: string) => registrations.includes(eventId),
      registerForEvent: async (eventId: string) => {
        const uid = userIdRef.current;
        if (!uid) return "signed-out";
        if (registrations.includes(eventId)) return "duplicate";
        const { error } = await supabase
          .from("event_registrations")
          .insert({ user_id: uid, event_id: eventId });
        if (error && !error.message.includes("duplicate")) throw error;
        setRegistrations((r) => (r.includes(eventId) ? r : [...r, eventId]));
        return error ? "duplicate" : "registered";
      },
      cancelRegistration: async (eventId: string) => {
        const uid = userIdRef.current;
        if (!uid) return;
        await supabase
          .from("event_registrations")
          .delete()
          .eq("user_id", uid)
          .eq("event_id", eventId);
        setRegistrations((r) => r.filter((id) => id !== eventId));
      },
      toggleSaved: (eventId: string) => {
        const next = !isSaved(eventId);
        setState((s) => ({
          ...s,
          saved: next ? [...s.saved, eventId] : s.saved.filter((id) => id !== eventId),
        }));
        syncSaved(eventId, next);
        return next;
      },
      removeSaved: (eventId: string) => {
        setState((s) => ({ ...s, saved: s.saved.filter((id) => id !== eventId) }));
        syncSaved(eventId, false);
      },

      addReminder: (eventId: string, daysBefore: number) =>
        setState((s) => ({
          ...s,
          reminders: [
            ...s.reminders.filter((r) => !(r.eventId === eventId && r.daysBefore === daysBefore)),
            {
              id: `${eventId}-${daysBefore}`,
              eventId,
              daysBefore,
              createdAt: stamp(),
            },
          ],
        })),
      removeReminder: (id: string) =>
        setState((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) })),
      remindersFor: (eventId: string) => state.reminders.filter((r) => r.eventId === eventId),
      setIsAdmin: (v: boolean) => setState((s) => ({ ...s, isAdmin: v })),
      saveEvent: (event: ChurchEvent) =>
        setState((s) => {
          const exists = s.events.some((e) => e.id === event.id);
          const updated = { ...event, updatedAt: stamp() };
          return {
            ...s,
            events: exists
              ? s.events.map((e) => (e.id === event.id ? updated : e))
              : [...s.events, { ...updated, createdAt: stamp() }],
          };
        }),
      deleteEvent: (id: string) =>
        setState((s) => ({
          ...s,
          events: s.events.filter((e) => e.id !== id),
          saved: s.saved.filter((x) => x !== id),
          reminders: s.reminders.filter((r) => r.eventId !== id),
        })),
      saveAnnouncement: (a: Announcement) =>
        setState((s) => ({
          ...s,
          announcements: s.announcements.some((x) => x.id === a.id)
            ? s.announcements.map((x) => (x.id === a.id ? a : x))
            : [a, ...s.announcements],
        })),
      deleteAnnouncement: (id: string) =>
        setState((s) => ({ ...s, announcements: s.announcements.filter((a) => a.id !== id) })),
      saveMinistry: (m: Ministry) =>
        setState((s) => ({
          ...s,
          ministries: s.ministries.some((x) => x.id === m.id)
            ? s.ministries.map((x) => (x.id === m.id ? m : x))
            : [...s.ministries, m],
        })),
      deleteMinistry: (id: string) =>
        setState((s) => ({ ...s, ministries: s.ministries.filter((m) => m.id !== id) })),
      resetToOfficial: () =>
        setState((s) => ({
          ...s,
          events: OFFICIAL_EVENTS,
          announcements: OFFICIAL_ANNOUNCEMENTS,
          ministries: OFFICIAL_MINISTRIES,
        })),
    };
  }, [state, hydrated, userId, registrations]);


  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useChurchStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useChurchStore must be used inside ChurchStoreProvider");
  return ctx;
}

/** Events visible to members (published only), plus admin-aware helper. */
export function usePublishedEvents(): ChurchEvent[] {
  const { events } = useChurchStore();
  return useMemo(() => events.filter((e) => e.published), [events]);
}

export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  const tick = useCallback(() => setNow(new Date()), []);
  useEffect(() => {
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, tick]);
  return now;
}

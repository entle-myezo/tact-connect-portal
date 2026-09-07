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

  const stamp = () => new Date().toISOString();

  const value = useMemo<StoreContextValue>(() => {
    const isSaved = (eventId: string) => state.saved.includes(eventId);
    return {
      ...state,
      hydrated,
      isSaved,
      toggleSaved: (eventId: string) => {
        const next = !isSaved(eventId);
        setState((s) => ({
          ...s,
          saved: next ? [...s.saved, eventId] : s.saved.filter((id) => id !== eventId),
        }));
        return next;
      },
      removeSaved: (eventId: string) =>
        setState((s) => ({ ...s, saved: s.saved.filter((id) => id !== eventId) })),
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
  }, [state, hydrated]);

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

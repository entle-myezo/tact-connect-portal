import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Home,
  CalendarDays,
  CalendarRange,
  Star,
  Users,
  Megaphone,
  Bookmark,
  Info,
  ShieldCheck,
  Search,
  Menu,
  X,
} from "lucide-react";
import logo from "@/assets/tact-logo.png.asset.json";
import { CHURCH } from "@/data/church";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChurchStore } from "@/lib/church-store";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/calendar", label: "Calendar", icon: CalendarRange },
  { to: "/important-dates", label: "Important Dates", icon: Star },
  { to: "/ministries", label: "Ministries", icon: Users },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/my-events", label: "My Events", icon: Bookmark },
  { to: "/about", label: "About Church", icon: Info },
] as const;

const MOBILE_NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/calendar", label: "Calendar", icon: CalendarRange },
  { to: "/my-events", label: "Saved", icon: Bookmark },
] as const;

export function ChurchMark({ className }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="Crest of The Twelve Apostles Church in Trinity"
      className={cn("size-12 object-contain", className)}
    />
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { isAdmin } = useChurchStore();
  return (
    <nav aria-label="Main" className="space-y-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-sidebar-accent"
          activeOptions={{ exact: to === "/" }}
          activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
        >
          <Icon className="size-5 shrink-0" aria-hidden="true" />
          {label}
        </Link>
      ))}
      {isAdmin && (
        <>
          <p className="px-4 pt-5 pb-2 text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
            Administration
          </p>
          <Link
            to="/admin"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-sidebar-accent"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            <ShieldCheck className="size-5 shrink-0" aria-hidden="true" />
            Admin Dashboard
          </Link>
        </>
      )}
    </nav>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="TACT Connect home">
      <ChurchMark className={compact ? "size-10" : "size-14"} />
      <span className="min-w-0">
        <span className="block font-display text-xl leading-tight font-bold text-primary">
          TACT Connect
        </span>
        <span className="block truncate text-xs font-semibold tracking-wide text-muted-foreground">
          {compact ? CHURCH.motto : CHURCH.name}
        </span>
      </span>
    </Link>
  );
}

function GlobalSearch({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/search", search: { q } });
      }}
    >
      <label htmlFor="global-search" className="sr-only">
        Search events, ministries, venues and announcements
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id="global-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search events, dates, venues…"
        className="h-12 rounded-full pl-12 text-base"
      />
    </form>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-veil">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-sidebar-border bg-sidebar p-5 lg:flex">
        <Brand />
        <div className="mt-7 flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <p className="mt-4 rounded-xl bg-primary-soft p-4 text-center font-display text-lg font-semibold text-primary">
          {CHURCH.motto}
        </p>
      </aside>

      {/* Mobile / tablet header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Button
          variant="outline"
          size="icon"
          className="size-12 shrink-0"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Menu className="size-6" /> : <Menu className="size-6" />}
        </Button>
        <Brand compact />
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-sidebar p-5 shadow-[var(--shadow-lift)]">
            <div className="flex items-center justify-between gap-2">
              <Brand compact />
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="size-6" />
              </Button>
            </div>
            <div className="mt-6">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <div className="hidden items-center justify-between gap-6 border-b border-border bg-background/80 px-8 py-4 backdrop-blur lg:flex">
          <GlobalSearch className="w-full max-w-xl" />
          <p className="shrink-0 text-sm font-semibold text-muted-foreground">{CHURCH.reach}</p>
        </div>

        <div className="px-4 pt-4 lg:hidden">
          <GlobalSearch />
        </div>

        <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pb-16">
          {children}
        </main>

        <footer className="border-t border-border bg-background px-4 py-8 pb-28 text-center lg:pb-8">
          <ChurchMark className="mx-auto size-14" />
          <p className="mt-3 font-display text-xl font-semibold text-primary">{CHURCH.name}</p>
          <p className="text-sm font-semibold text-muted-foreground">{CHURCH.reach}</p>
          <p className="mt-2 font-display text-lg text-gold-foreground">{CHURCH.motto}</p>
        </footer>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-border bg-background/98 px-2 py-2 backdrop-blur lg:hidden"
      >
        {MOBILE_NAV.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-semibold",
                active ? "bg-primary-soft text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-6" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-semibold text-muted-foreground"
          aria-label="Open full menu"
        >
          <Menu className="size-6" aria-hidden="true" />
          More
        </button>
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8">
      <h1 className="text-4xl text-foreground sm:text-5xl">{title}</h1>
      <div className="gold-rule mt-3" />
      {subtitle && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>}
      {children}
    </header>
  );
}

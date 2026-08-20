import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  MapPin,
  ArrowRight,
  Star,
  Megaphone,
  BellPlus,
  Phone,
  CalendarRange,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChurchMark } from "@/components/AppShell";
import { EventCard } from "@/components/EventCard";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";
import { ReminderDialog } from "@/components/ReminderDialog";
import { CHURCH } from "@/data/church";
import { useChurchStore, useNow } from "@/lib/church-store";
import { countdownTo, startOf, upcoming, venueDisplay } from "@/lib/event-utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TACT Connect — Twelve Apostles Church in Trinity Events 2026" },
      {
        name: "description",
        content:
          "Home of TACT Connect: next upcoming church event, the 2026 diary, important dates and announcements for The Twelve Apostles Church in Trinity.",
      },
      { property: "og:title", content: "TACT Connect — Church Events 2026" },
      {
        property: "og:description",
        content:
          "One for all, all for Christ. View the official 2026 Diary of Events, important dates and announcements.",
      },
    ],
  }),
  component: HomePage,
});

function Countdown({ target }: { target: Date }) {
  const now = useNow();
  const c = countdownTo(target, now);
  const parts = [
    { value: c.days, label: "Days" },
    { value: c.hours, label: "Hours" },
    { value: c.minutes, label: "Min" },
    { value: c.seconds, label: "Sec" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 sm:max-w-md">
      {parts.map((p) => (
        <div
          key={p.label}
          className="rounded-2xl bg-primary-foreground/12 px-2 py-3 text-center backdrop-blur"
        >
          <p className="font-display text-3xl font-bold text-primary-foreground">
            {String(p.value).padStart(2, "0")}
          </p>
          <p className="text-xs font-semibold tracking-wide text-primary-foreground/75 uppercase">
            {p.label}
          </p>
        </div>
      ))}
    </div>
  );
}

const QUICK_ACTIONS = [
  { to: "/calendar", label: "View Calendar", icon: CalendarRange },
  { to: "/events", label: "Upcoming Events", icon: CalendarDays },
  { to: "/important-dates", label: "Important Dates", icon: Star },
  { to: "/my-events", label: "Set Reminder", icon: BellPlus },
  { to: "/about", label: "Contact Church", icon: Phone },
] as const;

function HomePage() {
  const { events, announcements, hydrated } = useChurchStore();
  const upcomingAll = upcoming(events.filter((e) => e.published));
  const next = upcomingAll.find((e) => !e.isImportantDate) ?? upcomingAll[0];
  const nextEvents = upcomingAll.filter((e) => !e.isImportantDate && e.id !== next?.id).slice(0, 6);
  const nextImportant = upcomingAll.filter((e) => e.isImportantDate).slice(0, 4);
  const liveAnnouncements = announcements.filter((a) => a.published).slice(0, 3);

  return (
    <div className="space-y-14">
      <section className="overflow-hidden rounded-[2rem] bg-royal text-primary-foreground shadow-[var(--shadow-lift)]">
        <div className="relative p-6 sm:p-10">
          <div
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-gold/25 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="rounded-full bg-primary-foreground/10 p-3">
                <ChurchMark className="size-16" />
              </span>
              <h1 className="text-4xl text-primary-foreground sm:text-5xl">{CHURCH.name}</h1>
              <p className="text-base font-semibold tracking-[0.18em] text-primary-foreground/80 uppercase">
                {CHURCH.reach}
              </p>
              <p className="font-display text-2xl font-semibold text-gold sm:text-3xl">
                {CHURCH.motto}
              </p>
            </div>

            {next && (
              <div className="rounded-[1.75rem] border border-primary-foreground/15 bg-primary-foreground/8 p-6 backdrop-blur">
                <p className="text-sm font-bold tracking-[0.18em] text-gold uppercase">
                  Next Upcoming Event
                </p>
                <h2 className="mt-2 text-3xl text-primary-foreground sm:text-4xl">{next.title}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-lg">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-5 text-gold" aria-hidden="true" />
                    {next.dateDisplay}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-5 text-gold" aria-hidden="true" />
                    {venueDisplay(next.venue)}
                  </span>
                  <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-sm font-semibold">
                    {next.category}
                  </span>
                </div>

                <div className="mt-5">
                  <Countdown target={startOf(next)} />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="lg" variant="secondary">
                    <Link to="/events/$eventId" params={{ eventId: next.id }}>
                      View Details <ArrowRight className="size-5" aria-hidden="true" />
                    </Link>
                  </Button>
                  <ReminderDialog
                    event={next}
                    trigger={
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                      >
                        <BellPlus className="size-5" aria-hidden="true" /> Add Reminder
                      </Button>
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="text-3xl">
          Quick Actions
        </h2>
        <div className="gold-rule mt-3 mb-5" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
            <Button
              key={label}
              asChild
              variant="outline"
              className="h-auto flex-col gap-2 rounded-2xl py-6 text-base font-semibold whitespace-normal"
            >
              <Link to={to}>
                <Icon className="size-7 text-primary" aria-hidden="true" />
                {label}
              </Link>
            </Button>
          ))}
        </div>
      </section>

      <section aria-labelledby="upcoming-events">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="upcoming-events" className="text-3xl">
              Upcoming Events
            </h2>
            <div className="gold-rule mt-3" />
          </div>
          <Button asChild variant="ghost" size="lg">
            <Link to="/events">
              All events <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        {nextEvents.length ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {nextEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <p className="card-elegant mt-5 p-8 text-center text-lg text-muted-foreground">
            All events on the 2026 diary have taken place. Please check back for the next diary.
          </p>
        )}
      </section>

      <section aria-labelledby="important-dates" className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 id="important-dates" className="text-3xl">
            Important Dates
          </h2>
          <div className="gold-rule mt-3 mb-5" />
          <div className="space-y-3">
            {nextImportant.length ? (
              nextImportant.map((e) => (
                <Link
                  key={e.id}
                  to="/events/$eventId"
                  params={{ eventId: e.id }}
                  className="card-elegant flex items-start gap-4 p-5 hover:shadow-[var(--shadow-lift)]"
                >
                  <Star className="mt-1 size-6 shrink-0 text-gold" aria-hidden="true" />
                  <span>
                    <span className="block text-xl font-semibold">{e.title}</span>
                    <span className="block text-base text-muted-foreground">
                      {e.dateDisplay} · {venueDisplay(e.venue)}
                    </span>
                  </span>
                </Link>
              ))
            ) : (
              <p className="card-elegant p-6 text-muted-foreground">
                No upcoming important dates remain on the 2026 list.
              </p>
            )}
          </div>
          <Button asChild variant="ghost" size="lg" className="mt-3">
            <Link to="/important-dates">
              All important dates <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div>
          <h2 className="text-3xl">Announcements</h2>
          <div className="gold-rule mt-3 mb-5" />
          <div className="space-y-3">
            {liveAnnouncements.length ? (
              liveAnnouncements.map((a) => (
                <article key={a.id} className="card-elegant p-5">
                  <div className="flex items-center gap-3">
                    <Megaphone className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <h3 className="text-xl font-semibold">{a.title}</h3>
                  </div>
                  <p className="mt-2 text-base text-muted-foreground">{a.message}</p>
                  <p className="mt-3 text-sm font-semibold text-muted-foreground">
                    {new Date(`${a.date}T00:00:00`).toLocaleDateString("en-ZA", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </article>
              ))
            ) : (
              <p className="card-elegant p-6 text-muted-foreground">
                There are no published announcements at this time.
              </p>
            )}
          </div>
          <Button asChild variant="ghost" size="lg" className="mt-3">
            <Link to="/announcements">
              All announcements <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      {hydrated && (
        <section className="card-elegant flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <Bookmark className="size-6 text-primary" aria-hidden="true" />
            <div>
              <p className="text-xl font-semibold">Keep your own diary</p>
              <p className="text-base text-muted-foreground">
                Save the events you plan to attend and set reminders.
              </p>
            </div>
          </div>
          <Button asChild size="lg">
            <Link to="/my-events">Go to My Events</Link>
          </Button>
        </section>
      )}

      <p className="sr-only">
        <StatusBadge status="confirmed" />
        <CategoryBadge category="Church-wide" />
      </p>
    </div>
  );
}

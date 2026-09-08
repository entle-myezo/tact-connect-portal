import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, CalendarDays, Megaphone, Star, TicketCheck, UserRound } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { CHURCH } from "@/data/church";
import { firstName, useAuth } from "@/lib/auth";
import { useChurchStore } from "@/lib/church-store";
import { byDate, upcoming, venueDisplay } from "@/lib/event-utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Member Dashboard — TACT Connect" },
      {
        name: "description",
        content:
          "Your personal TACT Connect dashboard: upcoming church events, saved events, registrations, announcements and important dates.",
      },
      { property: "og:title", content: "Member Dashboard — TACT Connect" },
      {
        property: "og:description",
        content: "Everything on your church diary in one place.",
      },
    ],
  }),
  component: DashboardPage,
});

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Bookmark;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-3 text-3xl">
        <Icon className="size-7 text-primary" aria-hidden="true" />
        {title}
      </h2>
      <div className="gold-rule mt-3 mb-5" />
      {children}
    </section>
  );
}

function DashboardPage() {
  const { profile } = useAuth();
  const { events, announcements, saved, registrations } = useChurchStore();

  const next = upcoming(events).slice(0, 3);
  const savedEvents = events.filter((e) => saved.includes(e.id)).sort(byDate);
  const registeredEvents = events.filter((e) => registrations.includes(e.id)).sort(byDate);
  const importantDates = upcoming(events)
    .filter((e) => e.isImportantDate)
    .slice(0, 5);
  const notices = announcements.filter((a) => a.published).slice(0, 3);

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Welcome, ${firstName(profile)}`}
        subtitle={`${CHURCH.motto} — here is your church diary at a glance.`}
      >
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/events">Browse events</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/profile">
              <UserRound className="size-5" aria-hidden="true" /> My profile
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Section title="Upcoming events" icon={CalendarDays}>
        {next.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {next.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <p className="card-elegant p-6 text-lg text-muted-foreground">
            No upcoming events on the diary right now.
          </p>
        )}
      </Section>

      <Section title="My registered events" icon={TicketCheck}>
        {registeredEvents.length ? (
          <ul className="space-y-3">
            {registeredEvents.map((e) => (
              <li key={e.id} className="card-elegant flex flex-wrap items-center gap-3 p-5">
                <Link
                  to="/events/$eventId"
                  params={{ eventId: e.id }}
                  className="flex-1 text-xl font-semibold hover:underline"
                >
                  {e.title}
                </Link>
                <span className="text-base text-muted-foreground">
                  {e.dateDisplay} · {venueDisplay(e.venue)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card-elegant p-6 text-lg text-muted-foreground">
            You have not registered for any events yet. Open an event and choose “Register for
            event”.
          </p>
        )}
      </Section>

      <Section title="My saved events" icon={Bookmark}>
        {savedEvents.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {savedEvents.slice(0, 3).map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <p className="card-elegant p-6 text-lg text-muted-foreground">
            Nothing saved yet — tap “Save” on any event.
          </p>
        )}
        {savedEvents.length > 3 && (
          <Button asChild variant="outline" size="lg" className="mt-4">
            <Link to="/my-events">See all saved events</Link>
          </Button>
        )}
      </Section>

      <Section title="Recent announcements" icon={Megaphone}>
        {notices.length ? (
          <ul className="space-y-3">
            {notices.map((a) => (
              <li key={a.id} className="card-elegant p-5">
                <h3 className="text-xl font-semibold">{a.title}</h3>
                <p className="mt-1 text-base text-muted-foreground">{a.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card-elegant p-6 text-lg text-muted-foreground">No announcements yet.</p>
        )}
        <Button asChild variant="outline" size="lg" className="mt-4">
          <Link to="/announcements">All announcements</Link>
        </Button>
      </Section>

      <Section title="Important upcoming dates" icon={Star}>
        {importantDates.length ? (
          <ul className="space-y-3">
            {importantDates.map((e) => (
              <li
                key={e.id}
                className="card-elegant flex flex-wrap items-center justify-between gap-3 p-5"
              >
                <Link
                  to="/events/$eventId"
                  params={{ eventId: e.id }}
                  className="text-xl font-semibold hover:underline"
                >
                  {e.title}
                </Link>
                <span className="text-base text-muted-foreground">{e.dateDisplay}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card-elegant p-6 text-lg text-muted-foreground">
            No important dates coming up.
          </p>
        )}
      </Section>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, Bookmark } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { useChurchStore } from "@/lib/church-store";
import { byDate } from "@/lib/event-utils";

export const Route = createFileRoute("/my-events")({
  head: () => ({
    meta: [
      { title: "My Events & Reminders — TACT Connect" },
      {
        name: "description",
        content:
          "Your personal church diary: saved events and reminders for the 2026 Diary of Events of The Twelve Apostles Church in Trinity.",
      },
      { property: "og:title", content: "My Events — TACT Connect" },
      {
        property: "og:description",
        content: "Keep the church events you plan to attend in one place.",
      },
    ],
  }),
  component: MyEventsPage,
});

function MyEventsPage() {
  const { events, saved, reminders, removeReminder, hydrated } = useChurchStore();
  const savedEvents = events.filter((e) => saved.includes(e.id)).sort(byDate);

  return (
    <div className="space-y-10">
      <PageHeader
        title="My Events"
        subtitle="The events you have saved and the reminders you have set."
      />

      {!hydrated ? (
        <p className="card-elegant p-8 text-center text-lg text-muted-foreground">Loading…</p>
      ) : (
        <>
          <section>
            <h2 className="text-3xl">Saved events</h2>
            <div className="gold-rule mt-3 mb-5" />
            {savedEvents.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {savedEvents.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            ) : (
              <div className="card-elegant p-8 text-center">
                <Bookmark className="mx-auto size-8 text-primary" aria-hidden="true" />
                <p className="mt-3 text-lg text-muted-foreground">
                  You have not saved any events yet.
                </p>
                <Button asChild size="lg" className="mt-5">
                  <Link to="/events">Browse events</Link>
                </Button>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-3xl">Reminders</h2>
            <div className="gold-rule mt-3 mb-5" />
            {reminders.length ? (
              <ul className="space-y-3">
                {reminders.map((r) => {
                  const event = events.find((e) => e.id === r.eventId);
                  if (!event) return null;
                  return (
                    <li
                      key={r.id}
                      className="card-elegant flex flex-wrap items-center justify-between gap-3 p-5"
                    >
                      <span className="flex items-start gap-3">
                        <BellRing className="mt-1 size-5 text-primary" aria-hidden="true" />
                        <span>
                          <Link
                            to="/events/$eventId"
                            params={{ eventId: event.id }}
                            className="block text-xl font-semibold hover:underline"
                          >
                            {event.title}
                          </Link>
                          <span className="block text-base text-muted-foreground">
                            {r.daysBefore === 0
                              ? "On the day"
                              : `${r.daysBefore} days before`}{" "}
                            · {event.dateDisplay}
                          </span>
                        </span>
                      </span>
                      <Button variant="outline" onClick={() => removeReminder(r.id)}>
                        Remove
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="card-elegant p-8 text-center text-lg text-muted-foreground">
                You have no reminders set.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

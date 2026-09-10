import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  MapPin,
  Ticket,
  TicketCheck,
  Users,
} from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";
import { ReminderDialog } from "@/components/ReminderDialog";
import { useChurchStore } from "@/lib/church-store";
import { venueDisplay } from "@/lib/event-utils";
import { CHURCH } from "@/data/church";

export const Route = createFileRoute("/events/$eventId")({
  head: () => ({
    meta: [
      { title: "Event Details — TACT Connect" },
      {
        name: "description",
        content:
          "Full details of an event on the 2026 Diary of Events of The Twelve Apostles Church in Trinity: date, venue, category and reminders.",
      },
      { property: "og:title", content: "Event Details — TACT Connect" },
      {
        property: "og:description",
        content: "Date, venue and reminder options for this church event.",
      },
    ],
  }),
  component: EventDetailPage,
});

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const { events, isSaved, toggleSaved, hydrated, remindersFor, removeReminder } =
    useChurchStore();
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div className="card-elegant p-10 text-center">
        <h1 className="text-3xl">Event not found</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          This event is not on the 2026 Diary of Events.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/events">Back to all events</Link>
        </Button>
      </div>
    );
  }

  const saved = hydrated && isSaved(event.id);
  const reminders = hydrated ? remindersFor(event.id) : [];

  return (
    <article className="space-y-8">
      <Button asChild variant="ghost" size="lg">
        <Link to="/events">
          <ArrowLeft className="size-5" aria-hidden="true" /> All events
        </Link>
      </Button>

      <header className="rounded-[2rem] bg-royal p-6 text-primary-foreground shadow-[var(--shadow-lift)] sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={event.category} />
          <StatusBadge status={event.status} />
        </div>
        <h1 className="mt-4 text-4xl text-primary-foreground sm:text-5xl">{event.title}</h1>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-lg">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-5 text-gold" aria-hidden="true" /> {event.dateDisplay}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-5 text-gold" aria-hidden="true" /> {venueDisplay(event.venue)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="size-5 text-gold" aria-hidden="true" /> {event.category}
          </span>
        </div>
      </header>

      <section className="card-elegant p-6">
        <h2 className="text-2xl">About this event</h2>
        <div className="gold-rule mt-3 mb-4" />
        <p className="text-lg text-muted-foreground">{event.description}</p>
        <p className="mt-4 text-base text-muted-foreground">{CHURCH.documentNote}</p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button
          size="lg"
          variant={saved ? "secondary" : "default"}
          onClick={() => {
            const next = toggleSaved(event.id);
            toast.success(next ? "Added to My Events" : "Removed from My Events", {
              description: event.title,
            });
          }}
        >
          {saved ? (
            <>
              <BookmarkCheck className="size-5" aria-hidden="true" /> Saved
            </>
          ) : (
            <>
              <Bookmark className="size-5" aria-hidden="true" /> Save event
            </>
          )}
        </Button>
        <ReminderDialog event={event} />
        {registered ? (
          <Button
            size="lg"
            variant="outline"
            onClick={async () => {
              await cancelRegistration(event.id);
              toast.success("Registration cancelled", { description: event.title });
            }}
          >
            <TicketCheck className="size-5" aria-hidden="true" /> You are registered — cancel
          </Button>
        ) : signedIn ? (
          <Button
            size="lg"
            variant="secondary"
            onClick={async () => {
              const result = await registerForEvent(event.id);
              if (result === "duplicate") {
                toast.info("You are already registered for this event");
              } else if (result === "registered") {
                toast.success("You are registered", { description: event.title });
              }
            }}
          >
            <Ticket className="size-5" aria-hidden="true" /> Register for event
          </Button>
        ) : (
          <Button asChild size="lg" variant="secondary">
            <Link to="/auth">
              <Ticket className="size-5" aria-hidden="true" /> Log in to register
            </Link>
          </Button>
        )}
      </section>


      {reminders.length > 0 && (
        <section className="card-elegant p-6">
          <h2 className="text-2xl">Your reminders</h2>
          <div className="gold-rule mt-3 mb-4" />
          <ul className="space-y-3">
            {reminders.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 text-lg">
                <span>{r.daysBefore === 0 ? "On the day" : `${r.daysBefore} days before`}</span>
                <Button variant="ghost" onClick={() => removeReminder(r.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}


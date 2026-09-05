import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useChurchStore } from "@/lib/church-store";
import { MONTHS, byDate, monthOf, venueDisplay } from "@/lib/event-utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "2026 Calendar — TACT Connect Church Diary" },
      {
        name: "description",
        content:
          "Month-by-month 2026 calendar of The Twelve Apostles Church in Trinity with every service, convention and important date.",
      },
      { property: "og:title", content: "2026 Church Calendar — TACT Connect" },
      {
        property: "og:description",
        content: "Browse the 2026 Diary of Events month by month.",
      },
    ],
  }),
  component: CalendarPage,
});

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarPage() {
  const { events } = useChurchStore();
  const [month, setMonth] = useState(0);

  const published = events.filter((e) => e.published);
  const monthEvents = published.filter((e) => monthOf(e) === month).sort(byDate);

  const first = new Date(2026, month, 1);
  const daysInMonth = new Date(2026, month + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7;
  const cells: Array<number | null> = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const iso = (day: number) =>
    `2026-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div>
      <PageHeader
        title="Church Calendar 2026"
        subtitle="Every event on the official Diary of Events, laid out month by month."
      />

      <div className="card-elegant p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-12"
            aria-label="Previous month"
            onClick={() => setMonth((m) => (m + 11) % 12)}
          >
            <ChevronLeft className="size-6" />
          </Button>
          <h2 className="font-display text-3xl font-semibold text-primary">
            {MONTHS[month]} 2026
          </h2>
          <Button
            variant="outline"
            size="icon"
            className="size-12"
            aria-label="Next month"
            onClick={() => setMonth((m) => (m + 1) % 12)}
          >
            <ChevronRight className="size-6" />
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((d) => (
            <div key={d} className="pb-2 text-sm font-bold text-muted-foreground uppercase">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const onDay = published.filter((e) => e.days.includes(iso(day)));
            return (
              <div
                key={day}
                className={`min-h-16 rounded-xl border p-1 text-left sm:min-h-24 ${
                  onDay.length ? "border-primary/30 bg-primary-soft" : "border-border"
                }`}
              >
                <span className="block px-1 text-sm font-bold text-foreground">{day}</span>
                {onDay.slice(0, 2).map((e) => (
                  <Link
                    key={e.id}
                    to="/events/$eventId"
                    params={{ eventId: e.id }}
                    className="mt-1 block truncate rounded-md bg-primary px-1 py-0.5 text-[11px] font-semibold text-primary-foreground"
                    title={e.title}
                  >
                    {e.title}
                  </Link>
                ))}
                {onDay.length > 2 && (
                  <span className="px-1 text-[11px] font-semibold text-primary">
                    +{onDay.length - 2} more
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-3xl">{MONTHS[month]} events</h2>
        <div className="gold-rule mt-3 mb-5" />
        {monthEvents.length ? (
          <ul className="space-y-3">
            {monthEvents.map((e) => (
              <li key={e.id}>
                <Link
                  to="/events/$eventId"
                  params={{ eventId: e.id }}
                  className="card-elegant flex flex-wrap items-center justify-between gap-3 p-5 hover:shadow-[var(--shadow-lift)]"
                >
                  <span>
                    <span className="block text-xl font-semibold">{e.title}</span>
                    <span className="block text-base text-muted-foreground">
                      {e.dateDisplay} · {venueDisplay(e.venue)}
                    </span>
                  </span>
                  <StatusBadge status={e.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card-elegant p-8 text-center text-lg text-muted-foreground">
            No events are listed for {MONTHS[month]} 2026.
          </p>
        )}
      </section>
    </div>
  );
}

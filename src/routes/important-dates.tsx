import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { useChurchStore } from "@/lib/church-store";
import { byDate, venueDisplay } from "@/lib/event-utils";

export const Route = createFileRoute("/important-dates")({
  head: () => ({
    meta: [
      { title: "Important Dates to Note 2026 — TACT Connect" },
      {
        name: "description",
        content:
          "The official Important Dates to Note for 2026 of The Twelve Apostles Church in Trinity, with dates and venues.",
      },
      { property: "og:title", content: "Important Dates to Note 2026" },
      {
        property: "og:description",
        content: "Key dates every member of the church should diarise for 2026.",
      },
    ],
  }),
  component: ImportantDatesPage,
});

function ImportantDatesPage() {
  const { events } = useChurchStore();
  const list = events.filter((e) => e.published && e.isImportantDate).sort(byDate);

  return (
    <div>
      <PageHeader
        title="Important Dates to Note"
        subtitle="Taken from the official 2026 diary of The Twelve Apostles Church in Trinity."
      />
      <ol className="space-y-3">
        {list.map((e) => (
          <li key={e.id}>
            <Link
              to="/events/$eventId"
              params={{ eventId: e.id }}
              className="card-elegant flex flex-wrap items-start justify-between gap-4 p-6 hover:shadow-[var(--shadow-lift)]"
            >
              <span className="flex items-start gap-4">
                <Star className="mt-1 size-6 shrink-0 text-gold" aria-hidden="true" />
                <span>
                  <span className="block text-2xl font-semibold">{e.title}</span>
                  <span className="block text-lg text-muted-foreground">{e.dateDisplay}</span>
                  <span className="block text-base text-muted-foreground">
                    {venueDisplay(e.venue)}
                  </span>
                </span>
              </span>
              <StatusBadge status={e.status} />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

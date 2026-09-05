import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { PageHeader } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { useChurchStore } from "@/lib/church-store";
import { byDate, matchesSearch, venueDisplay } from "@/lib/event-utils";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Search — TACT Connect Church Events" },
      {
        name: "description",
        content:
          "Search events, important dates, venues, ministries and announcements of The Twelve Apostles Church in Trinity.",
      },
      { property: "og:title", content: "Search — TACT Connect" },
      {
        property: "og:description",
        content: "Find any church event, venue or announcement quickly.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { events, announcements, ministries } = useChurchStore();

  const term = q.trim();
  const matchedEvents = events
    .filter((e) => e.published && matchesSearch(e, term))
    .sort(byDate);
  const lower = term.toLowerCase();
  const matchedAnnouncements = announcements.filter(
    (a) =>
      a.published &&
      (!lower || `${a.title} ${a.message}`.toLowerCase().includes(lower)),
  );
  const matchedMinistries = ministries.filter(
    (m) => !lower || `${m.name} ${m.category}`.toLowerCase().includes(lower),
  );

  return (
    <div className="space-y-10">
      <PageHeader title="Search" subtitle="Events, important dates, venues and announcements." />

      <label className="block">
        <span className="sr-only">Search</span>
        <Input
          value={q}
          onChange={(e) =>
            navigate({ to: ".", search: (prev) => ({ ...prev, q: e.target.value }) })
          }
          placeholder="Search events, dates, venues…"
          className="h-14 rounded-full px-6 text-lg"
        />
      </label>

      <section>
        <h2 className="text-3xl">Events ({matchedEvents.length})</h2>
        <div className="gold-rule mt-3 mb-5" />
        <ul className="space-y-3">
          {matchedEvents.map((e) => (
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
          {!matchedEvents.length && (
            <li className="card-elegant p-6 text-lg text-muted-foreground">No events matched.</li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-3xl">Ministries ({matchedMinistries.length})</h2>
        <div className="gold-rule mt-3 mb-5" />
        <ul className="flex flex-wrap gap-2">
          {matchedMinistries.map((m) => (
            <li
              key={m.id}
              className="rounded-full bg-primary-soft px-4 py-2 text-base font-semibold text-primary"
            >
              {m.name}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-3xl">Announcements ({matchedAnnouncements.length})</h2>
        <div className="gold-rule mt-3 mb-5" />
        <ul className="space-y-3">
          {matchedAnnouncements.map((a) => (
            <li key={a.id} className="card-elegant p-5">
              <p className="text-xl font-semibold">{a.title}</p>
              <p className="mt-2 text-base text-muted-foreground">{a.message}</p>
            </li>
          ))}
          {!matchedAnnouncements.length && (
            <li className="card-elegant p-6 text-lg text-muted-foreground">
              No announcements matched.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

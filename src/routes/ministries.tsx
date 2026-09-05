import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { CategoryBadge } from "@/components/StatusBadge";
import { useChurchStore } from "@/lib/church-store";
import { byDate, upcoming, venueDisplay } from "@/lib/event-utils";

export const Route = createFileRoute("/ministries")({
  head: () => ({
    meta: [
      { title: "Ministries & Groups — TACT Connect" },
      {
        name: "description",
        content:
          "Sisters, Brothers, Youth, Sunday School, Music, Officers and Sports ministries of The Twelve Apostles Church in Trinity and their 2026 events.",
      },
      { property: "og:title", content: "Church Ministries — TACT Connect" },
      {
        property: "og:description",
        content: "See each ministry and the 2026 events belonging to it.",
      },
    ],
  }),
  component: MinistriesPage,
});

function MinistriesPage() {
  const { ministries, events } = useChurchStore();
  const published = events.filter((e) => e.published);

  return (
    <div>
      <PageHeader
        title="Ministries & Groups"
        subtitle="Every ministry of the church and the 2026 events that belong to it."
      />
      <div className="grid gap-5 md:grid-cols-2">
        {ministries.map((m) => {
          const own = upcoming(published.filter((e) => e.category === m.category))
            .sort(byDate)
            .slice(0, 4);
          return (
            <section key={m.id} className="card-elegant p-6">
              <div className="flex items-center gap-3">
                <Users className="size-6 text-primary" aria-hidden="true" />
                <h2 className="text-2xl">{m.name}</h2>
              </div>
              <div className="mt-3">
                <CategoryBadge category={m.category} />
              </div>
              {m.description && (
                <p className="mt-3 text-base text-muted-foreground">{m.description}</p>
              )}
              <ul className="mt-4 space-y-2">
                {own.length ? (
                  own.map((e) => (
                    <li key={e.id}>
                      <Link
                        to="/events/$eventId"
                        params={{ eventId: e.id }}
                        className="block rounded-xl px-3 py-2 hover:bg-accent"
                      >
                        <span className="block text-lg font-semibold">{e.title}</span>
                        <span className="block text-base text-muted-foreground">
                          {e.dateDisplay} · {venueDisplay(e.venue)}
                        </span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="px-3 text-base text-muted-foreground">
                    No upcoming events listed for this ministry.
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

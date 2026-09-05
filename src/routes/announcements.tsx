import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { useChurchStore } from "@/lib/church-store";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — TACT Connect Church Notices" },
      {
        name: "description",
        content:
          "Official notices and announcements from Head Office of The Twelve Apostles Church in Trinity for 2026.",
      },
      { property: "og:title", content: "Church Announcements — TACT Connect" },
      {
        property: "og:description",
        content: "Read the latest notices published by the church.",
      },
    ],
  }),
  component: AnnouncementsPage,
});

const PRIORITY: Record<string, string> = {
  normal: "border-border",
  important: "border-gold",
  urgent: "border-destructive",
};

function AnnouncementsPage() {
  const { announcements } = useChurchStore();
  const list = announcements.filter((a) => a.published);

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Notices issued by Head Office of The Twelve Apostles Church in Trinity."
      />
      <div className="space-y-4">
        {list.length ? (
          list.map((a) => (
            <article key={a.id} className={`card-elegant border-l-4 p-6 ${PRIORITY[a.priority]}`}>
              <div className="flex items-center gap-3">
                <Megaphone className="size-6 shrink-0 text-primary" aria-hidden="true" />
                <h2 className="text-2xl">{a.title}</h2>
              </div>
              <p className="mt-3 text-lg text-muted-foreground">{a.message}</p>
              <p className="mt-3 text-sm font-semibold text-muted-foreground uppercase">
                {new Date(`${a.date}T00:00:00`).toLocaleDateString("en-ZA", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {a.priority}
              </p>
            </article>
          ))
        ) : (
          <p className="card-elegant p-8 text-center text-lg text-muted-foreground">
            There are no published announcements at this time.
          </p>
        )}
      </div>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";
import { useChurchStore } from "@/lib/church-store";
import { venueDisplay } from "@/lib/event-utils";
import type { ChurchEvent } from "@/data/church";

export function EventCard({ event }: { event: ChurchEvent }) {
  const { isSaved, toggleSaved, hydrated } = useChurchStore();
  const saved = hydrated && isSaved(event.id);

  return (
    <article className="card-elegant flex h-full flex-col gap-4 p-6 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={event.category} />
        <StatusBadge status={event.status} />
      </div>

      <h3 className="text-2xl text-foreground">{event.title}</h3>

      <dl className="space-y-2 text-base">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <dt className="sr-only">Date</dt>
            <dd className="font-semibold text-foreground">{event.dateDisplay}</dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <dt className="sr-only">Venue</dt>
            <dd className="text-muted-foreground">{venueDisplay(event.venue)}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <Button asChild size="lg" className="flex-1">
          <Link to="/events/$eventId" params={{ eventId: event.id }}>
            View Event
          </Link>
        </Button>
        <Button
          variant={saved ? "secondary" : "outline"}
          size="lg"
          onClick={() => {
            const next = toggleSaved(event.id);
            toast.success(next ? "Added to My Events" : "Removed from My Events", {
              description: event.title,
            });
          }}
          aria-label={saved ? `Remove ${event.title} from My Events` : `Add ${event.title} to My Events`}
        >
          {saved ? (
            <>
              <BookmarkCheck className="size-5" aria-hidden="true" /> Saved
            </>
          ) : (
            <>
              <Bookmark className="size-5" aria-hidden="true" /> Save
            </>
          )}
        </Button>
      </div>
    </article>
  );
}

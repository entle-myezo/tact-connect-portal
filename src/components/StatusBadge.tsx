import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/event-utils";
import type { EventStatus } from "@/data/church";

export function StatusBadge({
  status,
  className,
}: {
  status: EventStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold",
        meta.className,
        className,
      )}
    >
      <span className={cn("size-2.5 rounded-full", meta.dot)} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
      {category}
    </span>
  );
}

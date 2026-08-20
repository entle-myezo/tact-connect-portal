import type { ChurchEvent, EventStatus } from "@/data/church";

export const STATUS_META: Record<
  EventStatus,
  { label: string; dot: string; className: string }
> = {
  confirmed: {
    label: "Confirmed",
    dot: "bg-success",
    className: "bg-success/10 text-success border-success/25",
  },
  "venue-pending": {
    label: "Venue Pending",
    dot: "bg-warning",
    className: "bg-warning/15 text-warning-foreground border-warning/35",
  },
  "date-pending": {
    label: "Date Pending",
    dot: "bg-info",
    className: "bg-info/10 text-info border-info/25",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-destructive",
    className: "bg-destructive/10 text-destructive border-destructive/25",
  },
};

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function venueDisplay(venue: string): string {
  return /to arrange/i.test(venue) ? "To be arranged" : venue;
}

export function endDate(event: ChurchEvent): Date {
  const last = event.days.length ? event.days[event.days.length - 1]! : event.sortDate;
  return new Date(`${last}T23:59:59`);
}

export function isPast(event: ChurchEvent, now: Date = new Date()): boolean {
  return endDate(event).getTime() < now.getTime();
}

export function startOf(event: ChurchEvent): Date {
  return new Date(`${event.days[0] ?? event.sortDate}T00:00:00`);
}

export function byDate(a: ChurchEvent, b: ChurchEvent): number {
  return a.sortDate.localeCompare(b.sortDate) || a.title.localeCompare(b.title);
}

export function upcoming(events: ChurchEvent[], now: Date = new Date()): ChurchEvent[] {
  return events.filter((e) => e.published && !isPast(e, now)).sort(byDate);
}

export function pastEvents(events: ChurchEvent[], now: Date = new Date()): ChurchEvent[] {
  return events.filter((e) => e.published && isPast(e, now)).sort((a, b) => byDate(b, a));
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function countdownTo(target: Date, now: Date = new Date()): Countdown {
  const total = Math.max(0, target.getTime() - now.getTime());
  return {
    total,
    days: Math.floor(total / 86400000),
    hours: Math.floor((total / 3600000) % 24),
    minutes: Math.floor((total / 60000) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

export function monthOf(event: ChurchEvent): number {
  return new Date(`${event.sortDate}T00:00:00`).getMonth();
}

export function matchesSearch(event: ChurchEvent, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  return [event.title, event.dateDisplay, event.venue, event.category, event.description]
    .join(" ")
    .toLowerCase()
    .includes(t);
}

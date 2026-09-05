import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { PageHeader, ChurchMark } from "@/components/AppShell";
import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CATEGORIES, CHURCH } from "@/data/church";
import { useChurchStore } from "@/lib/church-store";
import { MONTHS, byDate, isPast, matchesSearch, monthOf } from "@/lib/event-utils";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events — TACT Connect 2026 Diary of Events" },
      {
        name: "description",
        content:
          "Search, filter and sort every event on the 2026 Diary of Events of The Twelve Apostles Church in Trinity.",
      },
      { property: "og:title", content: "Events — TACT Connect" },
      {
        property: "og:description",
        content: "The full 2026 church event directory with search, month and category filters.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { events, hydrated } = useChurchStore();
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("date-asc");
  const [tab, setTab] = useState("upcoming");

  const list = useMemo(() => {
    const now = new Date();
    let result = events.filter((e) => e.published && !e.isImportantDate);
    result = result.filter((e) => (tab === "upcoming" ? !isPast(e, now) : isPast(e, now)));
    if (month !== "all") result = result.filter((e) => monthOf(e) === Number(month));
    if (category !== "all") result = result.filter((e) => e.category === category);
    result = result.filter((e) => matchesSearch(e, query));
    result.sort(byDate);
    if (sort === "date-desc") result.reverse();
    if (sort === "title") result.sort((a, b) => a.title.localeCompare(b.title));
    return result;
  }, [events, tab, month, category, query, sort]);

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="The official Diary of Events 2026. Event names, dates and venues appear exactly as published by Head Office."
      />

      <div className="card-elegant mb-8 flex flex-col gap-5 p-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <ChurchMark className="size-14 shrink-0" />
          <div>
            <p className="font-display text-xl font-semibold text-primary">
              Diary of Events 2026
            </p>
            <p className="text-sm font-semibold text-muted-foreground">{CHURCH.name}</p>
          </div>
        </div>

        <div className="relative">
          <Label htmlFor="event-search" className="sr-only">
            Search events
          </Label>
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="event-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by event name, venue or category…"
            className="h-14 rounded-2xl pl-12 text-base"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="filter-month" className="mb-2 block text-base font-semibold">
              Month
            </Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger id="filter-month" className="h-12 w-full text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i)}>
                    {m} 2026
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-category" className="mb-2 block text-base font-semibold">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="filter-category" className="h-12 w-full text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-sort" className="mb-2 block text-base font-semibold">
              Sort by
            </Label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger id="filter-sort" className="h-12 w-full text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">Date (earliest first)</SelectItem>
                <SelectItem value="date-desc">Date (latest first)</SelectItem>
                <SelectItem value="title">Event name (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="h-12">
              <TabsTrigger value="upcoming" className="px-5 text-base">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="px-5 text-base">
                Past events
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => {
              setQuery("");
              setMonth("all");
              setCategory("all");
              setSort("date-asc");
            }}
          >
            <SlidersHorizontal className="size-5" aria-hidden="true" /> Clear filters
          </Button>
        </div>
      </div>

      {!hydrated ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-elegant h-64 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : list.length ? (
        <>
          <p className="mb-4 text-base font-semibold text-muted-foreground" aria-live="polite">
            Showing {list.length} {list.length === 1 ? "event" : "events"}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </>
      ) : (
        <div className="card-elegant p-10 text-center">
          <p className="text-2xl font-semibold">No events found</p>
          <p className="mt-2 text-lg text-muted-foreground">
            Try a different month, category or search term.
          </p>
        </div>
      )}
    </div>
  );
}

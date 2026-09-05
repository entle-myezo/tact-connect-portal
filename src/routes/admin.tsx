import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/StatusBadge";
import { useChurchStore } from "@/lib/church-store";
import { byDate } from "@/lib/event-utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — TACT Connect" },
      {
        name: "description",
        content:
          "Church administrator area for managing the 2026 Diary of Events, announcements and publishing of TACT Connect.",
      },
      { property: "og:title", content: "Admin Dashboard — TACT Connect" },
      {
        property: "og:description",
        content: "Manage events and announcements for the church app.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const {
    isAdmin,
    setIsAdmin,
    events,
    announcements,
    saveEvent,
    deleteEvent,
    saveAnnouncement,
    deleteAnnouncement,
    resetToOfficial,
  } = useChurchStore();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  if (!isAdmin) {
    return (
      <div className="card-elegant mx-auto max-w-md p-8 text-center">
        <ShieldCheck className="mx-auto size-10 text-primary" aria-hidden="true" />
        <h1 className="mt-4 text-3xl">Administrator access</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          This area is for church administrators managing the diary and notices.
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={() => setIsAdmin(true)}>
          Enter admin mode
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader title="Admin Dashboard" subtitle="Manage events, announcements and publishing.">
        <Button variant="outline" size="lg" className="mt-4" onClick={() => setIsAdmin(false)}>
          Exit admin mode
        </Button>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Events", value: events.length },
          { label: "Published", value: events.filter((e) => e.published).length },
          { label: "Announcements", value: announcements.length },
        ].map((s) => (
          <div key={s.label} className="card-elegant p-6 text-center">
            <p className="font-display text-4xl font-bold text-primary">{s.value}</p>
            <p className="text-base font-semibold text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-3xl">Events</h2>
        <div className="gold-rule mt-3 mb-5" />
        <ul className="space-y-3">
          {[...events].sort(byDate).map((e) => (
            <li
              key={e.id}
              className="card-elegant flex flex-wrap items-center justify-between gap-4 p-5"
            >
              <span>
                <span className="block text-xl font-semibold">{e.title}</span>
                <span className="block text-base text-muted-foreground">{e.dateDisplay}</span>
              </span>
              <span className="flex items-center gap-4">
                <StatusBadge status={e.status} />
                <span className="flex items-center gap-2">
                  <Switch
                    id={`pub-${e.id}`}
                    checked={e.published}
                    onCheckedChange={(v) => saveEvent({ ...e, published: v })}
                  />
                  <Label htmlFor={`pub-${e.id}`}>Published</Label>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${e.title}`}
                  onClick={() => {
                    deleteEvent(e.id);
                    toast.success("Event deleted", { description: e.title });
                  }}
                >
                  <Trash2 className="size-5 text-destructive" />
                </Button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-3xl">Announcements</h2>
        <div className="gold-rule mt-3 mb-5" />
        <form
          className="card-elegant space-y-4 p-6"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!title.trim() || !message.trim()) return;
            saveAnnouncement({
              id: `ann-${Date.now()}`,
              title: title.trim(),
              message: message.trim(),
              date: new Date().toISOString().slice(0, 10),
              priority: "normal",
              published: true,
            });
            setTitle("");
            setMessage("");
            toast.success("Announcement published");
          }}
        >
          <div>
            <Label htmlFor="ann-title">Title</Label>
            <Input
              id="ann-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 h-12"
            />
          </div>
          <div>
            <Label htmlFor="ann-message">Message</Label>
            <Textarea
              id="ann-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 min-h-28"
            />
          </div>
          <Button type="submit" size="lg">
            Publish announcement
          </Button>
        </form>

        <ul className="mt-4 space-y-3">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="card-elegant flex flex-wrap items-center justify-between gap-4 p-5"
            >
              <span>
                <span className="block text-xl font-semibold">{a.title}</span>
                <span className="block text-base text-muted-foreground">{a.message}</span>
              </span>
              <span className="flex items-center gap-3">
                <Switch
                  id={`ann-pub-${a.id}`}
                  checked={a.published}
                  onCheckedChange={(v) => saveAnnouncement({ ...a, published: v })}
                />
                <Label htmlFor={`ann-pub-${a.id}`}>Published</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${a.title}`}
                  onClick={() => deleteAnnouncement(a.id)}
                >
                  <Trash2 className="size-5 text-destructive" />
                </Button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          resetToOfficial();
          toast.success("Restored the official 2026 diary");
        }}
      >
        <RotateCcw className="size-5" aria-hidden="true" /> Restore official data
      </Button>
    </div>
  );
}

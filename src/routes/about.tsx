import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHeader, ChurchMark } from "@/components/AppShell";
import { CHURCH } from "@/data/church";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About The Twelve Apostles Church in Trinity — TACT Connect" },
      {
        name: "description",
        content:
          "About The Twelve Apostles Church in Trinity: motto, leadership, branches across Africa and interglobally, and Head Office contact details.",
      },
      { property: "og:title", content: "About Our Church — TACT Connect" },
      {
        property: "og:description",
        content: "One for all, all for Christ. Contact details and church branches.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="space-y-10">
      <PageHeader title="About Our Church" subtitle={CHURCH.reach} />

      <section className="card-elegant p-8 text-center">
        <ChurchMark className="mx-auto size-24" />
        <h2 className="mt-4 font-display text-3xl font-semibold text-primary">{CHURCH.name}</h2>
        <p className="mt-2 font-display text-2xl text-gold-foreground">{CHURCH.motto}</p>
        <p className="mt-4 text-lg text-muted-foreground">{CHURCH.president}</p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="card-elegant p-6">
          <h2 className="text-2xl">Contact Head Office</h2>
          <div className="gold-rule mt-3 mb-4" />
          <ul className="space-y-3 text-lg">
            <li className="flex items-start gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
              {CHURCH.postal}
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
              <a href={`tel:${CHURCH.tel.replace(/[^\d+]/g, "")}`} className="hover:underline">
                {CHURCH.tel}
              </a>
            </li>
            {CHURCH.emails.map((email) => (
              <li key={email} className="flex items-start gap-3">
                <Mail className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
                <a href={`mailto:${email}`} className="break-all hover:underline">
                  {email}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-elegant p-6">
          <h2 className="text-2xl">Branches</h2>
          <div className="gold-rule mt-3 mb-4" />
          <ul className="flex flex-wrap gap-2">
            {CHURCH.branches.map((b) => (
              <li
                key={b}
                className="rounded-full bg-primary-soft px-4 py-2 text-base font-semibold text-primary"
              >
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="card-elegant p-6 text-base text-muted-foreground">{CHURCH.documentNote}</p>
    </div>
  );
}

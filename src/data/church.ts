/**
 * Official church data — The Twelve Apostles Church in Trinity.
 * Sourced verbatim from the official Diary of Events 2026 document.
 * Event names, dates and venue wording must not be altered.
 */

export type EventCategory =
  | "Church-wide"
  | "Executive"
  | "Sisters"
  | "Brothers"
  | "Youth"
  | "Sunday School"
  | "Music"
  | "Leadership"
  | "Thanksgiving"
  | "Prayer"
  | "Sports & Recreation";

export type EventStatus = "confirmed" | "venue-pending" | "date-pending" | "cancelled";

export interface ChurchEvent {
  id: string;
  number: number;
  title: string;
  /** Exact wording from the official calendar. */
  dateDisplay: string;
  /** Sort anchor (ISO). For month-only entries this is the first day of the period. */
  sortDate: string;
  /** ISO dates this event occupies in the calendar. Empty when the exact date is not published. */
  days: string[];
  /** True when the official calendar publishes exact day(s). */
  exactDate: boolean;
  venue: string;
  category: EventCategory;
  description: string;
  status: EventStatus;
  isImportantDate: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CHURCH = {
  name: "The Twelve Apostles Church in Trinity",
  shortName: "TACT Connect",
  reach: "South Africa, Africa & Interglobally",
  motto: "ONE FOR ALL, ALL FOR CHRIST",
  postal: "P.O. Box 40376, Red Hill, 4071",
  tel: "(031) 569 6164",
  telFaxLabel: "Tel. / Fax No's",
  emails: ["thetacc@telkomsa.net", "avocaheadoffice@ttact.org.za"],
  president: "Apostle S.D. Ndlovu — President & Chief Apostle",
  branches: [
    "Botswana",
    "Lesotho",
    "Malawi",
    "Mozambique",
    "Namibia",
    "eSwatini",
    "DRC Congo",
    "Zambia",
    "Zimbabwe",
    "Cuba",
  ],
  documentNote:
    "This document is issued without any alterations & can only be changed by the President & Chief Apostle of The Twelve Apostles Church in Trinity.",
  diaryNote:
    "General Officers’ Tithe Meetings during current year shall be held @ Apostle Level.",
} as const;

export const CATEGORIES: EventCategory[] = [
  "Church-wide",
  "Executive",
  "Sisters",
  "Brothers",
  "Youth",
  "Sunday School",
  "Music",
  "Leadership",
  "Thanksgiving",
  "Prayer",
  "Sports & Recreation",
];

const NOW = "2026-01-01T00:00:00.000Z";

function makeEvent(
  e: Omit<ChurchEvent, "status" | "published" | "createdAt" | "updatedAt" | "description"> &
    Partial<Pick<ChurchEvent, "description">>,
): ChurchEvent {
  const venuePending = /to arrange/i.test(e.venue);
  const status: EventStatus = !e.exactDate
    ? "date-pending"
    : venuePending
      ? "venue-pending"
      : "confirmed";
  return {
    ...e,
    description: e.description ?? "",
    status,
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

const officialDescription = (title: string, dateDisplay: string, venue: string) =>
  `${title} appears on the official Diary of Events 2026 of The Twelve Apostles Church in Trinity, scheduled for ${dateDisplay}. Venue: ${venue}. No further details have been published in the official calendar.`;

const diary: Array<
  Omit<ChurchEvent, "status" | "published" | "createdAt" | "updatedAt" | "description">
> = [
  {
    id: "sealing-services",
    number: 1,
    title: "Sealing Services",
    dateDisplay: "February - March 2026",
    sortDate: "2026-02-01",
    days: [],
    exactDate: false,
    venue: "As per Sealing Programme",
    category: "Church-wide",
    isImportantDate: false,
  },
  {
    id: "joint-executive-meeting",
    number: 2,
    title: "Joint Executive Meeting",
    dateDisplay: "03 – 04 April 2026",
    sortDate: "2026-04-03",
    days: ["2026-04-03", "2026-04-04"],
    exactDate: true,
    venue: "GEC to arrange",
    category: "Executive",
    isImportantDate: false,
  },
  {
    id: "annual-officers-opening-meeting",
    number: 3,
    title: "Annual Officers’ Opening Meeting",
    dateDisplay: "12 April 2026",
    sortDate: "2026-04-12",
    days: ["2026-04-12"],
    exactDate: true,
    venue: "Regions to arrange",
    category: "Leadership",
    isImportantDate: false,
  },
  {
    id: "tactso-opening",
    number: 4,
    title: "The TACTSO Opening",
    dateDisplay: "2/9/10 May 2026",
    sortDate: "2026-05-02",
    days: ["2026-05-02", "2026-05-09", "2026-05-10"],
    exactDate: false,
    venue: "GYC to arrange",
    category: "Youth",
    isImportantDate: false,
  },
  {
    id: "apostle-day",
    number: 5,
    title: "Apostle Day",
    dateDisplay: "24 May 2026",
    sortDate: "2026-05-24",
    days: ["2026-05-24"],
    exactDate: true,
    venue: "Overseers to arrange",
    category: "Church-wide",
    isImportantDate: false,
  },
  {
    id: "senior-testify-sisters",
    number: 6,
    title: "Senior Testify Sisters",
    dateDisplay: "26 – 28 May 2026",
    sortDate: "2026-05-26",
    days: ["2026-05-26", "2026-05-27", "2026-05-28"],
    exactDate: true,
    venue: "Provincial / Regions to arrange",
    category: "Sisters",
    isImportantDate: false,
  },
  {
    id: "junior-testify-sisters",
    number: 7,
    title: "Junior Testify Sisters",
    dateDisplay: "29 – 30 May 2026",
    sortDate: "2026-05-29",
    days: ["2026-05-29", "2026-05-30"],
    exactDate: true,
    venue: "Provincial / Regions to arrange",
    category: "Sisters",
    isImportantDate: false,
  },
  {
    id: "general-officers-tithes-meeting",
    number: 8,
    title: "General Officers & Tithes Meeting",
    dateDisplay: "21 June 2026",
    sortDate: "2026-06-21",
    days: ["2026-06-21"],
    exactDate: true,
    venue: "Regions to arrange",
    category: "Leadership",
    isImportantDate: false,
  },
  {
    id: "choral-music-competition",
    number: 9,
    title: "Choral Music Competition",
    dateDisplay: "18 – 19 July 2026",
    sortDate: "2026-07-18",
    days: ["2026-07-18", "2026-07-19"],
    exactDate: true,
    venue: "Provinces to arrange",
    category: "Music",
    isImportantDate: false,
  },
  {
    id: "old-age-physically-challenged-day",
    number: 10,
    title: "Old Age & Physically Challenged Day",
    dateDisplay: "02 August 2026",
    sortDate: "2026-08-02",
    days: ["2026-08-02"],
    exactDate: true,
    venue: "Overseer to arrange",
    category: "Church-wide",
    isImportantDate: false,
  },
  {
    id: "thanksgiving-day",
    number: 11,
    title: "Thanksgiving Day",
    dateDisplay: "26 – 27 September 2026",
    sortDate: "2026-09-26",
    days: ["2026-09-26", "2026-09-27"],
    exactDate: true,
    venue: "Regions to arrange",
    category: "Thanksgiving",
    isImportantDate: false,
  },
  {
    id: "tactso-closing",
    number: 12,
    title: "The TACTSO Closing",
    dateDisplay: "10 October 2026",
    sortDate: "2026-10-10",
    days: ["2026-10-10"],
    exactDate: true,
    venue: "Local Institutions to arrange",
    category: "Youth",
    isImportantDate: false,
  },
  {
    id: "sunday-school-weekend",
    number: 13,
    title: "Sunday School Weekend",
    dateDisplay: "11 October 2026",
    sortDate: "2026-10-11",
    days: ["2026-10-11"],
    exactDate: true,
    venue: "Overseers to arrange",
    category: "Sunday School",
    isImportantDate: false,
  },
  {
    id: "senior-junior-evangelist-brothers",
    number: 14,
    title: "Senior & Junior Evangelist Brothers",
    dateDisplay: "28 – 29 November 2026",
    sortDate: "2026-11-28",
    days: ["2026-11-28", "2026-11-29"],
    exactDate: true,
    venue: "Regions to arrange",
    category: "Brothers",
    isImportantDate: false,
  },
  {
    id: "annual-officers-closing-meeting",
    number: 15,
    title: "Annual Officers’ Closing Meeting",
    dateDisplay: "13 December 2026",
    sortDate: "2026-12-13",
    days: ["2026-12-13"],
    exactDate: true,
    venue: "Regions to arrange",
    category: "Leadership",
    isImportantDate: false,
  },
];

const importantDates: Array<
  Omit<ChurchEvent, "status" | "published" | "createdAt" | "updatedAt" | "description">
> = [
  {
    id: "gyc-pvc-visits",
    number: 1,
    title: "GYC & PVC Visits",
    dateDisplay: "July–October 2026",
    sortDate: "2026-07-01",
    days: [],
    exactDate: false,
    venue: "Local & Abroad",
    category: "Leadership",
    isImportantDate: true,
  },
  {
    id: "gec-meetings",
    number: 2,
    title: "GEC Meetings (2 times per annum + JEC)",
    dateDisplay: "June–September 2026",
    sortDate: "2026-06-01",
    days: [],
    exactDate: false,
    venue: "Ladysmith-Brookfield",
    category: "Executive",
    isImportantDate: true,
  },
  {
    id: "evangelist-leadership-summit",
    number: 3,
    title: "Evangelist Leadership Summit",
    dateDisplay: "13–14 June 2026",
    sortDate: "2026-06-13",
    days: ["2026-06-13", "2026-06-14"],
    exactDate: true,
    venue: "Global to arrange",
    category: "Leadership",
    isImportantDate: true,
  },
  {
    id: "sports-recreation-day",
    number: 4,
    title: "Sports & Recreation Day",
    dateDisplay: "June–July",
    sortDate: "2026-06-01",
    days: [],
    exactDate: false,
    venue: "Regions to arrange",
    category: "Sports & Recreation",
    isImportantDate: true,
  },
  {
    id: "construction-indaba",
    number: 5,
    title: "Construction Indaba",
    dateDisplay: "13 July 2026",
    sortDate: "2026-07-13",
    days: ["2026-07-13"],
    exactDate: true,
    venue: "Global Lower House to arrange",
    category: "Church-wide",
    isImportantDate: true,
  },
  {
    id: "pre-examination-prayer",
    number: 6,
    title: "Pre-Examination Prayer",
    dateDisplay: "02 October 2026",
    sortDate: "2026-10-02",
    days: ["2026-10-02"],
    exactDate: true,
    venue: "Overseers to arrange",
    category: "Prayer",
    isImportantDate: true,
  },
  {
    id: "youth-leadership-summit",
    number: 7,
    title: "Youth Leadership Summit",
    dateDisplay: "October 2026",
    sortDate: "2026-10-01",
    days: [],
    exactDate: false,
    venue: "Global to arrange",
    category: "Youth",
    isImportantDate: true,
  },
  {
    id: "national-joint-executive-meetings",
    number: 8,
    title: "National Joint Executive Meetings",
    dateDisplay: "October 2026",
    sortDate: "2026-10-01",
    days: [],
    exactDate: false,
    venue: "National / Countries to arrange",
    category: "Executive",
    isImportantDate: true,
  },
];

export const OFFICIAL_EVENTS: ChurchEvent[] = [...diary, ...importantDates].map((e) =>
  makeEvent({
    ...e,
    description: officialDescription(e.title, e.dateDisplay, e.venue),
  }),
);

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: "normal" | "important" | "urgent";
  published: boolean;
  imageUrl?: string;
}

export const OFFICIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-diary-note",
    title: "Note on General Officers’ Tithe Meetings",
    message: CHURCH.diaryNote,
    date: "2026-04-06",
    priority: "important",
    published: true,
  },
  {
    id: "ann-diary-issued",
    title: "Diary of Events 2026 issued by Head Office",
    message:
      "The official Diary of Events 2026 has been issued and stamped by Head Office. This document is issued without any alterations & can only be changed by the President & Chief Apostle of The Twelve Apostles Church in Trinity.",
    date: "2026-04-06",
    priority: "normal",
    published: true,
  },
];

export interface Ministry {
  id: string;
  name: string;
  description: string;
  category: EventCategory;
}

export const OFFICIAL_MINISTRIES: Ministry[] = [
  { id: "sisters", name: "Sisters", description: "", category: "Sisters" },
  { id: "brothers", name: "Brothers", description: "", category: "Brothers" },
  { id: "youth", name: "Youth", description: "", category: "Youth" },
  { id: "sunday-school", name: "Sunday School", description: "", category: "Sunday School" },
  { id: "music", name: "Music / Choir", description: "", category: "Music" },
  { id: "officers", name: "Officers", description: "", category: "Leadership" },
  { id: "evangelism", name: "Evangelism", description: "", category: "Church-wide" },
  {
    id: "sports-recreation",
    name: "Sports & Recreation",
    description: "",
    category: "Sports & Recreation",
  },
];

export const REMINDER_OPTIONS = [
  { value: 30, label: "30 days before" },
  { value: 7, label: "7 days before" },
  { value: 1, label: "1 day before" },
  { value: 0, label: "On the day" },
] as const;

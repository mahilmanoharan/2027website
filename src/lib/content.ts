import site from "@/content/site.json";
import { FAQ, Sponsor } from "@/utils/Types";
import { getTiers } from "@/utils/helpers";

// The only module that loads homepage content. Every getter is async so the
// source can move from site.json to an API or database without touching the
// components that call them.

export interface LinkItem {
  label: string;
  href: string;
}

export interface Settings {
  name: string;
  tagline: string;
  eventDates: string;
  /** ISO 8601 start time for the countdown, e.g. "2027-02-20T09:00:00-05:00". null hides it. */
  eventStart: string | null;
  location: string;
  /** An empty href hides every Apply button. */
  apply: LinkItem;
  nav: LinkItem[];
  mlhBadge: { href: string; image: string; alt: string };
}

export interface About {
  title: string;
  paragraphs: string[];
  links: LinkItem[];
}

export interface JourneyPanel {
  title: string;
  body: string;
  link: LinkItem | null;
}

export interface Journey {
  title: string;
  panels: JourneyPanel[];
}

export interface Stats {
  title: string;
  items: { value: string; label: string }[];
  /** Alt text for public/art/stats/photo-1.webp, photo-2.webp, … in order. */
  photos: { alt: string }[];
}

export interface Sponsors {
  title: string;
  items: Sponsor[];
}

export interface FAQPreview {
  title: string;
  link: LinkItem;
  items: FAQ[];
}

export interface FooterInfo {
  /** Bodies support [text](url) links, rendered with formatContent. */
  columns: { title: string; body: string }[];
  socials: (LinkItem & { icon: string })[];
}

export async function getSettings(): Promise<Settings> {
  return site.settings;
}

export async function getAbout(): Promise<About> {
  return site.about;
}

export async function getJourney(): Promise<Journey> {
  return site.journey;
}

export async function getStats(): Promise<Stats> {
  return site.stats;
}

export async function getSponsors(): Promise<Sponsors> {
  return {
    title: site.sponsors.title,
    items: site.sponsors.items.map((sponsor) => ({
      ...sponsor,
      tier: getTiers(sponsor.tier),
    })),
  };
}

export async function getFAQ(): Promise<FAQPreview> {
  return site.faq;
}

export async function getFooter(): Promise<FooterInfo> {
  return site.footer;
}

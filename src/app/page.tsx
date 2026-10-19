import { HorizontalJourney } from "@/components/Scroll/HorizontalJourney";
import { ParallaxHero } from "@/components/Scroll/ParallaxHero";
import { StatsPlayground } from "@/components/Scroll/StatsPlayground";
import { About } from "@/components/Sections/About";
import { FAQPreview } from "@/components/Sections/FAQPreview";
import { Footer } from "@/components/Sections/Footer";
import { Nav } from "@/components/Sections/Nav";
import { Sponsors } from "@/components/Sections/Sponsors";
import {
  getAbout,
  getFAQ,
  getFooter,
  getJourney,
  getSettings,
  getSponsors,
  getStats,
} from "@/lib/content";

export default async function Home() {
  const [settings, about, journey, stats, sponsors, faq, footer] =
    await Promise.all([
      getSettings(),
      getAbout(),
      getJourney(),
      getStats(),
      getSponsors(),
      getFAQ(),
      getFooter(),
    ]);

  return (
    <div className="relative w-full bg-cream text-brown">
      <Nav settings={settings} />
      <ParallaxHero settings={settings} />
      <About about={about} />
      <HorizontalJourney journey={journey} />
      <StatsPlayground stats={stats} />
      <Sponsors sponsors={sponsors} />
      <FAQPreview faq={faq} />
      <Footer footer={footer} name={settings.name} />
    </div>
  );
}

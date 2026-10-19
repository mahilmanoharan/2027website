import Image from "next/image";
import { SecondaryButton } from "@/components/Buttons/SecondaryButton";
import { SectionHeading } from "@/components/UI/SectionHeading";
import { Journey, JourneyPanel as JourneyPanelContent } from "@/lib/content";

interface HorizontalJourneyProps {
  journey: Journey;
}

export function HorizontalJourney({ journey }: HorizontalJourneyProps) {
  return (
    <section aria-labelledby="journey-heading" className="w-full bg-cream text-brown">
      <div className="mx-auto max-w-7xl px-4 pt-20">
        <SectionHeading id="journey-heading" title={journey.title} />
      </div>
      <ol className="mx-auto max-w-7xl space-y-10 px-4 py-12 md:py-16">
        {journey.panels.map((panel, index) => (
          <JourneyPanel key={panel.title} panel={panel} index={index} />
        ))}
      </ol>
    </section>
  );
}

interface JourneyPanelProps {
  panel: JourneyPanelContent;
  index: number;
}

// Art is decorative; the panel's words are real HTML on top of it.
function JourneyPanel({ panel, index }: JourneyPanelProps) {
  return (
    <li className="relative overflow-hidden rounded-3xl bg-cream-light md:aspect-[16/10]">
      <Image
        src={`/art/journey/panel-${index + 1}.webp`}
        alt=""
        width={1440}
        height={900}
        className="h-auto w-full md:absolute md:inset-0 md:h-full md:object-cover"
      />
      <div className="relative p-6 md:m-10 md:max-w-md md:rounded-3xl md:bg-cream md:p-8 md:shadow-lg">
        <p className="font-sans font-bold">{String(index + 1).padStart(2, "0")}</p>
        <h3 className="font-sans text-2xl font-bold">{panel.title}</h3>
        <p className="mt-3 leading-relaxed">{panel.body}</p>
        {panel.link && (
          <div className="mt-5">
            <SecondaryButton href={panel.link.href} textColor="text-brown">
              {panel.link.label}
            </SecondaryButton>
          </div>
        )}
      </div>
    </li>
  );
}

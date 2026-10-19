import { getImageProps } from "next/image";
import { SecondaryButton } from "@/components/Buttons/SecondaryButton";
import { Settings } from "@/lib/content";

interface ParallaxHeroProps {
  settings: Settings;
}

const DESKTOP = "(min-width: 768px)";

// 1×1 transparent GIF. Phones get this instead of the desktop-only layers, so
// they never download them.
const EMPTY =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// images.unoptimized is on, so there is no srcSet; fall back to the file itself.
function sourceSet(src: string, width: number, height: number) {
  const { props } = getImageProps({ src, width, height, alt: "" });
  return props.srcSet ?? props.src;
}

export function ParallaxHero({ settings }: ParallaxHeroProps) {
  const { name, tagline, eventDates, location, apply } = settings;

  // Layer 3 shares a slot with the phone crop: one <picture>, one download.
  const { props: mobile } = getImageProps({
    src: "/art/hero/mobile.webp",
    width: 1170,
    height: 2532,
    alt: "",
    loading: "eager",
    fetchPriority: "high",
  });

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[calc(100svh-4rem)] w-full items-center overflow-hidden bg-cream"
    >
      <picture>
        <source
          media={DESKTOP}
          srcSet={sourceSet("/art/hero/layer-3-back.webp", 2880, 1800)}
          width={2880}
          height={1800}
        />
        <img {...mobile} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      </picture>
      <picture className="hidden md:block">
        <source
          media={DESKTOP}
          srcSet={sourceSet("/art/hero/layer-2-mid.webp", 2880, 1200)}
          width={2880}
          height={1200}
        />
        <img src={EMPTY} alt="" className="absolute inset-x-0 bottom-0 -z-10 h-auto w-full" />
      </picture>
      <picture className="hidden md:block">
        <source
          media={DESKTOP}
          srcSet={sourceSet("/art/hero/layer-1-front.webp", 2880, 900)}
          width={2880}
          height={900}
        />
        <img src={EMPTY} alt="" className="absolute inset-x-0 bottom-0 -z-10 h-auto w-full" />
      </picture>

      {/* Title box sits in the left third, which the art keeps calm. */}
      <div className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="max-w-md rounded-3xl bg-cream p-6 shadow-lg md:p-8">
          <p className="font-sans font-bold italic text-brown-dark">{tagline}</p>
          <h1
            id="hero-title"
            className="font-sans font-bold uppercase text-brown text-4xl sm:text-5xl lg:text-6xl break-words"
          >
            {name}
          </h1>
          <p className="mt-4 text-lg font-normal">
            {eventDates} · {location}
          </p>
          {apply.href && (
            <div className="mt-6">
              <SecondaryButton href={apply.href} textColor="text-brown">
                {apply.label}
              </SecondaryButton>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

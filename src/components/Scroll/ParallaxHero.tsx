"use client";

import { useRef } from "react";
import { getImageProps } from "next/image";
import * as m from "motion/react-m";
import { LazyMotion, domMin, useReducedMotion, useScroll, useTransform } from "motion/react";
import { SecondaryButton } from "@/components/Buttons/SecondaryButton";
import { Countdown } from "@/components/Scroll/Countdown";
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
  const { name, tagline, eventDates, eventStart, location, apply } = settings;
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // 0 when the hero sits under the 64px nav, 1 once it has scrolled past it.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 64px", "end 64px"] });
  // A layer at speed s lags the page by (1 - s) of the distance scrolled.
  // Layers fill the hero, so a percentage of their height is a share of it.
  const backY = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]); // 0.2×
  const midY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]); // 0.5×

  // Layer 3 shares a slot with the phone crop: one <picture>, one download.
  // Phones get 2 layers: this one and the text.
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
      ref={ref}
      id="content"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[calc(100svh-4rem)] w-full items-center overflow-hidden bg-cream"
    >
      {/* The back layer is the LCP image. React hoists these into <head>, so the
          browser asks for it before the scripts; media picks one per device. */}
      <link
        rel="preload"
        as="image"
        href="/art/hero/mobile.webp"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/art/hero/layer-3-back.webp"
        media={DESKTOP}
        fetchPriority="high"
      />
      {/* domMin supplies the DOM renderer that lets m elements follow MotionValues. */}
      <LazyMotion features={domMin}>
        <m.div
          style={{ y: reduceMotion ? 0 : backY }}
          className="absolute inset-0 -z-10 will-change-transform"
        >
          <picture>
            <source
              media={DESKTOP}
              srcSet={sourceSet("/art/hero/layer-3-back.webp", 2880, 1800)}
              width={2880}
              height={1800}
            />
            <img {...mobile} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </picture>
        </m.div>
        <m.div
          style={{ y: reduceMotion ? 0 : midY }}
          className="absolute inset-0 -z-10 hidden will-change-transform md:block"
        >
          <picture>
            <source
              media={DESKTOP}
              srcSet={sourceSet("/art/hero/layer-2-mid.webp", 2880, 1200)}
              width={2880}
              height={1200}
            />
            <img src={EMPTY} alt="" className="absolute inset-x-0 bottom-0 h-auto w-full" />
          </picture>
        </m.div>
      </LazyMotion>
      {/* Layer 1 moves with the page (1×), so it needs no transform. */}
      <div className="absolute inset-0 -z-10 hidden md:block">
        <picture>
          <source
            media={DESKTOP}
            srcSet={sourceSet("/art/hero/layer-1-front.webp", 2880, 900)}
            width={2880}
            height={900}
          />
          <img src={EMPTY} alt="" className="absolute inset-x-0 bottom-0 h-auto w-full" />
        </picture>
      </div>

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
          <Countdown start={eventStart} />
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

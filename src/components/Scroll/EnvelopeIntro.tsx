"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import * as m from "motion/react-m";
import { LazyMotion, domMin, useMotionValue, useScroll, useTransform } from "motion/react";
import { SecondaryButton } from "@/components/Buttons/SecondaryButton";
import { Countdown } from "@/components/Scroll/Countdown";
import { Settings } from "@/lib/content";

interface EnvelopeIntroProps {
  settings: Settings;
}

// Height of the sticky nav, which the stage pins underneath.
const NAV_HEIGHT = 64;

// Without JavaScript, or with reduced motion, the envelope is skipped and the
// letter is an ordinary hero section. One rule set serves both.
const STATIC_LETTER =
  "[data-envelope]{height:auto}" +
  "[data-envelope-stage]{position:static;height:auto}" +
  "[data-envelope-scene]{display:none}" +
  "[data-letter]{position:static;opacity:1!important;transform:none!important}";

// Where each step of the opening happens, as a share of the pinned scroll.
const STEPS = {
  hint: [0, 0.06],
  flap: [0.02, 0.22],
  lift: [0.22, 0.45],
  drop: [0.45, 0.72],
  grow: [0.48, 0.8],
  preview: [0.46, 0.56],
  letter: [0.78, 0.92],
} as const;

// 0 before the step, 1 after it, eased out in between.
function step(progress: number, [start, end]: readonly [number, number]) {
  const t = Math.min(Math.max((progress - start) / (end - start), 0), 1);
  return 1 - (1 - t) ** 3;
}

export function EnvelopeIntro({ settings }: EnvelopeIntroProps) {
  const { name, tagline, eventDates, eventStart, location, apply } = settings;
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  // 0 when the section sits under the nav, 1 when its pinned scroll runs out.
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: [`start ${NAV_HEIGHT}px`, "end end"],
  });

  // Paper geometry in px, measured from layout (transforms don't affect it):
  // how far it rises out of the pocket, how far its center sits from the
  // stage's center, and the scale that makes it cover the stage.
  const lift = useMotionValue(0);
  const centerY = useMotionValue(0);
  const coverX = useMotionValue(1);
  const coverY = useMotionValue(1);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const paper = paperRef.current;
    if (!stage || !paper) return;
    const measure = () => {
      // No offset parent while the static fallback hides the scene.
      const envelope = paper.offsetParent as HTMLElement | null;
      if (!envelope) return;
      const paperMiddle = envelope.offsetTop + paper.offsetTop + paper.offsetHeight / 2;
      lift.set(paper.offsetHeight * 0.65);
      centerY.set(stage.clientHeight / 2 - paperMiddle);
      // A little extra so the paper's rounded corners land off screen.
      coverX.set((stage.clientWidth / paper.offsetWidth) * 1.06);
      coverY.set((stage.clientHeight / paper.offsetHeight) * 1.06);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [lift, centerY, coverX, coverY]);

  const hintOpacity = useTransform(progress, (p) => 1 - step(p, STEPS.hint));
  const flapRotate = useTransform(progress, (p) => step(p, STEPS.flap) * 180);
  // The flap covers the paper until it stands upright, then falls behind it.
  const flapZ = useTransform(flapRotate, (angle) => (angle < 90 ? 30 : 5));
  const dropY = useTransform(progress, (p) => `${step(p, STEPS.drop) * 110}vh`);
  const dropOpacity = useTransform(progress, (p) => 1 - step(p, STEPS.drop));

  const paperY = useTransform([progress, lift, centerY], ([p, l, c]: number[]) => {
    const risen = -l * step(p, STEPS.lift);
    return risen + (c + l) * step(p, STEPS.grow);
  });
  const previewY = useTransform([progress, lift], ([p, l]: number[]) => -l * step(p, STEPS.lift));
  const previewOpacity = useTransform(progress, (p) => 1 - step(p, STEPS.preview));
  // Scale 1 while the paper is in the envelope, cover once it fills the stage.
  const paperScaleX = useTransform([progress, coverX], ([p, c]: number[]) => 1 + (c - 1) * step(p, STEPS.grow));
  const paperScaleY = useTransform([progress, coverY], ([p, c]: number[]) => 1 + (c - 1) * step(p, STEPS.grow));

  const letterOpacity = useTransform(progress, (p) => step(p, STEPS.letter));
  const letterY = useTransform(progress, (p) => 24 * (1 - step(p, STEPS.letter)));

  // Tabbing into the letter before it has opened jumps to the opened state,
  // so the focused link is never invisible.
  const showLetter = () => {
    const section = ref.current;
    if (!section || progress.get() >= STEPS.letter[1]) return;
    requestAnimationFrame(() => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const end = top + section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: end, behavior: "smooth" });
    });
  };

  return (
    <section
      ref={ref}
      id="content"
      data-envelope
      aria-labelledby="hero-title"
      className="relative h-[320vh] w-full bg-pink-soft"
    >
      <style>{`@media (prefers-reduced-motion: reduce){${STATIC_LETTER}}`}</style>
      <noscript>
        <style>{STATIC_LETTER}</style>
      </noscript>

      {/* clip, not hidden, so focusing the letter can't scroll the stage itself. */}
      <div
        ref={stageRef}
        data-envelope-stage
        className="sticky top-16 h-[calc(100svh-4rem)] overflow-clip"
      >
        {/* domMin supplies the DOM renderer that lets m elements follow MotionValues. */}
        <LazyMotion features={domMin}>
          <div
            data-envelope-scene
            aria-hidden="true"
            className="absolute inset-0 isolate flex flex-col items-center justify-center gap-8 px-4"
          >
            {/* Top padding keeps room for the open flap and the rising paper. */}
            <div className="w-[min(86vw,560px,calc((100svh-4rem)*0.75))] pt-[30%]">
              <div className="relative aspect-[8/5] w-full">
                {/* Inside of the envelope, behind the paper. */}
                <m.div
                  style={{ y: dropY, opacity: dropOpacity }}
                  className="absolute inset-0 rounded-md bg-pink-transition"
                />

                <m.div
                  ref={paperRef}
                  style={{ y: paperY, scaleX: paperScaleX, scaleY: paperScaleY }}
                  className="absolute inset-x-[5%] bottom-[4%] top-[6%] z-10 rounded-sm bg-cream shadow-md"
                />
                {/* Kept apart from the paper so its text never stretches with it. */}
                <m.div
                  style={{ y: previewY, opacity: previewOpacity }}
                  className="absolute inset-x-[5%] bottom-[4%] top-[6%] z-10 flex flex-col items-center pt-[6%] text-center text-brown"
                >
                  <p className="font-sans text-sm italic sm:text-base">You&rsquo;re invited to</p>
                  <p className="font-sans text-2xl font-bold uppercase sm:text-4xl">{name}</p>
                </m.div>

                {/* The pocket: side flaps with a V cut out, then the bottom flap. */}
                <m.div style={{ y: dropY, opacity: dropOpacity }} className="absolute inset-0 z-20">
                  <div className="absolute inset-0 rounded-md bg-pink [clip-path:polygon(0_0,50%_52%,100%_0,100%_100%,0_100%)]" />
                  <div className="absolute inset-0 rounded-md bg-pink-accent [clip-path:polygon(0_100%,50%_42%,100%_100%)]" />
                  <p className="absolute inset-x-0 bottom-[7%] text-center font-sans text-xs font-bold sm:bottom-[10%] sm:text-sm uppercase tracking-[0.3em] text-cream-light">
                    {location}
                  </p>
                </m.div>

                <m.div
                  style={{ y: dropY, opacity: dropOpacity, zIndex: flapZ }}
                  className="absolute inset-0"
                >
                  <m.div
                    style={{ rotateX: flapRotate, transformPerspective: 1200 }}
                    className="absolute inset-x-0 top-0 h-[58%] origin-top [transform-style:preserve-3d]"
                  >
                    <div className="absolute inset-0 bg-pink-light [backface-visibility:hidden] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                    {/* Seen once the flap swings up, so its shape is mirrored. */}
                    <div className="absolute inset-0 bg-pink-transition [backface-visibility:hidden] [clip-path:polygon(50%_0,100%_100%,0_100%)] [transform:rotateX(180deg)]" />
                    <div className="absolute bottom-0 left-1/2 flex h-12 w-12 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-brown shadow-md ring-2 ring-brown-dark [backface-visibility:hidden] sm:h-20 sm:w-20 sm:ring-4">
                      <Image src="/images/PH2026Logo.svg" alt="" width={44} height={42} className="h-7 w-7 object-contain sm:h-11 sm:w-11" />
                    </div>
                  </m.div>
                </m.div>
              </div>
            </div>

            <m.p
              style={{ opacity: hintOpacity }}
              className="font-sans text-sm font-bold uppercase tracking-[0.2em] text-brown"
            >
              Scroll to open
              <span className="mt-2 block animate-bounce text-center text-lg motion-reduce:animate-none">
                &darr;
              </span>
            </m.p>
          </div>

          {/* The letter is the real hero: plain HTML, in the server render. */}
          <m.div
            data-letter
            onFocus={showLetter}
            style={{ opacity: letterOpacity, y: letterY }}
            className="absolute inset-0 z-10 flex min-h-[calc(100svh-4rem)] items-center justify-center bg-cream px-4 py-16 text-center text-brown"
          >
            <div className="max-w-xl">
              <p className="font-sans font-bold italic text-brown-dark">{tagline}</p>
              <p className="mt-6 font-sans text-lg italic">You&rsquo;re invited to</p>
              <h1
                id="hero-title"
                className="break-words font-sans text-5xl font-bold uppercase sm:text-6xl lg:text-7xl"
              >
                {name}
              </h1>
              <p className="mt-4 text-lg font-normal">
                {eventDates} · {location}
              </p>
              <div className="[&_[data-countdown]]:justify-center">
                <Countdown start={eventStart} />
              </div>
              {apply.href && (
                <div className="mt-8">
                  <SecondaryButton href={apply.href} textColor="text-brown">
                    {apply.label}
                  </SecondaryButton>
                </div>
              )}
            </div>
          </m.div>
        </LazyMotion>
      </div>
    </section>
  );
}


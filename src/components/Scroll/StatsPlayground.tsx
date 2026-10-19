import Image from "next/image";
import { SectionHeading } from "@/components/UI/SectionHeading";
import { Stats } from "@/lib/content";

interface StatsPlaygroundProps {
  stats: Stats;
}

const CARD_POSITIONS = ["left-0 top-0 -rotate-6", "right-0 bottom-0 rotate-3"];

export function StatsPlayground({ stats }: StatsPlaygroundProps) {
  return (
    <section aria-labelledby="stats-heading" className="w-full overflow-x-clip bg-pink-soft text-brown">
      <div className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading id="stats-heading" title={stats.title} />
        <div className="mt-10 grid items-center gap-12 md:grid-cols-2">
          <div className="relative mx-auto h-64 w-full max-w-md sm:h-80">
            {stats.photos.map((photo, index) => (
              <figure
                key={index}
                className={`absolute w-3/5 rounded-2xl bg-white p-2 shadow-lg ${CARD_POSITIONS[index % 2]}`}
              >
                <Image
                  src={`/art/stats/photo-${index + 1}.webp`}
                  alt={photo.alt}
                  width={1200}
                  height={900}
                  className="h-auto w-full rounded-xl"
                />
              </figure>
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-4">
            {stats.items.map((stat) => (
              <li
                key={stat.label}
                className="flex aspect-square flex-col items-center justify-center rounded-full bg-cream-light p-4 text-center shadow-md"
              >
                <p className="font-sans text-2xl font-bold break-words md:text-3xl">{stat.value}</p>
                <p className="text-sm font-normal break-words">{stat.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

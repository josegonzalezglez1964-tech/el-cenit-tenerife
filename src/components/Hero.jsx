import { hero } from "../data/content";

export default function Hero({ onStart, onReadThesis }) {
  const ribbonText = `· ${hero.ribbon.join(" · ")} ·`;

  return (
    <header id="top" className="pt-20 pb-16 lg:pt-32 lg:pb-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-clay mb-6">
          {hero.eyebrow}
        </p>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6">
          {hero.titleLine1}{" "}
          <span className="italic text-clay">{hero.titleHighlight}</span>.
        </h1>

        <p className="text-base sm:text-lg text-ink/70 max-w-2xl mx-auto mb-10">
          {hero.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="rounded-full bg-ink text-cream px-7 py-3 text-sm font-medium hover:bg-clay transition-colors"
          >
            {hero.ctaPrimary}
          </button>
          <button
            onClick={onReadThesis}
            className="rounded-full border border-ink/20 px-7 py-3 text-sm font-medium hover:border-ink/50 transition-colors"
          >
            {hero.ctaSecondary}
          </button>
        </div>
      </div>

      {/* Marquee ribbon */}
      <div className="mt-16 overflow-hidden border-y border-line py-3">
        <div className="flex whitespace-nowrap marquee-track">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="font-mono text-xs uppercase tracking-widest text-ink/50 pr-8"
            >
              {ribbonText}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

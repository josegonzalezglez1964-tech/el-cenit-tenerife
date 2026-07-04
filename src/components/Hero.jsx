import { hero } from "../data/content";

export default function Hero({ onStart, onReadThesis }) {
  const ribbonText = `· ${hero.ribbon.join(" · ")} ·`;

  return (
    <header id="top">
      <div
        className="relative flex items-center justify-center min-h-[560px] sm:min-h-[640px] lg:min-h-[760px] px-6 lg:px-10 text-center bg-cover bg-center"
        style={{ backgroundImage: "url('/teide.jpg')" }}
      >
        {/* Dark scrim so text stays readable over the photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/25" />

        <div className="relative max-w-3xl mx-auto py-20">
          <p className="inline-block font-mono text-xs uppercase tracking-[0.2em] text-clay-light border border-clay-light/50 rounded-full px-4 py-1.5 mb-8">
            {hero.eyebrow}
          </p>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6 text-cream">
            {hero.titleLine1}{" "}
            <span className="italic text-clay-light">{hero.titleHighlight}</span>.
          </h1>

          <p className="text-base sm:text-lg text-cream/75 max-w-2xl mx-auto mb-10">
            {hero.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="rounded-full bg-clay text-cream px-7 py-3 text-sm font-medium hover:bg-clay-light transition-colors"
            >
              {hero.ctaPrimary}
            </button>
            <button
              onClick={onReadThesis}
              className="rounded-full border border-cream/40 text-cream px-7 py-3 text-sm font-medium hover:border-cream/70 transition-colors"
            >
              {hero.ctaSecondary}
            </button>
          </div>
        </div>
      </div>

      {/* Marquee ribbon — sits below the photo, back on the site's cream background */}
      <div className="overflow-hidden border-y border-line py-3 bg-cream">
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

import { tenerife } from "../data/content";

export default function Tenerife() {
  return (
    <section id="tenerife" className="py-20 lg:py-28 border-t border-line">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-clay mb-4">
          {tenerife.eyebrow}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-4 max-w-2xl">
          {tenerife.title}{" "}
          <span className="italic text-clay">{tenerife.titleHighlight}</span>
        </h2>
        <p className="text-ink/70 max-w-2xl mb-2">{tenerife.description}</p>
        <p className="font-mono text-xs uppercase tracking-widest text-ink/40 mb-14">
          {tenerife.landmark}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {tenerife.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-line p-6 bg-white/40">
              <p className="text-xs font-mono uppercase tracking-widest text-clay mb-2">
                {stat.label}
              </p>
              <p className="font-display text-4xl mb-2">{stat.value}</p>
              <p className="text-xs text-ink/60">{stat.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

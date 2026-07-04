import { tesis } from "../data/content";

export default function Tesis() {
  return (
    <section id="tesis" className="py-20 lg:py-28 border-t border-line">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-clay mb-4">
          {tesis.eyebrow}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-8 max-w-2xl">
          {tesis.title}
        </h2>

        <div className="space-y-4 max-w-2xl text-ink/70 mb-14">
          {tesis.paragraphs.map((p, i) => (
            <p key={i}>
              {p.pre}
              <strong className="text-ink font-semibold">{p.stat}</strong>
              {p.mid}
              {p.stat2 && (
                <strong className="text-ink font-semibold">{p.stat2}</strong>
              )}
              {p.post}
            </p>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {tesis.cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-line p-6 bg-white/40 hover:bg-white/70 transition-colors"
            >
              <h3 className="font-display text-xl mb-2">{card.title}</h3>
              <p className="text-sm text-ink/60">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

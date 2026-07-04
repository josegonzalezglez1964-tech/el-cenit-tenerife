import { modelo } from "../data/content";

export default function Modelo() {
  return (
    <section id="modelo" className="py-20 lg:py-28 border-t border-line">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-clay mb-4">
          {modelo.eyebrow}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-4 max-w-2xl">
          {modelo.title}
        </h2>
        <p className="text-ink/70 max-w-2xl mb-14">{modelo.description}</p>

        <div className="grid sm:grid-cols-3 gap-6">
          {modelo.cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-line p-6 bg-white/40 hover:bg-white/70 transition-colors flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display text-xl mb-2">{card.title}</h3>
                <p className="text-sm text-ink/70 mb-4">{card.description}</p>
              </div>
              <p className="text-xs font-mono uppercase tracking-wide text-clay">
                {card.footnote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

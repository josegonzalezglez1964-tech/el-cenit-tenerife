import { timeline } from "../data/content";

export default function Timeline() {
  return (
    <section id="timeline" className="py-20 lg:py-28 border-t border-line">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-clay mb-4">
          {timeline.eyebrow}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-4 max-w-2xl">
          {timeline.title}
        </h2>
        <p className="text-ink/70 max-w-2xl mb-14">{timeline.description}</p>

        <div className="space-y-10">
          {timeline.stages.map((stage) => (
            <div
              key={stage.number}
              className="grid sm:grid-cols-[120px_1fr] gap-4 sm:gap-8 border-t border-line pt-8"
            >
              <div>
                <p className="font-mono text-xs text-ink/50 mb-1">{stage.range}</p>
                <p className="font-display text-4xl text-clay">{stage.number}</p>
              </div>
              <div>
                <h3 className="font-display text-2xl mb-2">{stage.title}</h3>
                <p className="text-ink/70 mb-4 max-w-2xl">{stage.description}</p>
                <div className="flex flex-wrap gap-2">
                  {stage.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono uppercase tracking-wide rounded-full border border-line px-3 py-1 text-ink/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

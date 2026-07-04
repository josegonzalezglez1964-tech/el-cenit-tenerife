import { finalCta } from "../data/content";

export default function FinalCta({ onGoogleLogin }) {
  return (
    <section className="py-20 lg:py-28 border-t border-line">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-4">
          {finalCta.title}
        </h2>
        <p className="text-ink/70 mb-8">{finalCta.description}</p>
        <button
          onClick={onGoogleLogin}
          className="rounded-full bg-ink text-cream px-8 py-3 text-sm font-medium hover:bg-clay transition-colors"
        >
          {finalCta.cta}
        </button>
      </div>
    </section>
  );
}

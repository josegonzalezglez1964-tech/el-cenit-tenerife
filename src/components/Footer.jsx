import { footer } from "../data/content";

export default function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink/50 font-mono">
        <p>{footer.copyright}</p>
        <p>{footer.version}</p>
      </div>
    </footer>
  );
}

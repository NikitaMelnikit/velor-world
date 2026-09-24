import { TransitionLink } from "@/components/transition/TransitionLink";
import { Plate } from "@/components/media/Plate";

export default function NotFound() {
  return (
    <section className="relative grid min-h-svh place-items-center overflow-hidden bg-ink px-[var(--gutter)] text-bone" data-tone="dark">
      <div className="absolute inset-0 opacity-50">
        <Plate kind="arches" tone="night" seed={404} />
      </div>
      <div className="relative text-center">
        <p className="t-label opacity-60">Room ∅ — not built</p>
        <h1 className="t-display size-huge mt-4">404</h1>
        <p className="t-serif mt-6 text-3xl italic">This room is one of the ideas we didn&apos;t build.</p>
        <div className="mt-10 flex justify-center gap-3">
          <TransitionLink href="/world" className="t-label bg-bone px-6 py-4 text-ink">
            Open the map
          </TransitionLink>
          <TransitionLink href="/archive" className="t-label border border-bone/30 px-6 py-4">
            Visit the archive
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}

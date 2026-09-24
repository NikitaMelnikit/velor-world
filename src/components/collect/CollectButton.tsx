"use client";

import { useCollector, useIsCollected, type CollectItem } from "@/lib/store";
import { cn } from "@/lib/utils";

/** The one gesture that works everywhere in the world: keep this. */
export function CollectButton({
  item,
  className,
  compact = false,
}: {
  item: CollectItem;
  className?: string;
  compact?: boolean;
}) {
  const collected = useIsCollected(item.id);
  const toggle = useCollector((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle(item);
      }}
      data-cursor={collected ? "Release" : "Collect"}
      aria-pressed={collected}
      aria-label={collected ? `Remove ${item.title} from your collection` : `Add ${item.title} to your collection`}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full border border-current/30 transition-colors duration-500 hover:border-current",
        compact ? "px-3 py-1.5" : "px-4 py-2.5",
        collected && "border-current",
        className,
      )}
    >
      <span className="relative block size-3">
        <span className={cn("absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current transition-transform duration-500", collected && "rotate-45 scale-x-75 -translate-x-[2px] translate-y-[1px]")} />
        <span
          className={cn(
            "absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-500",
            collected && "translate-x-[1px] -rotate-[35deg] scale-y-110",
          )}
        />
      </span>
      <span className="t-label">{collected ? "Collected" : compact ? "Collect" : "Add to collection"}</span>
    </button>
  );
}

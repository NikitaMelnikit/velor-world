"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useTransition } from "./TransitionProvider";
import type { TransitionVariant } from "./variants";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  variant?: TransitionVariant;
  /** Open the next room from the point that was clicked. */
  fromPointer?: boolean;
};

/**
 * A real <a> (prefetch, a11y, open-in-new-tab all keep working) whose
 * primary click walks through the transition system instead of loading.
 */
export function TransitionLink({ href, variant, fromPointer, onClick, children, ...rest }: Props) {
  const { navigate } = useTransition();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (/^(https?:|mailto:|tel:)/.test(href)) return;
    e.preventDefault();
    navigate(href, { variant, origin: fromPointer ? { x: e.clientX, y: e.clientY } : undefined });
  };

  return (
    <Link href={href} onClick={handle} {...rest}>
      {children}
    </Link>
  );
}

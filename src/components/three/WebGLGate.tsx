"use client";

import { Component, useSyncExternalStore, type ReactNode } from "react";
import { canUseWebGL } from "@/lib/utils";

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") console.warn("[VELOR] WebGL scene failed, using fallback.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

let support: boolean | null = null;
const getSupport = () => (support ??= canUseWebGL());

/**
 * Renders WebGL children only when the device can run them. Anything else
 * — no WebGL, a lost context, a shader error — falls back to a crafted
 * static version instead of a blank rectangle.
 */
export function WebGLGate({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const ok = useSyncExternalStore(
    () => () => {},
    getSupport,
    () => false,
  );
  if (!ok) return <>{fallback}</>;
  return <Boundary fallback={fallback}>{children}</Boundary>;
}

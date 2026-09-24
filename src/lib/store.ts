"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { pulse } from "./pulse";

export type CollectKind = "object" | "material" | "article" | "project" | "idea" | "concept";

export type CollectItem = {
  /** Globally unique, e.g. "object:solen". */
  id: string;
  kind: CollectKind;
  title: string;
  href: string;
  meta?: string;
  /** Slug used to render the item's visual in the collection. */
  ref?: string;
};

export type SavedItem = CollectItem & {
  addedAt: number;
  note?: string;
  pos?: { x: number; y: number };
};

type CollectorState = {
  name: string | null;
  number: string | null;
  openedAt: number | null;
  items: SavedItem[];
  visited: string[];
  sound: boolean;
  create: (name: string) => void;
  toggle: (item: CollectItem) => boolean;
  remove: (id: string) => void;
  setNote: (id: string, note: string) => void;
  setPos: (id: string, pos: { x: number; y: number }) => void;
  reset: () => void;
  visit: (room: string) => void;
  setSound: (on: boolean) => void;
};

const catalogNumber = () => `VC-${String(Math.floor(1000 + Math.random() * 8999))}`;

/**
 * Persisted personal archive. `skipHydration` keeps the first client render
 * identical to the server render; <AppProviders> rehydrates after mount.
 */
export const useCollector = create<CollectorState>()(
  persist(
    (set, get) => ({
      name: null,
      number: null,
      openedAt: null,
      items: [],
      visited: [],
      sound: false,
      create: (name) =>
        set({
          name: name.trim() || "Untitled Collection",
          number: get().number ?? catalogNumber(),
          openedAt: get().openedAt ?? Date.now(),
        }),
      toggle: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        if (exists) {
          set({ items: get().items.filter((i) => i.id !== item.id) });
          return false;
        }
        const state = get();
        set({
          name: state.name ?? "Untitled Collection",
          number: state.number ?? catalogNumber(),
          openedAt: state.openedAt ?? Date.now(),
          items: [...state.items, { ...item, addedAt: Date.now() }],
        });
        pulse.emit({ strength: 0.8, kind: "collect", freq: 520, decay: 0.6 });
        useUI.getState().notify({
          title: item.title,
          meta: `Added to ${get().name} — ${String(get().items.length).padStart(2, "0")} pieces`,
        });
        return true;
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      setNote: (id, note) => set({ items: get().items.map((i) => (i.id === id ? { ...i, note } : i)) }),
      setPos: (id, pos) => set({ items: get().items.map((i) => (i.id === id ? { ...i, pos } : i)) }),
      reset: () => set({ name: null, number: null, openedAt: null, items: [] }),
      visit: (room) => {
        if (!get().visited.includes(room)) set({ visited: [...get().visited, room] });
      },
      setSound: (on) => set({ sound: on }),
    }),
    {
      name: "velor-collector",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ name, number, openedAt, items, visited }) => ({ name, number, openedAt, items, visited }),
    },
  ),
);

type Toast = { id: number; title: string; meta?: string };

type UIState = {
  menuOpen: boolean;
  setMenu: (open: boolean) => void;
  toast: Toast | null;
  notify: (t: Omit<Toast, "id">) => void;
  /** Section label the current room can publish to the HUD (e.g. chapter name). */
  sub: string | null;
  setSub: (s: string | null) => void;
  /** Product currently in focus — lets transitions draw the right blueprint. */
  focus: string | null;
  setFocus: (slug: string | null) => void;
};

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useUI = create<UIState>()((set) => ({
  menuOpen: false,
  setMenu: (menuOpen) => set({ menuOpen }),
  toast: null,
  notify: (t) => {
    clearTimeout(toastTimer);
    set({ toast: { ...t, id: Date.now() } });
    toastTimer = setTimeout(() => set({ toast: null }), 2600);
  },
  sub: null,
  setSub: (sub) => set({ sub }),
  focus: null,
  setFocus: (focus) => set({ focus }),
}));

export const useIsCollected = (id: string) => useCollector((s) => s.items.some((i) => i.id === id));

/** True once the persisted collection has been read from storage. */
export function useCollectorHydrated() {
  return useSyncExternalStore(
    (cb) => useCollector.persist.onFinishHydration(cb),
    () => useCollector.persist.hasHydrated(),
    () => false,
  );
}

"use client";

import { useSyncExternalStore } from "react";
import type { CartLine } from "./types";

const KEY = "pxelx-cart-v1";
const EMPTY: CartLine[] = [];

let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function write(next: CartLine[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked (private mode). The cart still works for this page view.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): CartLine[] {
  if (cache === null) cache = read();
  return cache;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    lines,
    add(line: CartLine) {
      const current = getSnapshot();
      const duplicate = current.some(
        (l) => l.cameraId === line.cameraId && l.startDate === line.startDate && l.endDate === line.endDate,
      );
      if (!duplicate) write([...current, line]);
    },
    remove(index: number) {
      write(getSnapshot().filter((_, i) => i !== index));
    },
    clear() {
      write([]);
    },
  };
}

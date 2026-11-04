"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export const STORAGE_KEY = "jsonviewer.pro.license.v1";
export const REVALIDATE_MS = 24 * 60 * 60_000;
const CHANGED = "jsonviewer-pro-changed";
type Saved = { key: string; valid: boolean; checkedAt: number };
export type LicenseError =
  | "invalid_key"
  | "network_error"
  | "not_configured"
  | "rate_limited"
  | "storage_unavailable";
export type Validation = { valid: boolean; error?: LicenseError };
function read(): Saved | null {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return data &&
      typeof data.key === "string" &&
      typeof data.valid === "boolean" &&
      Number.isFinite(data.checkedAt) &&
      data.checkedAt <= Date.now()
      ? data
      : null;
  } catch {
    return null;
  }
}
function fresh(saved: Saved | null) {
  return Boolean(saved?.valid && Date.now() - saved.checkedAt < REVALIDATE_MS);
}
const pending = new Map<string, Promise<Validation>>();
async function check(key: string): Promise<Validation> {
  const existing = pending.get(key);
  if (existing) return existing;
  const task = (async (): Promise<Validation> => {
    try {
      const response = await fetch("/api/license/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      const data = await response.json();
      if (data.error === "not_configured" || data.error === "rate_limited")
        return { valid: false, error: data.error };
      if (!response.ok || typeof data.valid !== "boolean")
        return { valid: false, error: "network_error" };
      return data.valid
        ? { valid: true }
        : { valid: false, error: "invalid_key" };
    } catch {
      return { valid: false, error: "network_error" };
    }
  })();
  pending.set(key, task);
  try {
    return await task;
  } finally {
    pending.delete(key);
  }
}
export function usePro() {
  const [isPro, setIsPro] = useState(false);
  const generation = useRef(0);
  const validateKey = useCallback(
    async (input: string): Promise<Validation> => {
      const key = input.trim();
      const current = ++generation.current;
      const result = key
        ? await check(key)
        : { valid: false, error: "invalid_key" as const };
      if (current !== generation.current) return result;
      try {
        if (result.valid)
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ key, valid: true, checkedAt: Date.now() })
          );
        else localStorage.removeItem(STORAGE_KEY);
      } catch {
        setIsPro(false);
        return { valid: false, error: "storage_unavailable" };
      }
      setIsPro(result.valid);
      window.dispatchEvent(new Event(CHANGED));
      return result;
    },
    []
  );
  const clearKey = useCallback(() => {
    generation.current++;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* still clear this session */
    }
    setIsPro(false);
    window.dispatchEvent(new Event(CHANGED));
  }, []);
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const sync = () => {
      generation.current++;
      clearTimeout(timer);
      const saved = read();
      setIsPro(fresh(saved));
      if (!saved) return;
      const delay = Math.max(
        0,
        saved.checkedAt + (saved.valid ? REVALIDATE_MS : 300_000) - Date.now()
      );
      timer = setTimeout(async () => {
        const revision = generation.current;
        const result = await check(saved.key);
        if (
          !alive ||
          revision !== generation.current ||
          read()?.key !== saved.key
        )
          return;
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              key: saved.key,
              valid: result.valid,
              checkedAt: Date.now(),
            })
          );
        } catch {
          setIsPro(false);
          return;
        }
        window.dispatchEvent(new Event(CHANGED));
      }, delay);
    };
    sync();
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(CHANGED, sync);
    return () => {
      alive = false;
      generation.current++;
      clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CHANGED, sync);
    };
  }, []);
  return { isPro, validateKey, clearKey };
}

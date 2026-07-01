"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAdminFetch<T>(url: string): {
  data: T | null;
  refresh: () => Promise<void>;
  loading: boolean;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (res.ok) {
        setData((await res.json()) as T);
      } else if (!controller.signal.aborted) {
        setData(null);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      if (!controller.signal.aborted) {
        setData(null);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    void refresh();

    return () => {
      abortRef.current?.abort();
    };
  }, [refresh]);

  return { data, refresh, loading };
}

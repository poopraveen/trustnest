"use client";

import { useCallback, useEffect, useState } from "react";
import {
  STORAGE_KEY,
  type VoterStatus,
} from "@/lib/ward-campaign";

export function useCampaignStore() {
  const [statuses, setStatuses] = useState<Record<string, VoterStatus>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStatuses(JSON.parse(raw));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  const persist = useCallback((next: Record<string, VoterStatus>) => {
    setStatuses(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setStatus = useCallback(
    (voterId: string, status: VoterStatus) => {
      setStatuses((prev) => {
        const next = { ...prev, [voterId]: status };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const getStatus = useCallback(
    (voterId: string): VoterStatus => statuses[voterId] ?? "unknown",
    [statuses]
  );

  const clearAll = useCallback(() => persist({}), [persist]);

  return { statuses, setStatus, getStatus, clearAll, ready };
}

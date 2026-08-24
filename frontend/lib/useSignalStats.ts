import { useMemo } from "react";
import { Signal } from "./signals";

export interface SignalStats {
  active: number;
  critical: number;
  monitored: number;
  total: number;
}

export function useSignalStats(filteredSignals: Signal[]): SignalStats {
  return useMemo(() => {
    let active = 0;
    let critical = 0;
    let monitored = 0;

    for (const signal of filteredSignals) {
      if (signal.status === "active") active++;
      if (signal.status === "critical" || signal.severity === "critical") critical++;
      if (signal.status === "monitored") monitored++;
    }

    return {
      active,
      critical,
      monitored,
      total: filteredSignals.length,
    };
  }, [filteredSignals]);
}

import signalsData from "@/data/signals.json";

export interface SignalLocation {
  city: string;
  state: string;
  lat: number;
  lng: number;
}

export interface SignalSource {
  name: string;
  url: string;
}

export type SignalCategory =
  | "Infrastructure"
  | "Environment"
  | "Public Safety"
  | "Utilities"
  | "Governance";

export type SignalSeverity = "critical" | "warning" | "info";
export type SignalStatus = "active" | "critical" | "monitored" | "resolved";

export interface Signal {
  id: string;
  title: string;
  description: string;
  category: SignalCategory;
  status: SignalStatus;
  severity: SignalSeverity;
  location: SignalLocation;
  date: string; // ISO 8601 string
  source: SignalSource;
}

export function getAllSignals(): Signal[] {
  return signalsData as Signal[];
}

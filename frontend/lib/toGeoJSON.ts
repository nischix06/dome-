import { Signal } from "./signals";

export interface SignalGeoJSONFeature {
  type: "Feature";
  id: string; // Used by MapLibre promoteId: "id"
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    severity: string;
    city: string;
    state: string;
    date: string;
    sourceName: string;
    sourceUrl: string;
  };
}

export interface SignalGeoJSONCollection {
  type: "FeatureCollection";
  features: SignalGeoJSONFeature[];
}

export function signalsToGeoJSON(signals: Signal[]): SignalGeoJSONCollection {
  return {
    type: "FeatureCollection",
    features: signals.map((signal) => ({
      type: "Feature",
      id: signal.id,
      geometry: {
        type: "Point",
        coordinates: [signal.location.lng, signal.location.lat],
      },
      properties: {
        id: signal.id,
        title: signal.title,
        description: signal.description,
        category: signal.category,
        status: signal.status,
        severity: signal.severity,
        city: signal.location.city,
        state: signal.location.state,
        date: signal.date,
        sourceName: signal.source.name,
        sourceUrl: signal.source.url,
      },
    })),
  };
}

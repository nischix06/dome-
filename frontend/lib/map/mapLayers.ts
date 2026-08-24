// ─────────────────────────────────────────────────────────────────────────────
// Dome GIS — Central Map Layer Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Represents a single color swatch + label inside a layer legend.
 */
export interface LegendItem {
  label: string;
  color: string;
}

/**
 * Optional legend configuration attached to a map layer.
 * Only rendered when the layer is both `available` AND visible.
 */
export interface LegendConfig {
  title: string;
  items: LegendItem[];
}

/**
 * Describes a single GIS overlay layer that Dome can visualise.
 *
 * Layers marked `available: false` are architectural placeholders — the UI
 * renders them in a disabled state with "DATA NOT CONNECTED" so real datasets
 * can be plugged in later without redesigning the map.
 */
export interface DomeMapLayer {
  /** Unique identifier, e.g. "landslide-risk" */
  id: string;
  /** Human-readable display name */
  label: string;
  /** Emoji icon shown in the layer panel */
  icon: string;
  /** Semantic layer category */
  type:
    | "risk"
    | "line"
    | "point"
    | "weather"
    | "terrain"
    | "population"
    | "boundary"
    | "basemap";
  /** How the data is supplied to MapLibre */
  sourceType: "geojson" | "raster" | "vector" | "api";
  /** Whether a real dataset is connected right now */
  available: boolean;
  /** Short description for tooltips / info */
  description: string;
  /** MapLibre source IDs that belong to this layer */
  mapSourceIds: string[];
  /** MapLibre layer IDs that belong to this layer */
  mapLayerIds: string[];
  /** Optional legend shown when the layer is visible */
  legend?: LegendConfig;
}

// ─────────────────────────────────────────────────────────────────────────────
// Layer Registry
// ─────────────────────────────────────────────────────────────────────────────

export const MAP_LAYERS: DomeMapLayer[] = [
  {
    id: "landslide-risk",
    label: "Landslide Risk",
    icon: "🌋",
    type: "risk",
    sourceType: "geojson",
    available: false,
    description:
      "Landslide susceptibility zones derived from geological and terrain analysis.",
    mapSourceIds: ["dome-landslide-source"],
    mapLayerIds: ["dome-landslide-layer"],
    legend: {
      title: "Landslide Risk",
      items: [
        { label: "Low", color: "#3fe0b0" },
        { label: "Moderate", color: "#ffaa00" },
        { label: "High", color: "#ff6b35" },
        { label: "Very High", color: "#ff4d4d" },
      ],
    },
  },
  {
    id: "roads-logistics",
    label: "Roads & Logistics",
    icon: "🛣️",
    type: "line",
    sourceType: "vector",
    available: false,
    description:
      "National and state highway network with logistics routing corridors.",
    mapSourceIds: ["dome-roads-source"],
    mapLayerIds: ["dome-roads-layer"],
  },
  {
    id: "emergency-resources",
    label: "Emergency Resources",
    icon: "🏥",
    type: "point",
    sourceType: "geojson",
    available: false,
    description:
      "Hospitals, fire stations, police stations, and disaster response centres.",
    mapSourceIds: ["dome-emergency-source"],
    mapLayerIds: ["dome-emergency-layer"],
  },
  {
    id: "rainfall-weather",
    label: "Rainfall & Weather",
    icon: "🌧️",
    type: "weather",
    sourceType: "api",
    available: false,
    description:
      "Real-time and forecast rainfall intensity from IMD / weather APIs.",
    mapSourceIds: ["dome-rainfall-source"],
    mapLayerIds: ["dome-rainfall-layer"],
    legend: {
      title: "Rainfall Intensity",
      items: [
        { label: "Light", color: "#6ec6ff" },
        { label: "Moderate", color: "#2196f3" },
        { label: "Heavy", color: "#0d47a1" },
        { label: "Very Heavy", color: "#b71c1c" },
      ],
    },
  },
  {
    id: "terrain",
    label: "Terrain",
    icon: "⛰️",
    type: "terrain",
    sourceType: "raster",
    available: false,
    description: "Digital elevation model with hillshade terrain visualisation.",
    mapSourceIds: ["dome-terrain-source"],
    mapLayerIds: ["dome-terrain-layer"],
  },
  {
    id: "population",
    label: "Population & Settlements",
    icon: "👥",
    type: "population",
    sourceType: "geojson",
    available: false,
    description:
      "Population density heatmap and settlement cluster boundaries.",
    mapSourceIds: ["dome-population-source"],
    mapLayerIds: ["dome-population-layer"],
    legend: {
      title: "Population Density",
      items: [
        { label: "Sparse", color: "#1a3a5c" },
        { label: "Low", color: "#2d6a9f" },
        { label: "Medium", color: "#ffaa00" },
        { label: "High", color: "#ff6b35" },
        { label: "Very High", color: "#ff4d4d" },
      ],
    },
  },
  {
    id: "administration",
    label: "Administration",
    icon: "🏛",
    type: "boundary",
    sourceType: "geojson",
    available: true,
    description:
      "State and union territory administrative boundaries of India.",
    mapSourceIds: ["dome-india-states", "dome-india-national-outline"],
    mapLayerIds: ["dome-india-state-boundaries", "dome-india-state-fills", "dome-india-national-boundary", "india-state-labels"],
  },
  {
    id: "satellite",
    label: "Satellite View",
    icon: "🛰",
    type: "basemap",
    sourceType: "raster",
    available: false,
    description:
      "High-resolution satellite imagery basemap (provider not connected).",
    mapSourceIds: [],
    mapLayerIds: [],
  },
];

/**
 * Returns the default visibility state for all layers.
 * Only `available` layers start as visible.
 */
export function getDefaultLayerStates(): Record<string, boolean> {
  const states: Record<string, boolean> = {};
  for (const layer of MAP_LAYERS) {
    states[layer.id] = layer.available;
  }
  return states;
}

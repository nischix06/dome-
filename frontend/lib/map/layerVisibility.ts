// ─────────────────────────────────────────────────────────────────────────────
// Dome GIS — MapLibre Layer Visibility Utility
// ─────────────────────────────────────────────────────────────────────────────

import type { Map as MapLibreInstance } from "maplibre-gl";

/**
 * Safely set the visibility of one or more MapLibre layers.
 *
 * Guards:
 * - Checks `map.isStyleLoaded()` before operating
 * - Checks `map.getLayer(layerId)` exists before calling
 * - No-ops silently if the layer does not exist yet (future layers)
 *
 * Uses `map.setLayoutProperty()` which is the correct MapLibre approach —
 * it does NOT remove/recreate sources or layers.
 */
export function setLayerVisibility(
  map: MapLibreInstance,
  layerIds: string[],
  visible: boolean
): void {
  if (!map.isStyleLoaded()) return;

  const value = visible ? "visible" : "none";

  for (const layerId of layerIds) {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", value);
    }
  }
}

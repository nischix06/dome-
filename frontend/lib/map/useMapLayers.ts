"use client";

import { useState, useCallback, useMemo } from "react";
import { MAP_LAYERS, getDefaultLayerStates } from "./mapLayers";

/**
 * React hook that manages GIS layer visibility state.
 *
 * Architecture:
 *   MapLayerControl (UI)
 *       ↓ toggleLayer / toggleAllLayers
 *   useMapLayers (state)
 *       ↓ layerStates
 *   IndiaMap (applies to MapLibre via layerVisibility utils)
 */
export function useMapLayers() {
  const [layerStates, setLayerStates] = useState<Record<string, boolean>>(
    getDefaultLayerStates
  );

  /**
   * Toggle a single layer on/off.
   * Only available layers can be toggled.
   */
  const toggleLayer = useCallback((id: string) => {
    const layer = MAP_LAYERS.find((l) => l.id === id);
    if (!layer || !layer.available) return;

    setLayerStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  /**
   * Master toggle: turn all available layers on or off.
   */
  const toggleAllLayers = useCallback((on: boolean) => {
    setLayerStates((prev) => {
      const next = { ...prev };
      for (const layer of MAP_LAYERS) {
        if (layer.available) {
          next[layer.id] = on;
        }
      }
      return next;
    });
  }, []);

  /**
   * Derived: are ALL available layers currently turned on?
   */
  const allLayersOn = useMemo(() => {
    return MAP_LAYERS.filter((l) => l.available).every(
      (l) => layerStates[l.id]
    );
  }, [layerStates]);

  /**
   * Helper: is a specific layer both available AND toggled on?
   */
  const isLayerVisible = useCallback(
    (id: string): boolean => {
      const layer = MAP_LAYERS.find((l) => l.id === id);
      if (!layer || !layer.available) return false;
      return !!layerStates[id];
    },
    [layerStates]
  );

  return {
    layerStates,
    toggleLayer,
    toggleAllLayers,
    allLayersOn,
    isLayerVisible,
  };
}

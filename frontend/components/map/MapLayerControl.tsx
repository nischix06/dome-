"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { MAP_LAYERS } from "@/lib/map/mapLayers";
import MapLayerItem from "./MapLayerItem";
import styles from "@/app/authenticated.module.css";

interface MapLayerControlProps {
  layerStates: Record<string, boolean>;
  allLayersOn: boolean;
  onToggleLayer: (id: string) => void;
  onToggleAll: (on: boolean) => void;
}

export default function MapLayerControl({
  layerStates,
  allLayersOn,
  onToggleLayer,
  onToggleAll,
}: MapLayerControlProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className={styles.layerToggleBtn}
        onClick={() => setExpanded((prev) => !prev)}
        title="Toggle layer panel"
      >
        <Layers size={16} />
      </button>

      {/* Panel */}
      {expanded && (
        <div className={styles.layerPanel}>
          {/* Header */}
          <div className={styles.layerPanelHeader}>
            <span className={styles.layerPanelTitle}>MAPS</span>
          </div>

          <div className={styles.layerSeparator} />

          {/* All Layers Toggle */}
          <button
            className={`${styles.layerItem} ${allLayersOn ? styles.layerItemActive : ""}`}
            onClick={() => onToggleAll(!allLayersOn)}
          >
            <span className={styles.layerItemIcon}>◉</span>
            <span className={styles.layerItemContent}>
              <span className={styles.layerItemLabel}>All Layers</span>
            </span>
            <span
              className={`${styles.layerRadio} ${allLayersOn ? styles.layerRadioActive : ""}`}
            />
          </button>

          <div className={styles.layerSeparator} />

          {/* Individual Layers */}
          {MAP_LAYERS.map((layer) => (
            <MapLayerItem
              key={layer.id}
              layer={layer}
              visible={!!layerStates[layer.id]}
              onToggle={onToggleLayer}
            />
          ))}
        </div>
      )}
    </>
  );
}

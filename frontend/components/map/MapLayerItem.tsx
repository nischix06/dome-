"use client";

import { DomeMapLayer } from "@/lib/map/mapLayers";
import styles from "@/app/authenticated.module.css";

interface MapLayerItemProps {
  layer: DomeMapLayer;
  visible: boolean;
  onToggle: (id: string) => void;
}

export default function MapLayerItem({
  layer,
  visible,
  onToggle,
}: MapLayerItemProps) {
  const isActive = layer.available && visible;
  const isDisabled = !layer.available;

  return (
    <button
      className={`${styles.layerItem} ${isActive ? styles.layerItemActive : ""} ${isDisabled ? styles.layerItemDisabled : ""}`}
      onClick={() => onToggle(layer.id)}
      title={layer.description}
      aria-pressed={isActive}
      aria-disabled={isDisabled}
    >
      <span className={styles.layerItemIcon}>{layer.icon}</span>
      <span className={styles.layerItemContent}>
        <span className={styles.layerItemLabel}>{layer.label}</span>
        {isDisabled && (
          <span className={styles.layerUnavailableTag}>DATA NOT CONNECTED</span>
        )}
      </span>
      {layer.available && (
        <span
          className={`${styles.layerRadio} ${isActive ? styles.layerRadioActive : ""}`}
        />
      )}
    </button>
  );
}

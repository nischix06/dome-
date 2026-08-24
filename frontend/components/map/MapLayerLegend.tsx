"use client";

import { MAP_LAYERS, DomeMapLayer } from "@/lib/map/mapLayers";
import styles from "@/app/authenticated.module.css";

interface MapLayerLegendProps {
  layerStates: Record<string, boolean>;
}

/**
 * Renders a small floating legend for any visible layer that has a
 * `legend` configuration AND is both `available` and toggled on.
 *
 * For now, no legends will display since only Administration is
 * available and it has no legend config. When future datasets are
 * connected (e.g. Landslide Risk), their legends will automatically
 * appear here.
 */
export default function MapLayerLegend({ layerStates }: MapLayerLegendProps) {
  // Find all layers that are available, visible, and have a legend
  const visibleLegends: DomeMapLayer[] = MAP_LAYERS.filter(
    (layer) => layer.available && layerStates[layer.id] && layer.legend
  );

  if (visibleLegends.length === 0) return null;

  return (
    <div className={styles.layerLegend}>
      {visibleLegends.map((layer) => (
        <div key={layer.id} className={styles.layerLegendSection}>
          <div className={styles.layerLegendTitle}>{layer.legend!.title}</div>
          {layer.legend!.items.map((item) => (
            <div key={item.label} className={styles.layerLegendItem}>
              <span
                className={styles.layerLegendSwatch}
                style={{ backgroundColor: item.color }}
              />
              <span className={styles.layerLegendLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

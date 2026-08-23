"use client";

import { Plus, Minus, Compass } from "lucide-react";
import styles from "@/app/authenticated.module.css";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onResetView,
}: MapControlsProps) {
  return (
    <div className={styles.mapControls}>
      <button className={styles.controlBtn} onClick={onZoomIn} title="Zoom In">
        <Plus size={16} />
      </button>
      <button className={styles.controlBtn} onClick={onZoomOut} title="Zoom Out">
        <Minus size={16} />
      </button>
      <button className={styles.controlBtn} onClick={onResetView} title="Reset View of India">
        <Compass size={16} />
      </button>
    </div>
  );
}

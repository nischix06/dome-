"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Signal } from "@/lib/signals";
import { X, MapPin, Calendar, ExternalLink, ShieldCheck, BellRing } from "lucide-react";
import styles from "@/app/authenticated.module.css";

interface DetailPanelProps {
  signal: Signal | null;
  onClose: () => void;
  userRole: "government" | "public";
  onAction?: (signalId: string) => void;
}

export default function DetailPanel({
  signal,
  onClose,
  userRole,
  onAction,
}: DetailPanelProps) {
  if (!signal) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " IST";
    } catch {
      return isoString;
    }
  };

  const getSeverityClass = (severity: string) => {
    if (severity === "critical") return styles.severityCritical;
    if (severity === "warning") return styles.severityWarning;
    return styles.severityInfo;
  };

  return (
    <AnimatePresence>
      <motion.div
        key={signal.id}
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 80 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className={styles.detailPanelDesktop}
      >
        {/* Header */}
        <div className={styles.detailHeader}>
          <div>
            <div className={styles.detailMetaId}>DOME SIGNAL // {signal.id}</div>
            <h3 className={styles.detailTitle}>{signal.title}</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close detail panel">
            <X size={18} />
          </button>
        </div>

        {/* Badges */}
        <div className={styles.badgeRow}>
          <span className={`${styles.categoryTag} ${getSeverityClass(signal.severity)}`}>
            {signal.severity.toUpperCase()}
          </span>
          <span className={styles.categoryTag}>{signal.category}</span>
          <span className={styles.categoryTag} style={{ textTransform: "uppercase" }}>
            {signal.status}
          </span>
        </div>

        {/* Location & Time */}
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>LOCATION & TIMESTAMP</div>
          <div className={styles.locationMeta}>
            <MapPin size={14} />
            <span>
              {signal.location.city}, {signal.location.state}
            </span>
          </div>
          <div className={styles.detailTimeMeta}>
            <Calendar size={12} />
            <span>{formatDate(signal.date)}</span>
            <span className={styles.coordMeta}>
              [{signal.location.lat.toFixed(4)}, {signal.location.lng.toFixed(4)}]
            </span>
          </div>
        </div>

        {/* Description */}
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>OBSERVATION SUMMARY</div>
          <p className={styles.detailValue}>{signal.description}</p>
        </div>

        {/* Source Reference */}
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>TELEMETRY SOURCE</div>
          <a
            href={signal.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            <span>{signal.source.name}</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Action Button */}
        {userRole === "government" ? (
          <button
            className={styles.actionBtn}
            onClick={() => onAction && onAction(signal.id)}
          >
            <ShieldCheck size={16} />
            <span>UPDATE OBSERVATION STATUS</span>
          </button>
        ) : (
          <button
            className={styles.actionBtn}
            onClick={() => onAction && onAction(signal.id)}
          >
            <BellRing size={16} />
            <span>SUBSCRIBE TO UPDATES</span>
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

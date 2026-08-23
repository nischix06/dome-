"use client";

import { motion } from "framer-motion";
import { SignalStats } from "@/lib/useSignalStats";
import styles from "@/app/authenticated.module.css";

interface StatsProps {
  stats: SignalStats;
}

export default function Stats({ stats }: StatsProps) {
  return (
    <div className={styles.statsOverlay}>
      {/* ACTIVE */}
      <div className={styles.statCard}>
        <span className={styles.statLabel}>ACTIVE</span>
        <motion.span
          key={`active-${stats.active}`}
          initial={{ scale: 1.2, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`${styles.statValue} ${styles.statValueActive}`}
        >
          {stats.active}
        </motion.span>
      </div>

      {/* CRITICAL */}
      <div className={styles.statCard}>
        <span className={styles.statLabel}>CRITICAL</span>
        <motion.span
          key={`critical-${stats.critical}`}
          initial={{ scale: 1.2, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`${styles.statValue} ${styles.statValueCritical}`}
        >
          {stats.critical}
        </motion.span>
      </div>

      {/* MONITORED */}
      <div className={styles.statCard}>
        <span className={styles.statLabel}>MONITORED</span>
        <motion.span
          key={`monitored-${stats.monitored}`}
          initial={{ scale: 1.2, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`${styles.statValue} ${styles.statValueMonitored}`}
        >
          {stats.monitored}
        </motion.span>
      </div>
    </div>
  );
}

"use client";

import styles from "@/app/authenticated.module.css";

interface HeroProps {
  activeCount: number;
}

export default function Hero({ activeCount }: HeroProps) {
  return (
    <div className={styles.heroOverlay}>
      <div className={styles.heroBrandRow}>
        <span className={styles.heroMainTitle}>DOME</span>
        <span className={styles.heroSubTitle}>OBSERVATION PLATFORM</span>
      </div>
      <p className={styles.heroDescription}>
        Real-time national incident intelligence.
      </p>
      <div className={styles.heroStatus}>
        <span className={styles.statusPulse} />
        <span>{activeCount} ACTIVE OBSERVATIONS</span>
      </div>
    </div>
  );
}

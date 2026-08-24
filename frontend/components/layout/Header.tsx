"use client";

import { StoredUser } from "@/lib/auth";
import { LogOut } from "lucide-react";
import styles from "@/app/authenticated.module.css";

interface HeaderProps {
  user: StoredUser;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const isGovernment = user.role === "government";

  return (
    <header className={styles.header}>
      <div className={styles.brandGroup}>
        <div className={styles.logoBadge}>D</div>
        <span className={styles.brandTitle}>DOME</span>
        <span className={styles.sihBadge}>SIH // COMMAND CENTER</span>
      </div>

      <div className={styles.userActions}>
        <div className={styles.roleTag}>
          <span className={styles.roleDot} />
          <span>{user.name}</span>
          <span className={styles.roleLabel}>
            {isGovernment ? "GOVERNMENT OFFICIAL" : "PUBLIC CITIZEN"}
          </span>
        </div>

        <button onClick={onLogout} className={styles.logoutBtn} title="Sign Out">
          <LogOut size={13} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

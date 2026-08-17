import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span>DOME</span>
        </div>
        <nav className={styles.navLinks}>
          <Link href="/login" className={styles.btnSecondary}>
            Login
          </Link>
          <Link href="/signup" className={styles.btnPrimary}>
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.badge}>Civic Intelligence Platform</div>
        <h1 className={styles.title}>
          Connecting Citizens with Responsive Government
        </h1>
        <p className={styles.subtitle}>
          Report civic issues, track real-time resolution progress, and empower
          transparent local governance with unified platform tracking.
        </p>

        <div className={styles.heroActions}>
          <Link
            href="/signup"
            className={`${styles.btnPrimary} ${styles.heroBtnLarge}`}
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className={`${styles.btnSecondary} ${styles.heroBtnLarge}`}
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Transparent Resolution</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>24/7</div>
            <div className={styles.statLabel}>Citizen Accessibility</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>Real-Time</div>
            <div className={styles.statLabel}>Status Tracking</div>
          </div>
        </div>
      </section>

      {/* How Dome Works */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How Dome Works</h2>
        <p className={styles.sectionSubtitle}>
          A seamless 4-step workflow connecting public reporting to government resolution.
        </p>

        <div className={styles.workflowGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Report</h3>
            <p className={styles.stepDesc}>
              Citizens log civic issues with location details and descriptions.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Review</h3>
            <p className={styles.stepDesc}>
              Smart verification routes tickets to the appropriate department.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Resolve</h3>
            <p className={styles.stepDesc}>
              Government officials verify and update progress directly on the panel.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>4</div>
            <h3 className={styles.stepTitle}>Track</h3>
            <p className={styles.stepDesc}>
              Live public tracking provides full transparency from start to finish.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} DOME Civic Intelligence Platform.</p>
        <div className={styles.footerLinks}>
          <Link href="/signup" className={styles.footerLink}>
            Sign Up
          </Link>
          <Link href="/login" className={styles.footerLink}>
            Login
          </Link>
          <Link href="/public" className={styles.footerLink}>
            Public Panel
          </Link>
          <Link href="/government" className={styles.footerLink}>
            Government Panel
          </Link>
        </div>
      </footer>
    </div>
  );
}

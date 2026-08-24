import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import {
  getStateProfile,
  getRainfallByState,
  getLandslidesByState,
  getInfrastructureByState,
  getHistoricalRainfall,
  getHistoricalInfrastructure,
  getAlertsByState,
  getIncidentsByState
} from "@/lib/dataService";
import {
  StateProfile,
  RainfallObservation,
  LandslideEvent,
  InfrastructureAsset,
  HistoricalRainfall,
  HistoricalInfrastructure,
  Alert
} from "@/lib/dataModel";
import { Signal } from "@/lib/signals";
import styles from "@/app/authenticated.module.css";

interface StateIntelligencePanelProps {
  stateName: string;
  onClose: () => void;
}

/* ─── Accordion section ─── */
function Section({ title, defaultOpen = false, children }: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.detailSection}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: 0, color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600,
          letterSpacing: "0.05em", textTransform: "uppercase" as const,
        }}
      >
        {title}
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div style={{ marginTop: "10px" }}>{children}</div>}
    </div>
  );
}

/* ─── Helpers ─── */
const NA = <span style={{ color: "#94a3b8", fontWeight: 400 }}>No prototype data available</span>;
const val = (v: string | number) => <span style={{ color: "#f8fafc", fontWeight: 500 }}>{v}</span>;
const label = (t: string) => <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{t}</div>;

export default function StateIntelligencePanel({ stateName, onClose }: StateIntelligencePanelProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StateProfile | null>(null);
  const [rainfall, setRainfall] = useState<RainfallObservation[]>([]);
  const [landslides, setLandslides] = useState<LandslideEvent[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfrastructureAsset[]>([]);
  const [historicalRainfall, setHistoricalRainfall] = useState<HistoricalRainfall[]>([]);
  const [historicalInfra, setHistoricalInfra] = useState<HistoricalInfrastructure[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Signal[]>([]);

  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line
    setLoading(true);

    async function fetchData() {
      try {
        const [p, r, l, i, hr, hi, a, inc] = await Promise.all([
          getStateProfile(stateName),
          getRainfallByState(stateName),
          getLandslidesByState(stateName),
          getInfrastructureByState(stateName),
          getHistoricalRainfall(stateName),
          getHistoricalInfrastructure(stateName),
          getAlertsByState(stateName),
          getIncidentsByState(stateName)
        ]);
        if (isMounted) {
          setProfile(p);
          setRainfall(r);
          setLandslides(l);
          setInfrastructure(i);
          setHistoricalRainfall(hr);
          setHistoricalInfra(hi);
          setAlerts(a);
          setIncidents(inc);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching state intelligence data", err);
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [stateName]);

  const getSeverityClass = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === "critical") return styles.severityCritical;
    if (s === "warning") return styles.severityWarning;
    return styles.severityInfo;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const panelAnimation: any = {
    initial: { opacity: 0, x: 80 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 80 },
    transition: { type: "spring", damping: 25, stiffness: 220 }
  };

  /* ─── Loading state ─── */
  if (loading || !profile) {
    return (
      <AnimatePresence>
        <motion.div {...panelAnimation} className={styles.detailPanelDesktop}>
          <div className={styles.detailHeader}>
            <div>
              <div className={styles.detailMetaId}>STATE INTELLIGENCE (PROTOTYPE DATA)</div>
              <h3 className={styles.detailTitle}>{stateName}</h3>
            </div>
            <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
          </div>
          <div className={styles.detailSection}>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              {loading ? "DATA LOADING..." : "DATA UNAVAILABLE"}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ─── Main panel ─── */
  return (
    <AnimatePresence>
      <motion.div {...panelAnimation} className={styles.detailPanelDesktop} style={{ overflowY: "auto" }}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <div>
            <div className={styles.detailMetaId}>STATE INTELLIGENCE (PROTOTYPE DATA)</div>
            <h3 className={styles.detailTitle}>{profile.name}</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Status badges */}
        <div className={styles.badgeRow}>
          <span className={`${styles.categoryTag} ${getSeverityClass(profile.overall_status)}`}>
            {profile.overall_status.toUpperCase()}
          </span>
          {incidents.length > 0 && (
            <span className={styles.categoryTag}>{incidents.length} Active Incidents</span>
          )}
        </div>

        {/* ── OVERVIEW (always visible) ── */}
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>OVERVIEW</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
            <div>
              {label("Rainfall")}
              {rainfall.length > 0 ? val(`${rainfall[0].precipitation_mm} mm`) : NA}
            </div>
            <div>
              {label("Landslide Events")}
              {landslides.length > 0 ? val(landslides.length) : NA}
            </div>
            <div>
              {label("Critical Infrastructure")}
              {infrastructure.length > 0 ? val(infrastructure.length) : NA}
            </div>
            <div>
              {label("Population")}
              {val(`${(profile.population / 1000000).toFixed(1)}M`)}
            </div>
          </div>
        </div>

        {/* ── LANDSLIDE RISK ── */}
        <Section title="Landslide Risk">
          {landslides.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div>{label("Recent Events")}{val(`${landslides.length} in last 30 days`)}</div>
              {landslides.slice(0, 3).map((ls, i) => (
                <div key={`ls-${i}`} style={{ padding: "6px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>Risk: {ls.risk_level}</div>
                </div>
              ))}
            </div>
          ) : NA}
        </Section>

        {/* ── RAINFALL & WEATHER ── */}
        <Section title="Rainfall & Weather">
          {rainfall.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div>{label("Current Rainfall")}{val(`${rainfall[0].precipitation_mm} mm`)}</div>
              {rainfall.length > 1 && rainfall.slice(1, 4).map((r, i) => (
                <div key={`rf-${i}`}>
                  {label(`Observation ${i + 2}`)}{val(`${r.precipitation_mm} mm`)}
                </div>
              ))}
            </div>
          ) : NA}
        </Section>

        {/* ── ROADS & LOGISTICS ── */}
        <Section title="Roads & Logistics">
          {infrastructure.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div>{label("Total Assets")}{val(infrastructure.length)}</div>
              {infrastructure.slice(0, 3).map((inf, i) => (
                <div key={`inf-${i}`} style={{ padding: "6px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>{inf.type} — {inf.status}</div>
                </div>
              ))}
            </div>
          ) : NA}
        </Section>

        {/* ── TERRAIN ── */}
        <Section title="Terrain">
          <div>
            {label("Terrain Classification")}
            <span style={{ color: "#94a3b8", fontWeight: 400 }}>Prototype / Reference</span>
          </div>
          <div style={{ marginTop: "6px" }}>
            {label("Area")}
            {val(`${profile.area_sqkm.toLocaleString()} sq km`)}
          </div>
          <div style={{ marginTop: "6px" }}>
            {label("Region")}
            {val(profile.region)}
          </div>
        </Section>

        {/* ── POPULATION & SETTLEMENTS ── */}
        <Section title="Population & Settlements">
          <div>{label("Total Population")}{val(`${(profile.population / 1000000).toFixed(1)}M`)}</div>
          <div style={{ marginTop: "6px" }}>{label("Capital")}{val(profile.capital)}</div>
          <div style={{ marginTop: "6px" }}>
            {label("Settlement Exposure")}
            <span style={{ color: "#94a3b8", fontWeight: 400 }}>Prototype / Reference</span>
          </div>
        </Section>

        {/* ── HISTORICAL ── */}
        <Section title="Historical">
          {historicalRainfall.length === 0 && historicalInfra.length === 0 ? NA : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {historicalRainfall.length > 0 && (
                <div>
                  {label("Rainfall History")}
                  {historicalRainfall.map((hr, i) => (
                    <div key={`hr-${i}`} style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{hr.year}</span>
                      {val(`${hr.average_mm} mm`)}
                    </div>
                  ))}
                </div>
              )}
              {historicalInfra.length > 0 && (
                <div style={{ marginTop: "6px" }}>
                  {label("Infrastructure Uptime")}
                  {historicalInfra.map((hi, i) => (
                    <div key={`hi-${i}`} style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{hi.period_value}</span>
                      {val(`${hi.uptime_percentage}%`)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Section>

        {/* ── ACTIVE ALERTS ── */}
        <Section title="Active Alerts" defaultOpen={alerts.length > 0}>
          {alerts.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {alerts.map((alt) => (
                <div key={alt.id} style={{ padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className={`${styles.categoryTag} ${getSeverityClass(alt.severity)}`} style={{ marginBottom: "6px", display: "inline-block" }}>
                    {alt.type.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{alt.message}</div>
                </div>
              ))}
            </div>
          ) : (
            <span style={{ color: "#94a3b8", fontWeight: 400 }}>No active alerts</span>
          )}
        </Section>

      </motion.div>
    </AnimatePresence>
  );
}
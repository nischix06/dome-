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
        <span>{title}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div style={{ marginTop: "10px" }}>{children}</div>}
    </div>
  );
}

/* ─── UI Helpers ─── */
const NA = <span style={{ color: "#94a3b8", fontWeight: 400 }}>N/A</span>;
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
    if (s === "critical" || s === "severe" || s === "very high") return styles.severityCritical;
    if (s === "warning" || s === "high") return styles.severityWarning;
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
              <div className={styles.detailMetaId}>STATE INTELLIGENCE</div>
              <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.05em" }}>PROTOTYPE DATA</div>
              <h3 className={styles.detailTitle}>{stateName}</h3>
            </div>
            <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
          </div>
          <div className={styles.detailSection}>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              {loading ? "LOADING INTELLIGENCE PROFILE..." : "N/A"}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Calculate population at risk dynamically
  const riskRatio = profile.overall_status === "Critical" ? 0.045 : profile.overall_status === "Warning" ? 0.018 : 0.004;
  const popAtRiskNum = (profile.population * riskRatio) / 1000000;
  const popAtRisk = popAtRiskNum.toFixed(2);

  // Anomaly calculation
  const anomalyPercent = historicalRainfall.length > 0 ? historicalRainfall[0].anomaly_percent : null;
  const anomalyText = anomalyPercent !== null
    ? `${anomalyPercent > 0 ? "+" : ""}${anomalyPercent}% vs normal`
    : null;

  // Degraded assets
  const degradedCount = infrastructure.filter(inf => inf.status === "degraded" || inf.status === "offline").length;

  // Hilly classification
  const isHilly = profile.region === "Northeast" || profile.region === "North";

  // Qualitative Risk Profile Levels
  const precipMM = rainfall.length > 0 ? rainfall[0].precipitation_mm : 0;
  const rainfallRiskLevel = precipMM > 100 ? "VERY HIGH" : precipMM > 70 ? "HIGH" : precipMM > 40 ? "MODERATE" : "LOW";
  const landslideRiskLevel = landslides.length >= 4 ? "VERY HIGH" : landslides.length >= 2 ? "HIGH" : landslides.length === 1 ? "MODERATE" : "LOW";
  const infraRiskLevel = degradedCount > 0 ? "HIGH" : infrastructure.length >= 3 ? "MODERATE" : "LOW";
  const popRiskLevel = popAtRiskNum >= 2.0 ? "VERY HIGH" : popAtRiskNum >= 0.8 ? "HIGH" : popAtRiskNum >= 0.2 ? "MODERATE" : "LOW";

  // Generate Risk Explanation Bullet Points Deterministically
  const isAtRisk = profile.overall_status === "Critical" || profile.overall_status === "Warning";
  const bullets: string[] = [];

  if (isAtRisk) {
    if (anomalyPercent !== null && anomalyPercent > 0) {
      bullets.push(`Rainfall is ${anomalyPercent}% above normal (${precipMM} mm)`);
    } else if (rainfall.length > 0) {
      bullets.push(`Rainfall intensity recorded at ${precipMM} mm`);
    }

    if (landslides.length > 0) {
      bullets.push(`${landslides.length} landslide event${landslides.length > 1 ? "s" : ""} in the last 30 days`);
    } else if (isHilly) {
      bullets.push(`Mountainous terrain elevates geological vulnerability`);
    }

    if (degradedCount > 0) {
      bullets.push(`${degradedCount} critical infrastructure asset${degradedCount > 1 ? "s" : ""} degraded or exposed`);
    } else if (infrastructure.length > 0) {
      bullets.push(`${infrastructure.length} critical infrastructure assets monitored in risk zones`);
    }

    bullets.push(`${popAtRisk}M people in affected zones`);

    if (alerts.length > 0) {
      bullets.push(`${alerts.length} active emergency alert${alerts.length > 1 ? "s" : ""} in effect`);
    }
  } else {
    bullets.push("Rainfall within normal seasonal range");
    bullets.push("No significant landslide activity");
    bullets.push("No active infrastructure disruption");
    bullets.push("Population exposure within baseline safety bounds");
    if (alerts.length === 0) {
      bullets.push("No active emergency alerts");
    }
  }

  /* ─── Main panel ─── */
  return (
    <AnimatePresence key={stateName}>
      <motion.div {...panelAnimation} className={styles.detailPanelDesktop} style={{ overflowY: "auto" }}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <div>
            <div className={styles.detailMetaId}>STATE INTELLIGENCE</div>
            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.05em" }}>PROTOTYPE DATA</div>
            <h3 className={styles.detailTitle}>{profile.name}</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Status badges */}
        <div className={styles.badgeRow} style={{ marginTop: "10px", marginBottom: "15px" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
            <div>
              {label("Rainfall")}
              {rainfall.length > 0 ? (
                <div>
                  {val(`${rainfall[0].precipitation_mm} mm`)}
                  {anomalyText && <div style={{ fontSize: "0.7rem", color: "#3fe0b0" }}>{anomalyText}</div>}
                </div>
              ) : NA}
            </div>
            <div>
              {label("Landslide Events")}
              {val(landslides.length > 0 ? landslides.length : 0)}
              {landslides.length > 0 && <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Last 30 days</div>}
            </div>
            <div>
              {label("Critical Infrastructure")}
              {val(infrastructure.length > 0 ? infrastructure.length : 0)}
            </div>
            <div>
              {label("Population at Risk")}
              {val(`${popAtRisk}M`)}
            </div>
          </div>
        </div>

        {/* ── STEP 1: WHY THIS STATE IS AT RISK / CURRENT RISK DRIVERS ── */}
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>
            {isAtRisk ? "WHY THIS STATE IS AT RISK" : "CURRENT RISK DRIVERS"}
          </div>
          <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {bullets.map((bullet, idx) => (
              <div key={`b-${idx}`} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.8rem", color: "#cbd5e1" }}>
                <span style={{ color: isAtRisk ? "#ffaa00" : "#3fe0b0", fontSize: "0.9rem", lineHeight: 1 }}>●</span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 2: RISK PROFILE ── */}
        <div className={styles.detailSection}>
          <div className={styles.detailSectionLabel}>RISK PROFILE</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }}>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Rainfall</span>
              <span className={`${styles.categoryTag} ${getSeverityClass(rainfallRiskLevel)}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>{rainfallRiskLevel}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }}>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Landslides</span>
              <span className={`${styles.categoryTag} ${getSeverityClass(landslideRiskLevel)}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>{landslideRiskLevel}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }}>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Infrastructure</span>
              <span className={`${styles.categoryTag} ${getSeverityClass(infraRiskLevel)}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>{infraRiskLevel}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }}>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Population</span>
              <span className={`${styles.categoryTag} ${getSeverityClass(popRiskLevel)}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>{popRiskLevel}</span>
            </div>
          </div>
        </div>

        {/* ── LANDSLIDE RISK ── */}
        <Section title="Landslide Risk">
          {landslides.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div>{label("Recent Events")}{val(`${landslides.length} events recorded`)}</div>
              {landslides.map((ls, i) => (
                <div key={`ls-${i}`} style={{ padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: 500 }}>
                    Risk Level: <span className={`${styles.categoryTag} ${getSeverityClass(ls.risk_level)}`} style={{ padding: "2px 6px", fontSize: "0.65rem" }}>{ls.risk_level.toUpperCase()}</span>
                  </div>
                  {ls.description && <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>{ls.description}</div>}
                </div>
              ))}
            </div>
          ) : (
            <span style={{ color: "#94a3b8", fontWeight: 400 }}>No recorded events</span>
          )}
        </Section>

        {/* ── RAINFALL & WEATHER ── */}
        <Section title="Rainfall & Weather">
          {rainfall.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div>{label("Current Precipitation")}{val(`${rainfall[0].precipitation_mm} mm`)}</div>
              <div>{label("Humidity")}{val(`${rainfall[0].humidity_percent}%`)}</div>
              {rainfall.length > 1 && (
                <div style={{ marginTop: "4px" }}>
                  {label("Additional Stations")}
                  {rainfall.slice(1).map((r, i) => (
                    <div key={`rf-${i}`} style={{ fontSize: "0.8rem", color: "#cbd5e1", marginTop: "2px" }}>
                      Station {i + 2}: {r.precipitation_mm} mm ({r.humidity_percent}% humidity)
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : NA}
        </Section>

        {/* ── ROADS & LOGISTICS ── */}
        <Section title="Roads & Logistics">
          {infrastructure.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div>{label("Critical Assets")}{val(`${infrastructure.length} monitored assets`)}</div>
              {infrastructure.map((inf, i) => (
                <div key={`inf-${i}`} style={{ padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.8rem", color: "#f8fafc", fontWeight: 500 }}>{inf.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    <span>Type: {inf.type.replace("_", " ")}</span>
                    <span style={{ color: inf.status === "degraded" ? "#ffaa00" : "#3fe0b0" }}>{inf.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : NA}
        </Section>

        {/* ── TERRAIN ── */}
        <Section title="Terrain">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>{label("Area")}{val(`${profile.area_sqkm.toLocaleString()} sq km`)}</div>
            <div>{label("Region")}{val(profile.region)}</div>
          </div>
          <div style={{ marginTop: "8px" }}>
            {label("Terrain Exposure")}
            <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "0.8rem" }}>
              {isHilly ? "Mountainous / High Susceptibility" : "Plateau / Coastal Corridor"}
            </span>
          </div>
        </Section>

        {/* ── POPULATION & SETTLEMENTS ── */}
        <Section title="Population & Settlements">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>{label("Total Population")}{val(`${(profile.population / 1000000).toFixed(1)}M`)}</div>
            <div>{label("Capital")}{val(profile.capital)}</div>
          </div>
          <div style={{ marginTop: "8px" }}>
            {label("High Density Exposure")}
            {val(`${popAtRisk}M estimated at risk`)}
          </div>
        </Section>

        {/* ── HISTORICAL ── */}
        <Section title="Historical">
          {historicalRainfall.length === 0 && historicalInfra.length === 0 ? (
            <span style={{ color: "#94a3b8", fontWeight: 400 }}>No historical data available</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {historicalRainfall.length > 0 && (
                <div>
                  {label("Historical Rainfall Mean")}
                  {historicalRainfall.map((hr, i) => (
                    <div key={`hr-${i}`} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginTop: "4px" }}>
                      <span style={{ color: "#94a3b8" }}>{hr.year}</span>
                      {val(`${hr.average_mm} mm (${hr.anomaly_percent > 0 ? "+" : ""}${hr.anomaly_percent}%)`)}
                    </div>
                  ))}
                </div>
              )}
              {historicalInfra.length > 0 && (
                <div>
                  {label("Infrastructure Uptime History")}
                  {historicalInfra.map((hi, i) => (
                    <div key={`hi-${i}`} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginTop: "4px" }}>
                      <span style={{ color: "#94a3b8" }}>{hi.period_value}</span>
                      {val(`${hi.uptime_percentage}% uptime`)}
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
            <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "0.8rem" }}>NO ACTIVE ALERTS</span>
          )}
        </Section>

      </motion.div>
    </AnimatePresence>
  );
}
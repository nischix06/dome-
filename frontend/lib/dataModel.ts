import { Signal } from "./signals";

/**
 * Normalized Prototype Data Architecture for DOME
 * 
 * This model is designed to support state-level aggregation and thematic data panels.
 * It is currently powered by static prototype datasets but is architected to be 
 * easily swapped out for live REST/GraphQL APIs.
 */

// We alias the existing Signal interface to Incident to avoid duplicating structures,
// as they represent the same underlying event/observation concept in DOME.
export type Incident = Signal;

export interface StateProfile {
  id: string;
  name: string;
  region: "North" | "South" | "East" | "West" | "Central" | "Northeast";
  population: number;
  area_sqkm: number;
  capital: string;
  overall_status: "Nominal" | "Warning" | "Critical";
  active_alerts_count: number;
  last_updated: string; // ISO 8601
}

export interface Alert {
  id: string;
  type: "weather" | "security" | "infrastructure";
  severity: "info" | "warning" | "critical";
  affected_states: string[]; // Maps to StateProfile.name
  message: string;
  issued_at: string; // ISO 8601
  expires_at: string; // ISO 8601
}

export interface RainfallObservation {
  station_id: string;
  state: string; // Maps to StateProfile.name
  lat: number;
  lng: number;
  recorded_at: string; // ISO 8601
  precipitation_mm: number;
  humidity_percent: number;
}

export interface LandslideEvent {
  id: string;
  state: string; // Maps to StateProfile.name
  lat: number;
  lng: number;
  risk_level: "low" | "medium" | "high" | "severe";
  reported_at: string; // ISO 8601
  description?: string;
}

export interface InfrastructureAsset {
  id: string;
  type: "bridge" | "power_station" | "dam" | "highway" | "telecom_tower";
  name: string;
  state: string; // Maps to StateProfile.name
  lat: number;
  lng: number;
  status: "operational" | "degraded" | "offline" | "maintenance";
  last_inspected: string; // ISO 8601
}

export interface HistoricalRainfall {
  state: string; // Maps to StateProfile.name
  year: number;
  month: number;
  average_mm: number;
  anomaly_percent: number; // Percentage deviation from 10-year mean
}

export interface HistoricalInfrastructure {
  state: string; // Maps to StateProfile.name
  period: "month" | "quarter" | "year";
  period_value: string; // e.g., "2026-Q3"
  uptime_percentage: number;
  incidents_count: number;
  maintenance_spend_lakhs?: number;
}
import prototypeData from "@/data/prototypeStateData.json";
import {
  StateProfile,
  Alert,
  RainfallObservation,
  LandslideEvent,
  InfrastructureAsset,
  HistoricalRainfall,
  HistoricalInfrastructure,
} from "./dataModel";
import { Signal, getAllSignals } from "./signals";

/**
 * Data Service Abstraction for DOME Prototype
 * 
 * This service acts as the data flow layer. Currently, it serves static
 * JSON prototype data and the existing signals dataset.
 * 
 * In a future phase, these methods will be replaced with fetch() calls 
 * to the live DOME API backend.
 */

// 1. Core State Profiles
export async function getStateProfile(stateName: string): Promise<StateProfile | null> {
  // Prototype: Filter from local JSON
  const profile = prototypeData.StateProfile.find((p) => p.name === stateName);
  return (profile as StateProfile) || null;
}

// 2. Incident/Signal Aggregation
export async function getIncidentsByState(stateName: string): Promise<Signal[]> {
  // Uses existing signals source, dynamically filtered by state
  const allSignals = getAllSignals();
  return allSignals.filter(
    (s) => s.location.state.toLowerCase() === stateName.toLowerCase()
  );
}

// 3. Thematic Alert Data
export async function getAlertsByState(stateName: string): Promise<Alert[]> {
  return (prototypeData.Alert as Alert[]).filter((alt) =>
    alt.affected_states.includes(stateName)
  );
}

// 4. Observations (Rainfall, Landslides)
export async function getRainfallByState(stateName: string): Promise<RainfallObservation[]> {
  return (prototypeData.RainfallObservation as RainfallObservation[]).filter(
    (obs) => obs.state === stateName
  );
}

export async function getLandslidesByState(stateName: string): Promise<LandslideEvent[]> {
  return (prototypeData.LandslideEvent as LandslideEvent[]).filter(
    (ls) => ls.state === stateName
  );
}

// 5. Infrastructure
export async function getInfrastructureByState(stateName: string): Promise<InfrastructureAsset[]> {
  return (prototypeData.InfrastructureAsset as InfrastructureAsset[]).filter(
    (asset) => asset.state === stateName
  );
}

// 6. Historical Data
export async function getHistoricalRainfall(stateName: string): Promise<HistoricalRainfall[]> {
  return (prototypeData.HistoricalRainfall as HistoricalRainfall[]).filter(
    (hr) => hr.state === stateName
  );
}

export async function getHistoricalInfrastructure(stateName: string): Promise<HistoricalInfrastructure[]> {
  return (prototypeData.HistoricalInfrastructure as HistoricalInfrastructure[]).filter(
    (hi) => hi.state === stateName
  );
}
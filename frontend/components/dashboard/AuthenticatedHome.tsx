"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StoredUser, logout } from "@/lib/auth";

import Header from "@/components/layout/Header";
import Hero from "@/components/dashboard/Hero";
import FilterBar from "@/components/filters/FilterBar";
import Stats from "@/components/dashboard/Stats";
import dynamic from "next/dynamic";
import MapLayerControl from "@/components/map/MapLayerControl";

const IndiaMap = dynamic(() => import("@/components/map/IndiaMap"), {
  ssr: false,
});
import MapLayerLegend from "@/components/map/MapLayerLegend";
import DetailPanel from "@/components/dashboard/DetailPanel";

import StateIntelligencePanel from "@/components/dashboard/StateIntelligencePanel";

import { useFilteredSignals } from "@/lib/useFilteredSignals";
import { useSignalStats } from "@/lib/useSignalStats";
import { useMapLayers } from "@/lib/map/useMapLayers";
import { Signal } from "@/lib/signals";

import styles from "@/app/authenticated.module.css";

interface AuthenticatedHomeProps {
  user: StoredUser;
}

export default function AuthenticatedHome({ user }: AuthenticatedHomeProps) {
  const router = useRouter();

  const {
    filteredSignals,
    geoJSON,
    timeFilter,
    setTimeFilter,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    activeCount,
  } = useFilteredSignals();

  const stats = useSignalStats(filteredSignals);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [selectedStateName, setSelectedStateName] = useState<string | null>(null);

  const {
    layerStates,
    toggleLayer,
    toggleAllLayers,
    allLayersOn,
  } = useMapLayers();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleAction = (signalId: string) => {
    alert(
      user.role === "government"
        ? `[SIH DISPATCH] Official status update logged for observation ${signalId}.`
        : `[SIH SUBSCRIPTION] Subscribed to real-time status notifications for observation ${signalId}.`
    );
  };

  return (
    <div className={styles.container}>
      {/* 1. Header */}
      <Header user={user} onLogout={handleLogout} />

      {/* 2. Subdued Map Canvas */}
      <IndiaMap
        geoJSON={geoJSON}
        signals={filteredSignals}
        selectedSignal={selectedSignal}
        onSelectSignal={setSelectedSignal}
        selectedStateName={selectedStateName}
        onSelectState={setSelectedStateName}
        layerStates={layerStates}
      />

      {/* 3. Compact Product Hero Banner */}
      <Hero activeCount={activeCount} />

      {/* 4. GIS Layer Control Panel */}
      <MapLayerControl
        layerStates={layerStates}
        allLayersOn={allLayersOn}
        onToggleLayer={toggleLayer}
        onToggleAll={toggleAllLayers}
      />

      {/* 5. Layer Legend (only shows when a legend-bearing layer is visible) */}
      <MapLayerLegend layerStates={layerStates} />

      {/* 6. Cohesive Search & Filter Panel */}
      <FilterBar
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 7. Statistics Overview */}
      <Stats stats={stats} />

      {/* 8. Interactive Detail Panel */}
      <DetailPanel
        signal={selectedSignal}
        onClose={() => setSelectedSignal(null)}
        userRole={user.role}
        onAction={handleAction}
      />

      {/* 9. State Intelligence Panel */}
      {selectedStateName && (
        <StateIntelligencePanel 
          stateName={selectedStateName} 
          onClose={() => setSelectedStateName(null)} 
        />
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import { getAllSignals } from "./signals";
import { isWithinTimeRange, TimeRangeFilter } from "./dateRanges";
import { signalsToGeoJSON, SignalGeoJSONCollection } from "./toGeoJSON";

export function useFilteredSignals() {
  const allSignals = useMemo(() => getAllSignals(), []);

  const [timeFilter, setTimeFilter] = useState<TimeRangeFilter>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredSignals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allSignals.filter((signal) => {
      // 1. Time filter check
      if (!isWithinTimeRange(signal.date, timeFilter)) {
        return false;
      }
      // 2. Category filter check
      if (selectedCategory !== "ALL" && signal.category.toUpperCase() !== selectedCategory.toUpperCase()) {
        return false;
      }
      // 3. Search query check
      if (query) {
        const matchId = signal.id.toLowerCase().includes(query);
        const matchTitle = signal.title.toLowerCase().includes(query);
        const matchCity = signal.location.city.toLowerCase().includes(query);
        const matchState = signal.location.state.toLowerCase().includes(query);
        const matchCategory = signal.category.toLowerCase().includes(query);

        if (!matchId && !matchTitle && !matchCity && !matchState && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [allSignals, timeFilter, selectedCategory, searchQuery]);

  const geoJSON = useMemo<SignalGeoJSONCollection>(() => {
    return signalsToGeoJSON(filteredSignals);
  }, [filteredSignals]);

  const activeCount = useMemo(() => {
    return filteredSignals.filter(
      (s) => s.status === "active" || s.status === "critical"
    ).length;
  }, [filteredSignals]);

  return {
    allSignals,
    filteredSignals,
    geoJSON,
    timeFilter,
    setTimeFilter,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    activeCount,
  };
}

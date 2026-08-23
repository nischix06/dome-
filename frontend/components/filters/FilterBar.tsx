"use client";

import { TimeRangeFilter } from "@/lib/dateRanges";
import { Search, X } from "lucide-react";
import styles from "@/app/authenticated.module.css";

interface FilterBarProps {
  timeFilter: TimeRangeFilter;
  onTimeFilterChange: (filter: TimeRangeFilter) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CATEGORIES = [
  "ALL",
  "INFRASTRUCTURE",
  "PUBLIC SAFETY",
  "UTILITIES",
  "ENVIRONMENT",
  "GOVERNANCE",
];

export default function FilterBar({
  timeFilter,
  onTimeFilterChange,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className={styles.filterOverlay}>
      {/* 1. Time Filters & Search Input */}
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterBtn} ${timeFilter === "TODAY" ? styles.filterBtnActive : ""}`}
            onClick={() => onTimeFilterChange("TODAY")}
          >
            TODAY
          </button>
          <button
            className={`${styles.filterBtn} ${timeFilter === "48H" ? styles.filterBtnActive : ""}`}
            onClick={() => onTimeFilterChange("48H")}
          >
            48 HOURS
          </button>
          <button
            className={`${styles.filterBtn} ${timeFilter === "ALL" ? styles.filterBtnActive : ""}`}
            onClick={() => onTimeFilterChange("ALL")}
          >
            ALL TIME
          </button>
        </div>

        {/* Search Input */}
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search city, ID, title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className={styles.clearSearchBtn}
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Chips */}
      <div className={styles.categoryChips}>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`${styles.chip} ${
              selectedCategory.toUpperCase() === category ? styles.chipActive : ""
            }`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

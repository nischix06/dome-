"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreInstance, MapLayerMouseEvent, MapGeoJSONFeature, GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Explicitly set the worker URL to the Next.js static asset, avoiding relative route resolution
if (typeof window !== "undefined") {
  maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
}

import { SignalGeoJSONCollection } from "@/lib/toGeoJSON";
import { INDIA_BOUNDARIES_GEOJSON } from "@/lib/indiaGeoJSON";
import { DERIVED_NATIONAL_OUTLINE } from "@/lib/derivedNationalOutline";
import { Signal } from "@/lib/signals";
import { setLayerVisibility } from "@/lib/map/layerVisibility";
import { MAP_LAYERS } from "@/lib/map/mapLayers";
import MapControls from "./MapControls";
import styles from "@/app/authenticated.module.css";

interface GeoJSONCoords {
  features?: {
    geometry?: {
      type: string;
      coordinates: unknown;
    };
  }[];
}

function getGeoJSONBounds(geojson: GeoJSONCoords): [[number, number], [number, number]] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  if (geojson && geojson.features) {
    for (const feature of geojson.features) {
      if (!feature.geometry || !feature.geometry.coordinates) continue;

      const processCoords = (coords: unknown) => {
        if (Array.isArray(coords)) {
          if (typeof coords[0] === "number" && typeof coords[1] === "number") {
            const lng = coords[0];
            const lat = coords[1];
            if (lng < minLng) minLng = lng;
            if (lat < minLat) minLat = lat;
            if (lng > maxLng) maxLng = lng;
            if (lat > maxLat) maxLat = lat;
          } else {
            for (const coord of coords) {
              processCoords(coord);
            }
          }
        }
      };

      processCoords(feature.geometry.coordinates);
    }
  }

  if (minLng === Infinity || minLat === Infinity) {
    return [[68.0, 6.0], [97.5, 37.0]];
  }

  return [[minLng, minLat], [maxLng, maxLat]];
}

interface IndiaMapProps {
  geoJSON: SignalGeoJSONCollection;
  signals: Signal[];
  selectedSignal: Signal | null;
  onSelectSignal: (signal: Signal | null) => void;
  layerStates: Record<string, boolean>;
}

const INDIA_CENTER: [number, number] = [79.0, 22.0];
const INITIAL_ZOOM = 5.5;
const INDIA_BOUNDS: [[number, number], [number, number]] = [[60.0, -5.0], [105.0, 42.0]];

// Exact working CARTO Dark Raster Style specification with NO labels or political boundaries in raster tiles
const DARK_RASTER_BASEMAP = {
  version: 8,
  name: "Dome Command Center Dark Raster",
  sources: {
    "carto-dark-raster": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; CARTO &copy; OpenStreetMap",
    },
  },
  layers: [
    {
      id: "carto-dark-layer",
      type: "raster",
      source: "carto-dark-raster",
      minzoom: 0,
      maxzoom: 20,
      paint: {
        "raster-opacity": 0.65,
      },
    },
  ],
};

export default function IndiaMap({
  geoJSON,
  signals,
  selectedSignal,
  onSelectSignal,
  layerStates,
}: IndiaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreInstance | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [styleLoaded, setStyleLoaded] = useState<boolean>(false);
  const hoverSignalIdRef = useRef<string | null>(null);
  const selectedSignalIdRef = useRef<string | null>(null);

  const logDebug = (msg: string) => {
    console.log("[MapDebug] " + msg);
  };

  const geoJSONRef = useRef(geoJSON);
  const signalsRef = useRef(signals);
  const onSelectSignalRef = useRef(onSelectSignal);

  useEffect(() => {
    geoJSONRef.current = geoJSON;
    signalsRef.current = signals;
    onSelectSignalRef.current = onSelectSignal;
  });

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `UNCAUGHT WINDOW ERROR: ${e.message} at ${e.filename}:${e.lineno}:${e.colno}` })
      }).catch(() => {});
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `UNHANDLED REJECTION: ${e.reason?.message || String(e.reason)}` })
      }).catch(() => {});
    };
    const handleCSP = (e: SecurityPolicyViolationEvent) => {
      fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `CSP VIOLATION: violatedDirective=${e.violatedDirective}, blockedURI=${e.blockedURI}, originalPolicy=${e.originalPolicy}` })
      }).catch(() => {});
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("securitypolicyviolation", handleCSP);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("securitypolicyviolation", handleCSP);
    };
  }, []);

  // Initialize MapLibre instance once on mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    logDebug("Map Init started");
    setStyleLoaded(false);



    console.log("[MapLibre] Initializing with restored CARTO Dark Raster Basemap...");

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: DARK_RASTER_BASEMAP as unknown as maplibregl.StyleSpecification,
      center: INDIA_CENTER,
      zoom: INITIAL_ZOOM,
      minZoom: 3.5,
      maxZoom: 14,
      maxBounds: INDIA_BOUNDS,
      pitchWithRotate: false,
      dragRotate: false,
      attributionControl: false,
    });

    map.setMaxBounds(INDIA_BOUNDS);
    console.log("MAP INITIAL MAX BOUNDS:", map.getMaxBounds());

    mapRef.current = map;

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    map.on("load", () => {
      logDebug("Map load event fired");
      map.resize();

      logDebug("Fitting map bounds dynamically to India geometry...");
      const indiaGeoBounds = getGeoJSONBounds(INDIA_BOUNDARIES_GEOJSON as unknown as GeoJSONCoords);
      logDebug("Calculated geometry bounds: " + JSON.stringify(indiaGeoBounds));

      map.fitBounds(
        indiaGeoBounds,
        {
          padding: 80,
          maxZoom: 3.8,
          duration: 0
        }
      );

      logDebug("Runtime Center: " + JSON.stringify(map.getCenter()));
      logDebug("Runtime Zoom: " + map.getZoom());
    });

    map.on("error", (e) => {
      const err = e as unknown as Record<string, unknown>;
      const errMsg = typeof err.message === "string" ? err.message : "Unknown error";
      logDebug("Map error event: " + errMsg);
      console.error("[MapLibre] Map error event:", e);
    });

    // Lifecycle handler: style.load
    const handleStyleLoad = () => {
      setStyleLoaded(true);
      logDebug("Event 'style.load' fired successfully.");

      // Verify the GeoJSON geometry before adding
      logDebug("INDIA STATES FEATURES: " + INDIA_BOUNDARIES_GEOJSON.features.length);

      // Add CARTO Geographic Labels Overlay
      if (!map.getSource("carto-geographic-labels")) {
        map.addSource("carto-geographic-labels", {
          type: "raster",
          tiles: [
            "https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png",
            "https://b.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png",
            "https://c.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png",
            "https://d.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png"
          ],
          tileSize: 256,
          attribution: "&copy; CARTO &copy; OpenStreetMap contributors"
        });
        map.addLayer({
          id: "carto-geographic-labels-layer",
          type: "raster",
          source: "carto-geographic-labels",
          paint: {
            "raster-opacity": 1.0
          }
        });
      }

      // Phase 3: Add India National Outline Source & Line Layer (Derived from State Geometries)
      if (!map.getSource("dome-india-national-outline")) {
        const nationalGeoJSON = {
          type: "FeatureCollection",
          features: [DERIVED_NATIONAL_OUTLINE]
        };
        map.addSource("dome-india-national-outline", {
          type: "geojson",
          data: nationalGeoJSON as unknown as GeoJSON.FeatureCollection,
        });

        map.addLayer({
          id: "dome-india-national-boundary",
          type: "line",
          source: "dome-india-national-outline",
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": "#3FE0B0",
            "line-width": 2,
            "line-opacity": 0.8,
          },
        });
      }

      // Phase 1: Add ONLY the dome-india-states GeoJSON source
      if (!map.getSource("dome-india-states")) {
        const statesGeoJSON = {
          type: "FeatureCollection",
          features: INDIA_BOUNDARIES_GEOJSON.features.map((feature, index) => ({
            ...feature,
            id: index + 1
          }))
        };

        map.addSource("dome-india-states", {
          type: "geojson",
          data: statesGeoJSON as unknown as GeoJSON.FeatureCollection,
        });

        // Phase 4: Add State Fills Layer
        map.addLayer({
          id: "dome-india-state-fills",
          type: "fill",
          source: "dome-india-states",
          layout: {
            visibility: "visible",
          },
          paint: {
            "fill-color": "#3FE0B0",
            "fill-opacity": 0.03,
          },
        });

        // Phase 2: Add State boundaries line layer
        map.addLayer({
          id: "dome-india-state-boundaries",
          type: "line",
          source: "dome-india-states",
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": "#5C6678",
            "line-width": 1.2,
            "line-opacity": 0.7,
          },
        });

        // Phase 5: Add State Labels Layer
        map.addLayer({
          id: "india-state-labels",
          type: "symbol",
          source: "dome-india-states",
          minzoom: 5.5,
          maxzoom: 12,
          layout: {
            "text-field": ["get", "ST_NM"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Regular"],
            "text-size": 11,
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "symbol-placement": "point",
            "visibility": "visible"
          },
          paint: {
            "text-color": "#8F9AAA",
            "text-halo-color": "#080B10",
            "text-halo-width": 1.5,
            "text-opacity": 0.85
          }
        });
      }

      // Step 6: Explicitly force DOME layers to the top
      if (map.getLayer("dome-india-state-fills")) {
        map.moveLayer("dome-india-state-fills");
      }
      if (map.getLayer("dome-india-state-boundaries")) {
        map.moveLayer("dome-india-state-boundaries");
      }
      if (map.getLayer("dome-india-national-boundary")) {
        map.moveLayer("dome-india-national-boundary");
      }
      if (map.getLayer("india-state-labels")) {
        map.moveLayer("india-state-labels");
      }


      // Log layer verification
      logDebug("National source added: " + !!map.getSource("dome-india-national-outline"));
      logDebug("National layer added: " + !!map.getLayer("dome-india-national-boundary"));
      logDebug("States source added: " + !!map.getSource("dome-india-states"));
      logDebug("States layer added: " + !!map.getLayer("dome-india-state-boundaries"));
      logDebug("State fills layer added: " + !!map.getLayer("dome-india-state-fills"));
      logDebug("State labels layer added: " + !!map.getLayer("india-state-labels"));
      if (map.getStyle() && map.getStyle().layers) {
        logDebug("Layers order: " + map.getStyle().layers.map(l => l.id).join(", "));
      }

      // 2. Add Clustered Signals GeoJSON Source
      if (!map.getSource("signals-source")) {
        map.addSource("signals-source", {
          type: "geojson",
          data: geoJSONRef.current as unknown as GeoJSON.FeatureCollection,
          cluster: true,
          clusterMaxZoom: 11,
          clusterRadius: 38,
          promoteId: "id",
        });

        // 3. Cluster Circles Layer
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "signals-source",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "rgba(63, 224, 176, 0.35)",
              5,
              "rgba(255, 170, 0, 0.45)",
              10,
              "rgba(255, 77, 77, 0.55)",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              18,
              5,
              24,
              10,
              30,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": [
              "step",
              ["get", "point_count"],
              "#3fe0b0",
              5,
              "#ffaa00",
              10,
              "#ff4d4d",
            ],
          },
        });

        // 4. Cluster Count Symbol Layer
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "signals-source",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 12,
          },
          paint: {
            "text-color": "#FFFFFF",
          },
        });

        // 5. Unclustered Outer Glow Layer
        map.addLayer({
          id: "unclustered-point-glow",
          type: "circle",
          source: "signals-source",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "case",
              ["==", ["get", "severity"], "critical"],
              "#ff4d4d",
              ["==", ["get", "severity"], "warning"],
              "#ffaa00",
              "#3fe0b0",
            ],
            "circle-opacity": 0.4,
            "circle-radius": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              22,
              ["boolean", ["feature-state", "hover"], false],
              18,
              12,
            ],
            "circle-blur": 0.5,
          },
        });

        // 6. Unclustered Inner Core Layer
        map.addLayer({
          id: "unclustered-point-core",
          type: "circle",
          source: "signals-source",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "case",
              ["==", ["get", "severity"], "critical"],
              "#ff4d4d",
              ["==", ["get", "severity"], "warning"],
              "#ffaa00",
              "#3fe0b0",
            ],
            "circle-radius": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              7,
              5,
            ],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#FFFFFF",
          },
        });
      }
    };

    // Event Listeners
    const onClusterClick = async (e: MapLayerMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
      if (!features.length) return;
      const clusterId = features[0].properties?.cluster_id;
      const source = map.getSource("signals-source") as GeoJSONSource;

      if (source && clusterId !== undefined) {
        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          const coords = (features[0].geometry as GeoJSON.Point).coordinates;
          map.easeTo({
            center: [coords[0], coords[1]],
            zoom: zoom + 0.5,
          });
        } catch {
          // ignore
        }
      }
    };

    const onPointClick = (e: MapLayerMouseEvent) => {
      if (!e.features || !e.features.length) return;
      const feature = e.features[0] as MapGeoJSONFeature;
      const signalId = feature.properties?.id;
      const target = signalsRef.current.find((s) => s.id === signalId);

      if (target) {
        onSelectSignalRef.current(target);
        map.easeTo({
          center: [target.location.lng, target.location.lat],
          duration: 800,
        });
      }
    };

    const onMouseEnterGlow = (e: MapLayerMouseEvent) => {
      map.getCanvas().style.cursor = "pointer";
      if (e.features && e.features.length > 0) {
        const feature = e.features[0] as MapGeoJSONFeature;
        const id = feature.id as string;
        const title = feature.properties?.title || "";
        const city = feature.properties?.city || "";

        if (hoverSignalIdRef.current && hoverSignalIdRef.current !== id) {
          if (map.getSource("signals-source")) {
            map.setFeatureState(
              { source: "signals-source", id: hoverSignalIdRef.current },
              { hover: false }
            );
          }
        }
        hoverSignalIdRef.current = id;
        if (map.getSource("signals-source")) {
          map.setFeatureState(
            { source: "signals-source", id },
            { hover: true }
          );
        }

        if (popupRef.current) {
          const coords = (feature.geometry as GeoJSON.Point).coordinates;
          popupRef.current
            .setLngLat([coords[0], coords[1]])
            .setHTML(
              `<div style="font-family: sans-serif; font-size: 11px; font-weight: 600; color: #f2f4f8; background: #0c1220; padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(63,224,176,0.3);">
                ${title} <span style="color: #3fe0b0">(${city})</span>
              </div>`
            )
            .addTo(map);
        }
      }
    };

    const onMouseLeaveGlow = () => {
      map.getCanvas().style.cursor = "";
      if (popupRef.current) popupRef.current.remove();
      if (hoverSignalIdRef.current) {
        if (map.getSource("signals-source")) {
          map.setFeatureState(
            { source: "signals-source", id: hoverSignalIdRef.current },
            { hover: false }
          );
        }
        hoverSignalIdRef.current = null;
      }
    };

    let hoverStateId: number | null = null;

    const onMouseMoveStates = (e: MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const id = feature.id as number;

        if (hoverStateId !== null && hoverStateId !== id) {
          if (map.getSource("dome-india-states")) {
            map.setFeatureState(
              { source: "dome-india-states", id: hoverStateId },
              { hover: false }
            );
          }
        }

        hoverStateId = id;
        if (map.getSource("dome-india-states")) {
          map.setFeatureState(
            { source: "dome-india-states", id },
            { hover: true }
          );
        }
      }
    };

    const onMouseLeaveStates = () => {
      if (hoverStateId !== null) {
        if (map.getSource("dome-india-states")) {
          map.setFeatureState(
            { source: "dome-india-states", id: hoverStateId },
            { hover: false }
          );
        }
        hoverStateId = null;
      }
    };

    if (map.isStyleLoaded()) {
      console.log("[MapLibre] Style is already loaded synchronously. Running handleStyleLoad immediately.");
      handleStyleLoad();
    } else {
      map.on("style.load", handleStyleLoad);
    }
    const onMapIdle = () => {
      logDebug("--- MAP IDLE ---");
      logDebug("Source loaded: " + map.isSourceLoaded("dome-india-states"));
      logDebug("Style loaded: " + map.isStyleLoaded());
      if (map.getLayer("dome-india-state-boundaries")) {
        const rendered = map.queryRenderedFeatures(undefined, {
          layers: ["dome-india-state-boundaries"]
        });
        logDebug("Rendered state features: " + rendered.length);
      } else {
        logDebug("Rendered state features: 0 (layer missing)");
      }
    };

    map.on("idle", onMapIdle);
    map.on("click", "clusters", onClusterClick);
    map.on("click", "unclustered-point-glow", onPointClick);
    map.on("mouseenter", "unclustered-point-glow", onMouseEnterGlow);
    map.on("mouseleave", "unclustered-point-glow", onMouseLeaveGlow);
    map.on("mousemove", "dome-india-state-fills", onMouseMoveStates);
    map.on("mouseleave", "dome-india-state-fills", onMouseLeaveStates);

    return () => {
      setStyleLoaded(false);
      if (popupRef.current) popupRef.current.remove();
      map.off("style.load", handleStyleLoad);
      map.off("idle", onMapIdle);
      map.off("click", "clusters", onClusterClick);
      map.off("click", "unclustered-point-glow", onPointClick);
      map.off("mouseenter", "unclustered-point-glow", onMouseEnterGlow);
      map.off("mouseleave", "unclustered-point-glow", onMouseLeaveGlow);
      map.off("mousemove", "dome-india-state-fills", onMouseMoveStates);
      map.off("mouseleave", "dome-india-state-fills", onMouseLeaveStates);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const sendFrontendDebugReport = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    try {
      const reportLines: string[] = [];

      reportLines.push("--- DOME FRONTEND DEBUG REPORT ---");
      reportLines.push("Style Loaded: " + map.isStyleLoaded());
      const src = map.getSource("dome-india-states");
      reportLines.push("Source exists: " + !!src);
      reportLines.push("Source loaded: " + map.isSourceLoaded("dome-india-states"));

      // Feature count and first five features
      reportLines.push("GeoJSON Feature count: " + INDIA_BOUNDARIES_GEOJSON.features.length);
      const slicedFeatures = INDIA_BOUNDARIES_GEOJSON.features.slice(0, 5).map(f => ({
        name: (f.properties as { ST_NM?: string; NAME?: string; name?: string })?.ST_NM || (f.properties as { ST_NM?: string; NAME?: string; name?: string })?.NAME || (f.properties as { ST_NM?: string; NAME?: string; name?: string })?.name,
        geometryType: f.geometry?.type,
        coordinatesExist: !!f.geometry?.coordinates
      }));
      reportLines.push("First five features: " + JSON.stringify(slicedFeatures));

      // Bounds check
      const computedBounds = getGeoJSONBounds(INDIA_BOUNDARIES_GEOJSON as unknown as GeoJSONCoords);
      reportLines.push("Geometry Bounds: SW " + JSON.stringify(computedBounds[0]) + " | NE " + JSON.stringify(computedBounds[1]));

      // Paint properties of dome-india-state-boundaries
      if (map.getLayer("dome-india-state-boundaries")) {
        reportLines.push("State layer exists: true");
        reportLines.push("Actual line-color: " + map.getPaintProperty("dome-india-state-boundaries", "line-color"));
        reportLines.push("Actual line-width: " + map.getPaintProperty("dome-india-state-boundaries", "line-width"));
        reportLines.push("Actual line-opacity: " + map.getPaintProperty("dome-india-state-boundaries", "line-opacity"));
        reportLines.push("State Visibility: " + map.getLayoutProperty("dome-india-state-boundaries", "visibility"));
      } else {
        reportLines.push("State layer exists: false");
      }

      // Paint properties of national outline
      if (map.getLayer("dome-india-national-boundary")) {
        reportLines.push("National boundary line-color: " + map.getPaintProperty("dome-india-national-boundary", "line-color"));
        reportLines.push("National boundary line-width: " + map.getPaintProperty("dome-india-national-boundary", "line-width"));
        reportLines.push("National boundary line-opacity: " + map.getPaintProperty("dome-india-national-boundary", "line-opacity"));
      }

      // Paint properties of debug fill
      if (map.getLayer("dome-debug-state-fill")) {
        reportLines.push("Debug fill layer exists: true");
        reportLines.push("Debug fill-color: " + map.getPaintProperty("dome-debug-state-fill", "fill-color"));
        reportLines.push("Debug fill-opacity: " + map.getPaintProperty("dome-debug-state-fill", "fill-opacity"));
      } else {
        reportLines.push("Debug fill layer exists: false");
      }

      // Rendered features check
      if (map.getLayer("dome-india-state-boundaries")) {
        const rendered = map.queryRenderedFeatures(undefined, { layers: ["dome-india-state-boundaries"] });
        reportLines.push("Rendered state features count: " + rendered.length);
      }

      // Style layers order
      if (map.getStyle() && map.getStyle().layers) {
        const order = map.getStyle().layers.map((l, i) => {
          const layerObj = l as Record<string, unknown>;
          const srcVal = typeof layerObj.source === "string" ? layerObj.source : "inline";
          return `${i}: id=${l.id}, type=${l.type}, src=${srcVal}`;
        });
        reportLines.push("Layers order: \n" + order.join("\n"));
      }

      // Canvas check
      const canvas = map.getCanvas();
      reportLines.push("Canvas element exists: " + !!canvas);
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        reportLines.push(`Canvas Size: width=${canvas.width}, height=${canvas.height}`);
        reportLines.push(`Canvas Bounding Rect: top=${rect.top}, left=${rect.left}, width=${rect.width}, height=${rect.height}`);
        
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
        reportLines.push("WebGL context available: " + !!gl);

        const cStyle = getComputedStyle(canvas);
        const cStyleObj = cStyle as unknown as Record<string, string>;
        reportLines.push(`Canvas CSS: opacity=${cStyle.opacity}, filter=${cStyle.filter}, mixBlendMode=${cStyle.mixBlendMode || cStyleObj.mixBlendMode || 'none'}, visibility=${cStyle.visibility}, zIndex=${cStyle.zIndex}`);

        // Elements at center
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const topEl = document.elementFromPoint(centerX, centerY);
        reportLines.push("Top element at center: " + (topEl ? `${topEl.tagName} (class=${topEl.className}, id=${topEl.id})` : "none"));

        const allEls = document.elementsFromPoint(centerX, centerY);
        reportLines.push("All elements at center: " + allEls.map(el => el.tagName + (el.className ? `.${el.className.split(' ').join('.')}` : '')).join(" -> "));
      }

      // Container check
      const container = map.getContainer();
      reportLines.push("Container element exists: " + !!container);
      if (container) {
        const contStyle = getComputedStyle(container);
        const contStyleObj = contStyle as unknown as Record<string, string>;
        reportLines.push(`Container CSS: opacity=${contStyle.opacity}, filter=${contStyle.filter}, mixBlendMode=${contStyle.mixBlendMode || contStyleObj.mixBlendMode || 'none'}, visibility=${contStyle.visibility}, zIndex=${contStyle.zIndex}`);
      }

      // POST to backend debug logger
      fetch("/api/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: reportLines.join("\n") })
      }).then(() => {
        console.log("[MapDebug] Diagnostics report successfully POSTed to backend.");
      }).catch(err => {
        console.error("Failed to send debug report to server:", err);
      });

    } catch (err: unknown) {
      console.error("Error in sendFrontendDebugReport:", err);
    }
  };

  useEffect(() => {
    if (styleLoaded) {
      const timer = setTimeout(() => {
        sendFrontendDebugReport();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [styleLoaded]);

  // Sync GeoJSON source safely when geoJSON prop changes
  useEffect(() => {
    if (!mapRef.current || !styleLoaded || !mapRef.current.isStyleLoaded()) {
      return;
    }
    const source = mapRef.current.getSource("signals-source") as GeoJSONSource;
    if (source) {
      source.setData(geoJSON as unknown as GeoJSON.FeatureCollection);
    }
  }, [geoJSON, styleLoaded]);

  // Sync selected feature-state safely when selectedSignal prop changes
  useEffect(() => {
    if (!mapRef.current || !styleLoaded || !mapRef.current.isStyleLoaded()) {
      return;
    }
    const map = mapRef.current;
    if (!map.getSource("signals-source")) return;

    if (selectedSignalIdRef.current && selectedSignalIdRef.current !== selectedSignal?.id) {
      map.setFeatureState(
        { source: "signals-source", id: selectedSignalIdRef.current },
        { selected: false }
      );
    }

    if (selectedSignal) {
      selectedSignalIdRef.current = selectedSignal.id;
      map.setFeatureState(
        { source: "signals-source", id: selectedSignal.id },
        { selected: true }
      );
    } else {
      selectedSignalIdRef.current = null;
    }
  }, [selectedSignal, styleLoaded]);

  // Sync layer visibility from layerStates prop
  useEffect(() => {
    logDebug("layerStates useEffect run, styleLoaded: " + styleLoaded);
    if (!mapRef.current || !styleLoaded || !mapRef.current.isStyleLoaded()) {
      return;
    }
    const map = mapRef.current;

    for (const layer of MAP_LAYERS) {
      if (!layer.available || layer.mapLayerIds.length === 0) continue;
      const visible = !!layerStates[layer.id];
      logDebug("Setting visibility for " + layer.id + " (" + layer.mapLayerIds.join(",") + ") to " + visible);
      setLayerVisibility(map, layer.mapLayerIds, visible);
    }
  }, [layerStates, styleLoaded]);

  // Map Controls
  const handleZoomIn = () => {
    if (mapRef.current && styleLoaded) mapRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapRef.current && styleLoaded) mapRef.current.zoomOut();
  };
  const handleResetView = () => {
    onSelectSignal(null);
    if (mapRef.current && styleLoaded) {
      const indiaGeoBounds = getGeoJSONBounds(INDIA_BOUNDARIES_GEOJSON as unknown as GeoJSONCoords);
      mapRef.current.fitBounds(indiaGeoBounds, {
        padding: 50,
        duration: 800
      });
    }
  };

  return (
    <div className={styles.mapWrapper}>
      <div ref={mapContainerRef} className={styles.mapCanvas} />
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
      />
    </div>
  );
}

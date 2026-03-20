"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "@/context/ThemeContext";
import Pusher from "pusher-js";
import { motion, AnimatePresence } from "framer-motion";

interface MapProps {
  userPin?: {
    id?: string;
    lat: number;
    lng: number;
    type: string;
    score: number;
    country: string;
    desc: string;
  } | null;
  onLoad?: () => void;
  period: string;
}

const Map: React.FC<MapProps> = ({ userPin, onLoad, period }) => {
  const { theme } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userPinMarker = useRef<maplibregl.Marker | null>(null);
  
  const [showUserSidebar, setShowUserSidebar] = useState(false);
  const [activeSidebarPin, setActiveSidebarPin] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCountryInfo, setSelectedCountryInfo] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [countryColorsMap, setCountryColorsMap] = useState<Record<string, string>>({});

  // Refs for real-time stability
  const geoJsonFeatures = useRef<GeoJSON.Feature[]>([]);
  const userPinRef = useRef(userPin);

  // Keep ref in sync for the Pusher listener
  useEffect(() => {
    userPinRef.current = userPin;
  }, [userPin]);

  // Fetch dynamic country details
  useEffect(() => {
    if (!selectedCountry) {
      setSelectedCountryInfo(null);
      return;
    }

    const fetchCountryInfo = async () => {
      setIsDetailLoading(true);
      try {
        const res = await fetch(`/api/country/${selectedCountry}?period=${period}`);
        const data = await res.json();
        setSelectedCountryInfo(data);
      } catch (e) {
        console.error("Failed to fetch country info:", e);
      } finally {
        setIsDetailLoading(false);
      }
    };

    fetchCountryInfo();
  }, [selectedCountry]);

  // Fetch dynamic pin details (if ID is present)
  useEffect(() => {
    if (!activeSidebarPin || activeSidebarPin.isSelf || !activeSidebarPin.id) return;

    const fetchPinInfo = async () => {
      try {
        const res = await fetch(`/api/pin/${activeSidebarPin.id}`);
        const data = await res.json();
        setActiveSidebarPin((prev: any) => prev ? { ...prev, ...data } : null);
      } catch (e) {
        console.error("Failed to fetch pin info:", e);
      }
    };

    fetchPinInfo();
  }, [activeSidebarPin?.id]);

  // Handle color updates when period changes
  const updateMapColors = useCallback(async (selectedPeriod: string) => {
    if (!map.current) return;
    
    try {
      const res = await fetch(`/api/map/colors?period=${selectedPeriod}`);
      const countryStats = await res.json();
      
      const matchExpression: any[] = ["match", ["coalesce", ["get", "ISO_A2_EH"], ["get", "ISO_A2"]]];
      const newColorsMap: Record<string, string> = {};
      
      Object.entries(countryStats).forEach(([code, stats]: [string, any]) => {
        const score = stats.averageGuilt;
        let color = "rgba(0,0,0,0)";
        if (score > 0) {
          if (score >= 75) color = "rgba(239, 68, 68, 0.7)"; 
          else if (score >= 36) color = "rgba(245, 158, 11, 0.7)"; 
          else color = "rgba(34, 197, 94, 0.7)"; 
        }
        matchExpression.push(code, color);
        newColorsMap[code] = color;
      });
      
      setCountryColorsMap(newColorsMap);
      matchExpression.push("rgba(0,0,0,0)");

      if (map.current.getLayer("countries-fill")) {
        // Mapbox match expression requires at least one label/output pair and a default value (min 5 elements in total)
        // If no countries are being colored, just set a static transparent color to avoid the error.
        const finalColor = matchExpression.length >= 5 ? matchExpression : "rgba(0,0,0,0)";
        map.current.setPaintProperty("countries-fill", "fill-color", finalColor);
      }
    } catch (e) {
      console.error("Failed to update map colors:", e);
    }
  }, []);

  // Handle data updates when period changes
  useEffect(() => {
    if (!isLoading) {
      updateMapColors(period);
      
      const fetchPins = async () => {
        if (!map.current || !map.current.getSource("global-pins")) return;
        try {
          const pinRes = await fetch(`/api/logs/map?period=${period}`);
          const pinData = await pinRes.json();
          
          geoJsonFeatures.current = pinData.map((pin: any) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [pin.lng, pin.lat] },
            properties: { 
              id: pin.id, 
              type: pin.type.toLowerCase(), 
              score: pin.score, 
              country: pin.countryCode,
              timestamp: pin.createdAt 
            },
          }));

          const source = map.current.getSource("global-pins") as maplibregl.GeoJSONSource;
          if (source) {
            source.setData({
              type: "FeatureCollection",
              features: geoJsonFeatures.current,
            });
          }
        } catch (e) {
          console.error("Failed to fetch period pins:", e);
        }
      };
      
      fetchPins();
    }
  }, [period, isLoading, updateMapColors]);

  // Update map style when theme changes
  useEffect(() => {
    if (!map.current) return;
    const style = theme === "dark"
      ? "https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      : "https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json";
    map.current.setStyle(style);
  }, [theme]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: theme === "dark" 
        ? "https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        : "https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [20, 20],
      zoom: 1.5,
      pitch: 0,
    });

    map.current = mapInstance;

    const pusherKey = process.env.NEXT_PUBLIC_SOKETI_APP_KEY!;
    const pusherHost = process.env.NEXT_PUBLIC_SOKETI_HOST || "127.0.0.1";
    const pusherPort = Number(process.env.NEXT_PUBLIC_SOKETI_PORT) || 6001;
    
    const pusherClient = new Pusher(pusherKey, {
      wsHost: pusherHost,
      wsPort: pusherPort,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ["ws", "wss"],
      cluster: "",
    });

    const channel = pusherClient.subscribe("latermap-channel");

    channel.bind("new-log", (data: any) => {
      const isSelf = userPinRef.current && userPinRef.current.id === data.id;
      const newNotif = {
        id: Date.now(),
        country: data.country,
        label: data.label,
        emoji: data.emoji,
        type: data.type,
        score: data.score,
        isSelf
      };
      
      setNotifications(prev => [newNotif, ...prev].slice(0, 3));
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 5000);

      if (!map.current) return;

      const source = map.current.getSource("global-pins") as maplibregl.GeoJSONSource;
      if (source) {
        const newFeature: GeoJSON.Feature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [data.lng, data.lat],
          },
          properties: {
            id: data.id,
            type: data.type.toLowerCase(),
            score: data.score,
            country: data.country,
            timestamp: Date.now(),
          },
        };
        
        geoJsonFeatures.current.unshift(newFeature);
        if (geoJsonFeatures.current.length > 500) geoJsonFeatures.current.pop();
        
        source.setData({
          type: "FeatureCollection",
          features: geoJsonFeatures.current,
        });
      }
    });

    mapInstance.on("load", async () => {
      const [geoRes] = await Promise.all([
        fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson"),
      ]);

      const geojson = await geoRes.json();
      
      mapInstance.addSource("countries", {
        type: "geojson",
        data: geojson,
      });

      mapInstance.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": "rgba(0,0,0,0)",
          "fill-opacity": 0.55,
        },
      });

      mapInstance.addSource("global-pins", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      mapInstance.addLayer({
        id: "global-pins-halo",
        type: "circle",
        source: "global-pins",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 4, 10, 16],
          "circle-color": ["match", ["get", "type"], "procrastinate", "rgba(239, 68, 68, 0.25)", "focus", "rgba(34, 197, 94, 0.25)", "transparent"],
          "circle-blur": 0.8,
        },
      });

      mapInstance.addLayer({
        id: "global-pins-layer",
        type: "circle",
        source: "global-pins",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 2.5, 10, 5],
          "circle-color": ["match", ["get", "type"], "procrastinate", "#ef4444", "focus", "#22c55e", "#ffffff"],
          "circle-opacity": 0.9,
          "circle-stroke-width": 1,
          "circle-stroke-color": "rgba(255, 255, 255, 0.5)",
        },
      });

      mapInstance.addLayer({
        id: "global-pins-hitbox",
        type: "circle",
        source: "global-pins",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 12, 10, 24],
          "circle-color": "rgba(0,0,0,0)",
          "circle-opacity": 0,
        },
      });

      mapInstance.on("mouseenter", "global-pins-hitbox", () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });
      mapInstance.on("mouseleave", "global-pins-hitbox", () => {
        mapInstance.getCanvas().style.cursor = "";
      });

      mapInstance.on("click", "global-pins-hitbox", (e) => {
        if (e.features && e.features.length > 0) {
          const props = e.features[0].properties;
          const coords = (e.features[0].geometry as any).coordinates;
          
          setShowUserSidebar(true);
          setActiveSidebarPin({
            id: props?.id,
            lat: coords[1],
            lng: coords[0],
            type: props?.type,
            score: props?.score,
            country: props?.country,
            timestamp: props?.timestamp,
            isSelf: false,
          });
          setSelectedCountry(null);
          mapInstance.flyTo({ center: coords, zoom: 9, duration: 2500, essential: true });
        }
      });

      mapInstance.on("click", (e) => {
        const pinFeatures = mapInstance.queryRenderedFeatures(e.point, { layers: ["global-pins-hitbox"] });
        if (pinFeatures.length > 0) return;

        const features = mapInstance.queryRenderedFeatures(e.point, { layers: ["countries-fill"] });
        if (features.length > 0) {
          const props = features[0].properties;
          const isoCode = (props?.ISO_A2_EH || props?.ISO_A2 || props?.iso_a2_eh) as string;
          if (isoCode && isoCode !== "-99") {
            setSelectedCountry(isoCode);
            setShowUserSidebar(false);
            mapInstance.flyTo({ center: e.lngLat, zoom: 4.5, essential: true, duration: 1200 });
            return;
          }
        }
        setSelectedCountry(null);
        setShowUserSidebar(false);
      });

      setIsLoading(false);
      if (onLoad) setTimeout(() => onLoad(), 200);
      setTimeout(() => {
        mapInstance.flyTo({ zoom: 4, duration: 2000, essential: true });
      }, 100);
    });

    return () => {
      mapInstance.remove();
      map.current = null;
      pusherClient.disconnect();
    };
  }, []);

  // Sync user pin
  useEffect(() => {
    if (!map.current || !userPin) return;

    map.current.flyTo({ center: [userPin.lng, userPin.lat], zoom: 9, duration: 3500, essential: true });

    if (userPinMarker.current) userPinMarker.current.remove();

    setShowUserSidebar(true);
    setActiveSidebarPin({ ...userPin, isSelf: true });
    setSelectedCountry(null);

    const el = document.createElement("div");
    el.className = "relative flex items-center justify-center w-8 h-8 cursor-pointer group";
    const colorClass = userPin.type === "procrastinate" ? "bg-red-500" : "bg-green-500";
    el.innerHTML = `
      <div class="absolute -inset-3.5 rounded-full ${colorClass} animate-ping opacity-40 pointer-events-none"></div>
      <div class="absolute -inset-1.5 rounded-full ${colorClass} opacity-60 blur-[3px] pointer-events-none"></div>
      <div class="relative w-4 h-4 rounded-full bg-white z-10 shadow-[0_0_20px_rgba(255,255,255,1)] border-2 border-white/20"></div>
    `;

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      setShowUserSidebar(true);
      setActiveSidebarPin({ ...userPin, isSelf: true });
      setSelectedCountry(null);
    });

    userPinMarker.current = new maplibregl.Marker({ element: el }).setLngLat([userPin.lng, userPin.lat]).addTo(map.current);
  }, [userPin]);

  return (
    <div className="absolute inset-0 w-full h-full bg-background transition-colors duration-500">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="map-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-background select-none pointer-events-none transition-colors duration-500"
          >
            <div className="relative">
              {/* Outer orbit glow */}
              <div className="absolute -inset-15 bg-blue-600/10 rounded-full blur-[80px] animate-pulse" />
              
              {/* Radial scanning effect */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-10 opacity-10"
              >
                <div className="w-full h-full border border-blue-400/30 rounded-full border-t-transparent border-r-transparent" />
              </motion.div>

              {/* The Globe Icon */}
              <div className="relative z-10 p-8 border border-border-theme rounded-full bg-foreground/3 backdrop-blur-2xl transition-all">
                <svg className="w-16 h-16 md:w-24 md:h-24 text-blue-500/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>

              {/* Data streams */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 pointer-events-none opacity-20">
                 {[...Array(6)].map((_, i) => (
                    <motion.div
                       key={i}
                       initial={{ opacity: 0 }}
                       animate={{ 
                          opacity: [0, 1, 0],
                          x: [0, (i % 2 === 0 ? 1 : -1) * 150],
                          y: [0, (i < 3 ? 1 : -1) * 150]
                       }}
                       transition={{ 
                          duration: 2 + Math.random() * 2, 
                          repeat: Infinity, 
                          delay: i * 0.4 
                       }}
                       className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,1)]"
                    />
                 ))}
              </div>
            </div>

            <div className="mt-16 text-center space-y-4">
              <div className="flex flex-col items-center gap-1">
                 <p className="text-[10px] md:text-xs font-black tracking-[0.5em] text-blue-400 uppercase drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                   Initializing World Map
                 </p>
                 <p className="text-muted-theme font-mono text-[9px] uppercase tracking-widest animate-pulse transition-colors opacity-70">
                   Mapping Global Procrastination Vectors...
                 </p>
              </div>

              <div className="w-48 h-1 bg-foreground/10 rounded-full overflow-hidden mx-auto relative group">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-linear-to-r from-transparent via-blue-500 to-transparent w-1/2"
                />
              </div>
            </div>

            {/* Corner UI elements for tech feel */}
            <div className="absolute top-12 left-12 opacity-30 hidden md:block transition-all">
               <div className="w-12 h-12 border-t border-l border-border-theme" />
               <p className="font-mono text-[8px] mt-2 text-muted-theme/80 italic">SYS_VERSION: 2.1.0-ALPHA</p>
            </div>
            <div className="absolute bottom-12 right-12 opacity-30 hidden md:block text-right transition-all">
               <div className="w-12 h-12 border-b border-r border-border-theme ml-auto" />
               <p className="font-mono text-[8px] mt-2 tracking-widest uppercase text-muted-theme/80 italic">Location: {userPin?.country || "SCANNING"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={mapContainer} className={`w-full h-full transition-all duration-2000 ease-out ${isLoading ? "opacity-0 scale-95 blur-xl" : "opacity-100 scale-100 blur-0"}`} />

      {/* Country Sidebar */}
      <div className={`absolute top-0 right-0 h-full w-full md:w-110 bg-card border-l border-border-theme z-50 transform transition-all duration-500 ease-in-out shadow-2xl ${selectedCountry ? "translate-x-0" : "translate-x-full"}`}>
        {selectedCountry && (
          <div className="flex flex-col h-full p-6 text-foreground overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: countryColorsMap[selectedCountry] || "#fff" }} />
                <h3 className="text-2xl font-black tracking-wider uppercase transition-colors">{selectedCountry}</h3>
              </div>
              <button onClick={() => setSelectedCountry(null)} className="p-2 rounded-full hover:bg-foreground/10 transition-colors">
                <svg className="w-5 h-5 text-muted-theme hover:text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {isDetailLoading ? (
              <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground/80 rounded-full animate-spin" /></div>
            ) : selectedCountryInfo && (
              <div className="space-y-6">
                <div className="bg-foreground/5 border border-border-theme rounded-xl p-4 transition-colors">
                  <p className="text-[10px] text-muted-theme uppercase tracking-widest mb-1 transition-colors">Avg Guilt Index</p>
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-500">{selectedCountryInfo.averageGuilt}</span>
                  <div className="w-full h-2 bg-foreground/10 rounded-full mt-4 overflow-hidden transition-colors"><div className="h-full bg-linear-to-r from-red-500 to-orange-400 rounded-full transition-all duration-1000" style={{ width: `${selectedCountryInfo.averageGuilt}%` }} /></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-foreground/5 border border-border-theme rounded-xl p-4 transition-colors">
                    <p className="text-[10px] text-muted-theme uppercase tracking-widest mb-1 transition-colors">Total Logs</p>
                    <p className="text-xl font-bold text-foreground transition-colors">{selectedCountryInfo.count}</p>
                  </div>
                  <div className="bg-foreground/5 border border-border-theme rounded-xl p-4 transition-colors">
                    <p className="text-[10px] text-muted-theme uppercase tracking-widest mb-1 transition-colors">Top Tag</p>
                    <p className="text-sm font-semibold truncate text-foreground transition-colors">{selectedCountryInfo.topTags?.[0]?.emoji} {selectedCountryInfo.topTags?.[0]?.label || "None"}</p>
                  </div>
                </div>

                <div className="bg-foreground/5 border border-border-theme rounded-xl p-5 text-center relative overflow-hidden transition-colors">
                  <p className="text-[10px] text-muted-theme uppercase tracking-widest mb-2 transition-colors">
                    Deadlines Missed ({period === "24h" ? "Today" : period})
                  </p>
                  <p className="text-4xl font-black tracking-widest text-foreground transition-colors">{selectedCountryInfo.missedDeadlines?.toLocaleString()}</p>
                </div>
                
                {selectedCountryInfo.topTags?.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-theme uppercase tracking-widest transition-colors">Trending Tags</p>
                    {selectedCountryInfo.topTags.map((tag: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-foreground/5 p-3 rounded-lg border border-border-theme transition-colors">
                        <span className="text-sm capitalize text-foreground transition-colors">{tag.emoji} {tag.label}</span>
                        <span className="text-xs text-muted-theme transition-colors">{tag.count} logs</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pin Sidebar */}
      <div className={`absolute top-0 right-0 h-full w-full md:w-112.5 bg-card border-l border-border-theme z-60 transform transition-all duration-500 ease-in-out shadow-2xl ${showUserSidebar && activeSidebarPin ? "translate-x-0" : "translate-x-full"}`}>
        {activeSidebarPin && (
          <div className="flex flex-col h-full text-foreground overflow-y-auto w-full relative">
            <div className={`p-8 min-h-full flex flex-col relative overflow-hidden ${activeSidebarPin.type === "procrastinate" ? "bg-red-950/20" : "bg-green-950/20"}`}>
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${activeSidebarPin.type === "procrastinate" ? "bg-red-500" : "bg-green-500"} animate-pulse`} />
                  <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-muted-theme transition-colors">{activeSidebarPin.isSelf ? "Personal Pulse" : "Global Heartbeat"}</h3>
                </div>
                <button onClick={() => setShowUserSidebar(false)} className="p-2 hover:bg-foreground/10 rounded-full transition-colors text-muted-theme hover:text-foreground">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="mb-10 relative z-10">
                <p className={`text-[10px] uppercase tracking-[0.3em] font-black mb-3 transition-colors ${activeSidebarPin.type === "procrastinate" ? "text-red-500" : "text-green-500"}`}>
                  {activeSidebarPin.type === "procrastinate" ? "Guilt Index" : "Focus Score"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-8xl font-black italic tracking-tighter text-foreground transition-colors">{activeSidebarPin.score}</span>
                  <span className="text-2xl font-bold text-muted-theme lowercase transition-colors">/100</span>
                </div>
              </div>

              <div className="space-y-6 relative z-10 flex-1">
                <div className="border-l-4 border-border-theme pl-6 py-2 transition-colors">
                  <h4 className="text-2xl font-black mb-2 text-foreground transition-colors">{activeSidebarPin.activity || (activeSidebarPin.type === "procrastinate" ? "Master of Delay" : "Focused Flow")}</h4>
                  <p className="text-muted-theme italic text-lg leading-relaxed transition-colors">"{activeSidebarPin.desc || activeSidebarPin.label || "No confession provided."}"</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-12">
                  <div className="bg-foreground/5 rounded-2xl p-4 border border-border-theme transition-colors">
                    <p className="text-[10px] uppercase tracking-widest text-muted-theme mb-1 transition-colors">Location</p>
                    <p className="font-bold text-foreground transition-colors">{activeSidebarPin.country || "Unknown"}</p>
                  </div>
                  <div className="bg-foreground/5 rounded-2xl p-4 border border-border-theme transition-colors">
                    <p className="text-[10px] uppercase tracking-widest text-muted-theme mb-1 transition-colors">Time</p>
                    <p className="font-bold text-foreground transition-colors">
                      {activeSidebarPin.timestamp 
                        ? (new Date(activeSidebarPin.timestamp).toLocaleDateString("en-GB") + " " + new Date(activeSidebarPin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                        : "Just now"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
      
      {/* Real-time Notifications */}
      <div className="absolute bottom-6 left-6 z-100 flex flex-col items-start gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
              <motion.div
              key={n.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative group pointer-events-auto"
            >
                <div className="relative bg-card/95 backdrop-blur-xl border border-border-theme rounded-sm px-5 py-3 shadow-xl min-w-95 flex items-center gap-4 group overflow-hidden transition-all duration-500">
                  {/* Status Indicator */}
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse" />
                  
                  <div className="flex-1 flex items-center justify-between gap-4">
                    <p className="text-[12px] font-medium text-foreground tracking-tight transition-colors">
                      {n.isSelf ? (
                        <>
                          <span className="text-muted-theme">You just logged</span>
                          <span className="mx-1 font-black text-foreground">{n.label}</span>
                          <span className="mx-1">{n.emoji}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-muted-theme">Someone in</span> 
                          <span className="mx-1 font-bold text-foreground uppercase tracking-wider">{n.country}</span>
                          <span className="text-muted-theme">logged</span>
                          <span className="mx-1 font-black text-foreground">{n.label}</span>
                          <span className="mx-1">{n.emoji}</span>
                          <span className="text-muted-theme">with score</span>
                          <span className={`ml-1 font-black ${n.type === 'procrastinate' ? 'text-red-500' : 'text-green-500'}`}>
                            {n.score}
                          </span>
                        </>
                      )}
                    </p>

                    <span className="text-[10px] font-mono font-bold text-muted-theme/70 uppercase tracking-tighter whitespace-nowrap transition-colors">
                      Just now
                    </span>
                  </div>

                  {/* Accent Progress Line */}
                  <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-foreground/5 transition-colors">
                     <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 6, ease: "linear" }}
                        className="h-full bg-yellow-400/80 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                     />
                  </div>
                </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Map;

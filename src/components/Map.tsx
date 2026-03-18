"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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
}

const Map: React.FC<MapProps> = ({ userPin, onLoad }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userPinMarker = useRef<maplibregl.Marker | null>(null);
  const globalPinMarkers = useRef<maplibregl.Marker[]>([]);
  
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
        const res = await fetch(`/api/country/${selectedCountry}`);
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

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [106.6833, 10.7769],
      zoom: 2.5,
      attributionControl: false,
    });

    map.current = mapInstance;

    // Setup Pusher Listener for real-time updates
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
      // 1. Add notification
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

      // 2. Add marker to map
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
          },
        };
        
        geoJsonFeatures.current.unshift(newFeature);
        if (geoJsonFeatures.current.length > 200) geoJsonFeatures.current.pop();
        
        source.setData({
          type: "FeatureCollection",
          features: geoJsonFeatures.current,
        });
      }
    });

    mapInstance.on("load", async () => {
      // Parallel fetch for speed
      const [geoRes, statsRes] = await Promise.all([
        fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson"),
        fetch("/api/map/colors")
      ]);

      const geojson = await geoRes.json();
      const countryStats = await statsRes.json();

      mapInstance.addSource("countries", {
        type: "geojson",
        data: geojson,
      });

      const matchExpression: any[] = ["match", ["coalesce", ["get", "ISO_A2_EH"], ["get", "ISO_A2"]]];
      const newColorsMap: Record<string, string> = {};
      
      // Build dynamic coloring from REAL data
      Object.entries(countryStats).forEach(([code, stats]: [string, any]) => {
        const score = stats.averageGuilt;
        let color = "rgba(0,0,0,0)";
        if (score > 0) {
          if (score >= 75) color = "rgba(239, 68, 68, 0.7)"; // Red (Level 3)
          else if (score >= 36) color = "rgba(245, 158, 11, 0.7)"; // Amber (Level 2)
          else color = "rgba(34, 197, 94, 0.7)"; // Green (Level 1)
        }
        matchExpression.push(code, color);
        newColorsMap[code] = color;
      });
      
      setCountryColorsMap(newColorsMap);
      matchExpression.push("rgba(0,0,0,0)");

      mapInstance.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": matchExpression as any,
          "fill-opacity": 0.55,
        },
      });

      mapInstance.on("click", (e) => {
        if (!mapInstance.getLayer("countries-fill")) return;

        if (mapInstance.getLayer("global-pins-hitbox")) {
          const pinFeatures = mapInstance.queryRenderedFeatures(e.point, { layers: ["global-pins-hitbox"] });
          if (pinFeatures.length > 0) return;
        }

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

      // Fetch and display real-time pins
      const fetchPins = async () => {
        try {
          const pinRes = await fetch("/api/logs/map");
          const pinData = await pinRes.json();
          if (!map.current) return;

          geoJsonFeatures.current = pinData.map((pin: any) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [pin.lng, pin.lat] },
            properties: { id: pin.id, type: pin.type.toLowerCase(), score: pin.score, country: pin.countryCode },
          }));

          map.current.addSource("global-pins", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: geoJsonFeatures.current,
            },
          });

          map.current.addLayer({
            id: "global-pins-halo",
            type: "circle",
            source: "global-pins",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 4, 10, 16],
              "circle-color": ["match", ["get", "type"], "procrastinate", "rgba(239, 68, 68, 0.25)", "focus", "rgba(34, 197, 94, 0.25)", "transparent"],
              "circle-blur": 0.8,
            },
          });

          map.current.addLayer({
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

          map.current.addLayer({
            id: "global-pins-hitbox",
            type: "circle",
            source: "global-pins",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 12, 10, 24],
              "circle-color": "rgba(0,0,0,0)",
              "circle-opacity": 0,
            },
          });

          map.current.on("mouseenter", "global-pins-hitbox", () => {
            if (map.current) map.current.getCanvas().style.cursor = "pointer";
          });
          map.current.on("mouseleave", "global-pins-hitbox", () => {
            if (map.current) map.current.getCanvas().style.cursor = "";
          });

          map.current.on("click", "global-pins-hitbox", (e) => {
            if (e.features && e.features.length > 0) {
              const props = e.features[0].properties;
              const geo = e.features[0].geometry;
              const coords = (geo as any).coordinates;
              
              setShowUserSidebar(true);
              setActiveSidebarPin({
                id: props?.id,
                lat: coords[1],
                lng: coords[0],
                type: props?.type,
                score: props?.score,
                country: props?.country,
                isSelf: false,
              });
              setSelectedCountry(null);

              if (map.current) {
                map.current.flyTo({ center: coords, zoom: 9, duration: 2500, essential: true });
              }
            }
          });
        } catch (e) {
          console.error("Failed to fetch map pins:", e);
        }
      };

      fetchPins();
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
      <div class="absolute inset-[-14px] rounded-full ${colorClass} animate-ping opacity-40 pointer-events-none"></div>
      <div class="absolute inset-[-6px] rounded-full ${colorClass} opacity-60 blur-[3px] pointer-events-none"></div>
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
    <div className="absolute inset-0 w-full h-full bg-black">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="map-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-black select-none pointer-events-none"
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
              <div className="relative z-10 p-8 border border-white/5 rounded-full bg-white/2 backdrop-blur-2xl">
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
                 <p className="text-gray-600 font-mono text-[9px] uppercase tracking-widest animate-pulse">
                   Mapping Global Procrastination Vectors...
                 </p>
              </div>

              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto relative group">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-linear-to-r from-transparent via-blue-500 to-transparent w-1/2"
                />
              </div>
            </div>

            {/* Corner UI elements for tech feel */}
            <div className="absolute top-12 left-12 opacity-20 hidden md:block">
               <div className="w-12 h-12 border-t border-l border-white/40" />
               <p className="font-mono text-[8px] mt-2">SYS_VERSION: 2.1.0-ALPHA</p>
            </div>
            <div className="absolute bottom-12 right-12 opacity-20 hidden md:block text-right">
               <div className="w-12 h-12 border-b border-r border-white/40 ml-auto" />
               <p className="font-mono text-[8px] mt-2 tracking-widest uppercase">Location: {userPin?.country || "SCANNING"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={mapContainer} className={`w-full h-full transition-all duration-2000 ease-out ${isLoading ? "opacity-0 scale-95 blur-xl" : "opacity-100 scale-100 blur-0"}`} />

      {/* Country Sidebar */}
      <div className={`absolute top-0 right-0 h-full w-full md:w-110 bg-zinc-950/95 backdrop-blur-2xl border-l border-white/10 z-50 transform transition-transform duration-500 ease-in-out shadow-[-20px_0_50px_rgba(0,0,0,0.8)] ${selectedCountry ? "translate-x-0" : "translate-x-full"}`}>
        {selectedCountry && (
          <div className="flex flex-col h-full p-6 text-white overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: countryColorsMap[selectedCountry] || "#fff" }} />
                <h3 className="text-2xl font-black tracking-wider uppercase">{selectedCountry}</h3>
              </div>
              <button onClick={() => setSelectedCountry(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {isDetailLoading ? (
              <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>
            ) : selectedCountryInfo && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Avg Guilt Index</p>
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-500">{selectedCountryInfo.averageGuilt}</span>
                  <div className="w-full h-2 bg-gray-800 rounded-full mt-4 overflow-hidden"><div className="h-full bg-linear-to-r from-red-500 to-orange-400 rounded-full transition-all duration-1000" style={{ width: `${selectedCountryInfo.averageGuilt}%` }} /></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Total Logs</p>
                    <p className="text-xl font-bold">{selectedCountryInfo.count}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Top Tag</p>
                    <p className="text-sm font-semibold truncate">{selectedCountryInfo.topTags?.[0]?.emoji} {selectedCountryInfo.topTags?.[0]?.label || "None"}</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center relative overflow-hidden">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Deadlines Missed Today</p>
                  <p className="text-4xl font-black tracking-widest">{selectedCountryInfo.missedDeadlines?.toLocaleString()}</p>
                </div>
                
                {selectedCountryInfo.topTags?.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Trending Tags</p>
                    {selectedCountryInfo.topTags.map((tag: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="text-sm capitalize">{tag.emoji} {tag.label}</span>
                        <span className="text-xs text-gray-500">{tag.count} logs</span>
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
      <div className={`absolute top-0 right-0 h-full w-full md:w-112.5 bg-zinc-950/90 backdrop-blur-xl border-l border-white/10 z-60 transform transition-transform duration-500 ease-in-out ${showUserSidebar && activeSidebarPin ? "translate-x-0" : "translate-x-full"}`}>
        {activeSidebarPin && (
          <div className="flex flex-col h-full text-white overflow-y-auto w-full relative">
            <div className={`p-8 min-h-full flex flex-col relative overflow-hidden ${activeSidebarPin.type === "procrastinate" ? "bg-red-950/20" : "bg-green-950/20"}`}>
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${activeSidebarPin.type === "procrastinate" ? "bg-red-500" : "bg-green-500"} animate-pulse`} />
                  <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-white/50">{activeSidebarPin.isSelf ? "Personal Pulse" : "Global Heartbeat"}</h3>
                </div>
                <button onClick={() => setShowUserSidebar(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="mb-10 relative z-10">
                <p className={`text-[10px] uppercase tracking-[0.3em] font-black mb-3 ${activeSidebarPin.type === "procrastinate" ? "text-red-500" : "text-green-500"}`}>
                  {activeSidebarPin.type === "procrastinate" ? "Guilt Index" : "Focus Score"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-8xl font-black italic tracking-tighter">{activeSidebarPin.score}</span>
                  <span className="text-2xl font-bold text-white/20 lowercase">/100</span>
                </div>
              </div>

              <div className="space-y-6 relative z-10 flex-1">
                <div className="border-l-4 border-white/10 pl-6 py-2">
                  <h4 className="text-2xl font-black mb-2">{activeSidebarPin.activity || (activeSidebarPin.type === "procrastinate" ? "Master of Delay" : "Focused Flow")}</h4>
                  <p className="text-gray-400 italic text-lg leading-relaxed">"{activeSidebarPin.desc || activeSidebarPin.label || "No confession provided."}"</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-12">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Location</p>
                    <p className="font-bold">{activeSidebarPin.country || "Unknown"}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Time</p>
                    <p className="font-bold">{activeSidebarPin.timestamp ? new Date(activeSidebarPin.timestamp).toLocaleTimeString() : "Just now"}</p>
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
                <div className="relative bg-[#0b0b0e]/95 backdrop-blur-xl border border-white/5 rounded-sm px-5 py-3 shadow-[0_15px_35px_rgba(0,0,0,0.6)] min-w-95 flex items-center gap-4 group overflow-hidden">
                  {/* Status Indicator */}
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse" />
                  
                  <div className="flex-1 flex items-center justify-between gap-4">
                    <p className="text-[12px] font-medium text-gray-200 tracking-tight">
                      {n.isSelf ? (
                        <>
                          <span className="text-gray-400">You just logged</span>
                          <span className="mx-1 font-black text-white">{n.label}</span>
                          <span className="mx-1">{n.emoji}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-400">Someone in</span> 
                          <span className="mx-1 font-bold text-white uppercase tracking-wider">{n.country}</span>
                          <span className="text-gray-400">log</span>
                          <span className="mx-1 font-black text-white">{n.label}</span>
                          <span className="mx-1">{n.emoji}</span>
                          <span className="text-gray-400">with score</span>
                          <span className={`ml-1 font-black ${n.type === 'procrastinate' ? 'text-red-500' : 'text-green-500'}`}>
                            {n.score}
                          </span>
                        </>
                      )}
                    </p>

                    <span className="text-[10px] font-mono font-bold text-gray-600 uppercase tracking-tighter whitespace-nowrap">
                      Just now
                    </span>
                  </div>

                  {/* Yellow Accent Progress Line */}
                  <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-[#1a1a1f]">
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

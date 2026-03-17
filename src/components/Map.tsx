"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { countryDetails } from "@/mocks/countryDetailData";
import { baseCities } from "@/mocks/citiesData";

// Sinh lượng lớn Pins ngẫu nhiên với toạ độ có độ lệch nhẹ để rải rác
const mockGlobalPins = Array.from({ length: 200 }).map((_, i) => {
  const baseCity = baseCities[Math.floor(Math.random() * baseCities.length)];
  const latOffset = (Math.random() - 0.5) * 10; // Càng to thì phân tán càng rộng
  const lngOffset = (Math.random() - 0.5) * 10;
  const isProcrastinating = Math.random() > 0.4; // 60% tỉ lệ trì hoãn (cho thực tế)
  return {
    id: String(i + 1),
    lat: baseCity.lat + latOffset,
    lng: baseCity.lng + lngOffset,
    type: isProcrastinating ? "procrastinate" : "focus",
    score: Math.floor(Math.random() * 40) + 60, // 60-99
    country: baseCity.country,
    iso: baseCity.iso,
    desc: baseCity.desc[Math.floor(Math.random() * baseCity.desc.length)],
  };
});

// Calculate dynamic country colors based on pins
const calculateDynamicCountryColors = () => {
  const stats: Record<string, { delay: number; focus: number }> = {};

  mockGlobalPins.forEach((pin) => {
    if (!stats[pin.iso]) stats[pin.iso] = { delay: 0, focus: 0 };
    if (pin.type === "procrastinate") stats[pin.iso].delay++;
    else stats[pin.iso].focus++;
  });

  const colors: Record<string, string> = {};
  Object.keys(stats).forEach((iso) => {
    const total = stats[iso].delay + stats[iso].focus;
    if (total === 0) return;

    const delayRatio = stats[iso].delay / total;

    // Dynamic color logic:
    // DelayRatio > 0.6 -> Đỏ (red-500 rgba)
    // DelayRatio > 0.4 -> Cam (amber-500 rgba)
    // DelayRatio <= 0.4 -> Xanh lá (green-500 rgba)

    if (delayRatio > 0.6) colors[iso] = "rgba(239, 68, 68, 0.45)";
    else if (delayRatio > 0.4) colors[iso] = "rgba(245, 158, 11, 0.45)";
    else colors[iso] = "rgba(34, 197, 94, 0.45)";
  });

  return colors;
};

const countryColors = calculateDynamicCountryColors();

interface MapProps {
  userPin?: {
    lat: number;
    lng: number;
    type: string;
    score: number;
    country: string;
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
  const [activeSidebarPin, setActiveSidebarPin] = useState<{
    lat: number;
    lng: number;
    type: string;
    score: number;
    country: string;
    isSelf?: boolean;
    desc?: string;
  } | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Loại bỏ hàm updateCountryColors bên ngoài để đưa trực tiếp vào event load của MapLibre
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style:
        "https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [106.6833, 10.7769],
      zoom: 2.5,
      attributionControl: false,
    });

    map.current = mapInstance;

    mapInstance.on("load", async () => {
      // load geojson
      const res = await fetch(
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson",
      );

      const geojson = await res.json();

      mapInstance.addSource("countries", {
        type: "geojson",
        data: geojson,
      });

      // Cấu hình màu cho Layer Quốc Gia qua Paint match theo GeoJSON Attribute
      const matchExpression: any[] = ["match", ["get", "ISO_A2"]];
      Object.entries(countryColors).forEach(([code, color]) => {
        matchExpression.push(code, color);
      });
      matchExpression.push("rgba(0,0,0,0)"); // Mặc định trong suốt

      mapInstance.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": matchExpression as any,
          "fill-opacity": 0.5,
        },
      });

      // Add click handler for side panel
      mapInstance.on("click", (e) => {
        // Chỉ chạy khi các layer sẵn sàng
        if (!mapInstance.getLayer("countries-fill")) return;

        // KIỂM TRA: Nếu click vào một global pin thì bỏ qua không load tooltip / sidebar quốc gia
        if (mapInstance.getLayer("global-pins-hitbox")) {
          const pinFeatures = mapInstance.queryRenderedFeatures(e.point, {
            layers: ["global-pins-hitbox"],
          });
          if (pinFeatures.length > 0) return; // Stop propagtion lên country layer
        }

        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ["countries-fill"],
        });

        if (features.length > 0) {
          const isoCode = features[0].properties?.ISO_A2 as string;
          if (isoCode && countryColors[isoCode]) {
            setSelectedCountry(isoCode);
            setShowUserSidebar(false);
            // Fly to country when clicked
            mapInstance.flyTo({
              center: e.lngLat,
              zoom: 3.5,
              essential: true,
              duration: 1200,
            });
            return;
          }
        }
        setSelectedCountry(null);
      });

      setIsLoading(false);
      if (onLoad) {
        // Đợi một chút khi overlay mờ đi thì mới kích hoạt animation trên UI
        setTimeout(() => onLoad(), 200);
      }

      // Bắt đầu hiệu ứng zoom sau khi map hiện lên
      setTimeout(() => {
        mapInstance.flyTo({
          zoom: 4,
          duration: 2000,
          essential: true,
        });
      }, 100);

      // Thêm Mock Pins thông qua GeoJSON Layer thay vì DOM Markers để tối ưu tỷ lệ Frame
      setTimeout(() => {
        if (!map.current) return;

        // Thêm Source GeoJSON
        map.current.addSource("global-pins", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: mockGlobalPins.map((pin) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [pin.lng, pin.lat],
              },
              properties: {
                id: pin.id,
                type: pin.type,
                score: pin.score,
                country: pin.country,
                desc: pin.desc,
              },
            })),
          },
        });

        // Layer 1: Lớp phát ra ánh sáng nhạt (halo glow) để tạo cảm giác cyberpunk
        map.current.addLayer({
          id: "global-pins-halo",
          type: "circle",
          source: "global-pins",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              2,
              4,
              10,
              16,
            ],
            "circle-color": [
              "match",
              ["get", "type"],
              "procrastinate",
              "rgba(239, 68, 68, 0.25)",
              "focus",
              "rgba(34, 197, 94, 0.25)",
              "transparent",
            ],
            "circle-blur": 0.8,
          },
        });

        // Layer 2: Lớp chấm đặc ở lõi (core)
        map.current.addLayer({
          id: "global-pins-layer",
          type: "circle",
          source: "global-pins",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              2,
              2.5,
              10,
              5,
            ],
            "circle-color": [
              "match",
              ["get", "type"],
              "procrastinate",
              "#ef4444", // red-500
              "focus",
              "#22c55e", // green-500
              "#ffffff",
            ],
            "circle-opacity": 0.9,
            "circle-stroke-width": 1,
            "circle-stroke-color": "rgba(255, 255, 255, 0.5)",
          },
        });

        // Layer 3: Invisible Hitbox lớn hơn nhiều để dễ click!
        map.current.addLayer({
          id: "global-pins-hitbox",
          type: "circle",
          source: "global-pins",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              2,
              12,
              10,
              24,
            ],
            "circle-color": "rgba(0,0,0,0)",
            "circle-opacity": 0, // Vô hình hoàn toàn nhưng quét được sự kiện DOM
          },
        });

        // Handle Hover (Pointer Cursor) trên Hitbox
        map.current.on("mouseenter", "global-pins-hitbox", () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });
        map.current.on("mouseleave", "global-pins-hitbox", () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });

        // Handle Click (mở Sidebar bên trái cho pin) trên Hitbox
        map.current.on("click", "global-pins-hitbox", (e) => {
          if (e.features && e.features.length > 0) {
            const props = e.features[0].properties;
            const geo = e.features[0].geometry;
            const lng = (geo as any).coordinates[0];
            const lat = (geo as any).coordinates[1];

            setShowUserSidebar(true);
            setActiveSidebarPin({
              lat: lat,
              lng: lng,
              type: props?.type,
              score: props?.score,
              country: props?.country,
              desc: props?.desc,
              isSelf: false,
            });
            setSelectedCountry(null);

            // Zoom bản đồ
            if (map.current) {
              map.current.flyTo({
                center: [lng, lat],
                zoom: 6,
                duration: 2500,
                essential: true,
              });
            }
          }
        });
      }, 1000);
    });

    return () => {
      globalPinMarkers.current.forEach((m) => m.remove());
      mapInstance.remove();
      map.current = null;
    };
  }, []);

  // Effect gắn marker cho User Pin
  useEffect(() => {
    if (!map.current || !userPin) return;

    // Fly to user pin (Top-down view)
    map.current.flyTo({
      center: [userPin.lng, userPin.lat],
      zoom: 6,
      duration: 3500,
      essential: true,
    });

    // Remove old marker if exists
    if (userPinMarker.current) {
      userPinMarker.current.remove();
    }

    // Auto open sidebar when new pin is logged
    setShowUserSidebar(true);
    setActiveSidebarPin({
      ...userPin,
      isSelf: true,
      desc: "You just logged this.",
    });
    setSelectedCountry(null);

    // Create a custom DOM element for the pin
    const el = document.createElement("div");
    // Only use cursor-pointer, remove hover:scale to fix jumping issue
    el.className =
      "relative flex items-center justify-center w-8 h-8 cursor-pointer group";

    const isProcrastinating = userPin.type === "procrastinate";
    const colorClass = isProcrastinating ? "bg-blue-500" : "bg-cyan-400"; // Tự bản thân dùng màu chói và khác 1 chút (Vd: xanh dương neon)

    // Create the HTML for the pin without the text and with beautiful pulsing circles
    el.innerHTML = `
      <div class="absolute inset-[-14px] rounded-full ${colorClass} animate-ping opacity-40 pointer-events-none" style="animation-duration: 1.5s;"></div>
      <div class="absolute inset-[-6px] rounded-full ${colorClass} opacity-60 blur-[3px] pointer-events-none"></div>
      <div class="relative w-4 h-4 rounded-full bg-white z-10 shadow-[0_0_20px_rgba(255,255,255,1)] border-2 border-blue-200"></div>
    `;

    // Handle click on marker to show sidebar
    el.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent map click event
      setShowUserSidebar(true);
      setActiveSidebarPin({
        ...userPin,
        isSelf: true,
        desc: "You just logged this.",
      });
      setSelectedCountry(null);
    });

    userPinMarker.current = new maplibregl.Marker({
      element: el,
      anchor: "center",
    })
      .setLngLat([userPin.lng, userPin.lat])
      .addTo(map.current);
  }, [userPin]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <div
        ref={mapContainer}
        className={`w-full h-full transition-opacity duration-1000 ${isLoading ? "opacity-0" : "opacity-100"}`}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-500">
          <div className="relative">
            {/* Outer Ring */}
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            {/* Inner Glow */}
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin blur-[2px]"
              style={{ animationDuration: "0.8s" }}
            ></div>
          </div>
          <p className="mt-6 text-blue-100/80 font-medium tracking-widest text-sm uppercase animate-pulse">
            Loading world map...
          </p>

          <style jsx global>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            .animate-spin {
              animation: spin 1s linear infinite;
            }
            @keyframes pulse {
              0%,
              100% {
                opacity: 1;
              }
              50% {
                opacity: 0.5;
              }
            }
            .animate-pulse {
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
          `}</style>
        </div>
      )}

      {/* Side Panel for Detail Info */}
      <div
        className={`absolute top-0 right-0 h-full w-[440px] bg-zinc-950/95 backdrop-blur-2xl border-l border-white/10 z-50 transform transition-transform duration-500 ease-in-out shadow-[-20px_0_50px_rgba(0,0,0,0.8)] ${
          selectedCountry ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedCountry && countryDetails[selectedCountry] && (
          <div className="flex flex-col h-full p-6 text-white overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ backgroundColor: countryColors[selectedCountry] }}
                />
                <h3 className="text-2xl font-black tracking-wider uppercase">
                  {countryDetails[selectedCountry].name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCountry(null)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Close"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Delay Index */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                  Delay Index / 100
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-500 drop-shadow-sm">
                    {countryDetails[selectedCountry].delayIndex}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-800 rounded-full mt-4 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-linear-to-r from-red-500 to-orange-400 rounded-full transition-all duration-1000"
                    style={{
                      width: `${countryDetails[selectedCountry].delayIndex}%`,
                      boxShadow: "0 0 10px rgba(255, 100, 50, 0.5)",
                    }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <svg
                      className="w-5 h-5 text-blue-400 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 line-clamp-1">
                      Top Reason
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-100">
                    {countryDetails[selectedCountry].topReason}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <svg
                      className="w-5 h-5 text-purple-400 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 line-clamp-1">
                      Active Avoidance
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-100">
                    {countryDetails[selectedCountry].activeAvoidance}
                  </p>
                </div>
              </div>

              {/* Big Number */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10" />
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 relative z-10">
                  Deadlines Missed Today
                </p>
                <p className="text-4xl font-black tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10">
                  {countryDetails[
                    selectedCountry
                  ].deadlineMissed.toLocaleString()}
                </p>
                <p className="text-xs text-green-400 mt-2 font-medium bg-green-400/10 inline-block px-2 py-1 rounded-full relative z-10">
                  +12% since yesterday
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side Panel for User Pin History (Left Side) */}
      <div
        className={`absolute top-0 right-0 h-full w-[450px] bg-zinc-950/90 backdrop-blur-xl border-r border-white/10 z-40 transform transition-transform duration-500 ease-in-out ${
          showUserSidebar && activeSidebarPin
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {activeSidebarPin && (
          <div className="flex flex-col h-full text-white overflow-y-auto w-full relative">
            <div
              className={`p-6 border-b flex flex-col relative overflow-hidden backdrop-blur-xl min-h-full ${activeSidebarPin.type === "procrastinate" ? "bg-red-950/20 border-red-500/30" : "bg-green-950/20 border-green-500/30"}`}
            >
              {/* Glow behind */}
              <div
                className={`absolute -top-20 -left-20 w-40 h-40 blur-[80px] rounded-full opacity-50 ${activeSidebarPin.type === "procrastinate" ? "bg-red-500" : "bg-green-500"}`}
              ></div>

              {/* Header with Close Button */}
              <div className="flex justify-between items-center mb-8 relative z-10 w-full">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] ${activeSidebarPin.type === "procrastinate" ? "bg-red-500" : "bg-green-500"}`}
                  />
                  <h3 className="text-xl font-black tracking-wider uppercase">
                    {activeSidebarPin.isSelf ? "My Log" : "Global Log"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowUserSidebar(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Score */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <p
                    className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${activeSidebarPin.type === "procrastinate" ? "text-red-400" : "text-green-400"}`}
                  >
                    {activeSidebarPin.type === "procrastinate"
                      ? "Guilt Index"
                      : "Focus Score"}
                  </p>
                  <h4 className="text-6xl font-black text-white">
                    {activeSidebarPin.score}
                    <span className="text-xl text-gray-500 font-medium tracking-normal">
                      /100
                    </span>
                  </h4>
                </div>
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg ${activeSidebarPin.type === "procrastinate" ? "border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "border-green-500/50 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"}`}
                >
                  {activeSidebarPin.type === "procrastinate" ? (
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Quotes / Description */}
              <div className="mb-8 relative z-10 border-l-2 border-white/20 pl-4 py-1">
                <h5 className="text-xl font-bold text-white mb-1.5 flex flex-col gap-1">
                  <span>
                    {activeSidebarPin.type === "procrastinate"
                      ? "Master of Delay 🏆"
                      : "Unstoppable Force 🚀"}
                  </span>
                  {!activeSidebarPin.isSelf && (
                    <span className="text-[12px] uppercase text-gray-400 font-medium tracking-widest flex items-center gap-1 opacity-70">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <circle cx="12" cy="11" r="3" fill="currentColor" />
                      </svg>
                      {activeSidebarPin.country}
                    </span>
                  )}
                </h5>
                <p className="text-sm text-gray-400 italic font-medium">
                  "
                  {activeSidebarPin.desc ||
                    (activeSidebarPin.type === "procrastinate"
                      ? "The deadline is a social construct. Who needs it anyway?"
                      : "Look at you, actually doing what you said you would do.")}
                  "
                </p>
              </div>

              {/* Compare Stats */}
              <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-between">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                    Global Average
                  </p>
                  <div>
                    <p className="text-xl font-bold text-gray-200">
                      {activeSidebarPin.type === "procrastinate"
                        ? "72/100"
                        : "65/100"}
                    </p>
                    <p
                      className={`text-[11px] font-semibold mt-1 ${activeSidebarPin.score > 72 && activeSidebarPin.type === "procrastinate" ? "text-red-400" : "text-green-400"}`}
                    >
                      {activeSidebarPin.score > 72
                        ? "▲ Above avg"
                        : "▼ Below avg"}
                    </p>
                  </div>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-between">
                  <p
                    className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 truncate"
                    title={activeSidebarPin.country}
                  >
                    {activeSidebarPin.country || "Local"} Avg
                  </p>
                  <div>
                    <p className="text-xl font-bold text-gray-200">
                      {activeSidebarPin.type === "procrastinate"
                        ? "85/100"
                        : "60/100"}
                    </p>
                    <p
                      className={`text-[11px] font-semibold mt-1 ${(activeSidebarPin.score > 85 && activeSidebarPin.type === "procrastinate") || (activeSidebarPin.score < 60 && activeSidebarPin.type === "focus") ? "text-red-400" : "text-green-400"}`}
                    >
                      {activeSidebarPin.score > 85
                        ? "▲ Setting records"
                        : "▼ Playing safe"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;

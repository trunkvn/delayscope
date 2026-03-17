"use client";

import React, { useState, useEffect } from "react";
import Map from "@/components/Map";
import LogActionModal from "@/components/LogActionModal";

export default function Home() {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"checking" | "granted" | "denied">("checking");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, country: string} | null>(null);
  const [userPin, setUserPin] = useState<{lat: number, lng: number, type: string, score: number, country: string} | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();
            setCountryCode(data.countryCode);
            setUserLocation({ lat: latitude, lng: longitude, country: data.countryName || "Unknown" });
            setLocationStatus("granted");
          } catch (error) {
            // Vẫn cho phép tính là có location nếu API lỗi tạm thời
            setUserLocation({ lat: latitude, lng: longitude, country: "Unknown" });
            setLocationStatus("granted"); 
          }
        },
        () => {
          setLocationStatus("denied");
        }
      );
    } else {
      setLocationStatus("denied");
    }
  }, []);

  return (
    <main className="w-screen h-screen bg-black overflow-hidden select-none font-sans text-white flex flex-col relative">
      {/* Premium Header (Tách riêng biệt) */}
      <header className="w-full shrink-0 flex items-center justify-between px-8 py-5 bg-zinc-950 border-b border-white/10 relative z-20">
        <div className="flex items-center gap-4">
          {/* Glowing dot logo */}
          <div className="relative flex items-center justify-center w-8 h-8">
            <div className="absolute inset-0 rounded-full bg-blue-500 blur-sm opacity-70 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-10"></div>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white drop-shadow-md uppercase flex items-center gap-2">
            <span>Delay<span className="text-blue-400 font-light">Scope</span></span>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/50 text-blue-400 text-[9px] font-black tracking-widest">BETA</span>
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300">
            Live Stats
          </a>
          <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300">
            Methodology
          </a>
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="relative flex-1 w-full bg-black">
        {/* Quote - Nhỏ lại & góc trái trên */}
        <div className="absolute top-6 left-8 z-10 pointer-events-none flex flex-col items-start max-w-sm">
          <div className={`inline-block mb-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md delay-100 ${isMapLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <span className="text-[10px] font-semibold tracking-widest text-blue-300 uppercase">
              Global Activity Tracker
            </span>
          </div>
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white via-gray-200 to-gray-500 drop-shadow-md leading-tight text-left delay-200 ${isMapLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
            Global Rhythm <br />
            <span className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Action vs Delay</span>
          </h2>
          <p className={`mt-2 text-gray-400 text-sm font-light tracking-wide text-shadow-sm text-left delay-300 ${isMapLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
            A real-time visualization of focused deep work vs delayed intentions across the globe.
          </p>

          <button 
            onClick={() => setIsLogModalOpen(true)}
            disabled={locationStatus !== "granted"}
            className={`mt-8 pointer-events-auto group relative px-8 py-3.5 bg-black/60 backdrop-blur-xl rounded-full border transition-all duration-500 shadow-[0_0_25px_rgba(59,130,246,0.2)] flex items-center gap-3 overflow-hidden delay-400 ${isMapLoaded ? 'animate-fade-in-up' : 'opacity-0'} ${
              locationStatus === "granted" 
                ? "border-blue-500/40 hover:border-blue-400 hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:-translate-y-1 cursor-pointer hover:bg-zinc-900" 
                : "border-gray-600/50 opacity-50 cursor-not-allowed"
            }`}
          >
            {/* Gradient background hover pulse */}
            {locationStatus === "granted" && (
              <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
            )}
            
            {/* Status dot */}
            <div className="relative flex items-center justify-center w-3 h-3">
              <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${locationStatus === "granted" ? "bg-blue-500" : "bg-gray-500"}`}></div>
              <div className={`relative w-2 h-2 rounded-full ${locationStatus === "granted" ? "bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,1)]" : "bg-gray-400 shadow-[0_0_10px_rgba(156,163,175,1)]"}`}></div>
            </div>
            
            <span className="relative font-bold text-white tracking-widest text-sm uppercase">
              {locationStatus === "checking" ? "Locating..." : locationStatus === "denied" ? "Location Required" : "Log Your Status"}
            </span>
            
            {locationStatus === "granted" && (
              <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                <svg className="w-3.5 h-3.5 text-blue-300 group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* Right Sidebar - Global Insights 24h & Details */}
        <div className={`absolute top-6 right-8 bottom-6 z-20 pointer-events-none flex flex-col items-end max-w-sm w-full delay-500 ${isMapLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full shadow-[0_4px_30px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col h-full max-h-[800px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                <h3 className="text-white font-bold text-sm tracking-widest uppercase">Global Insights</h3>
              </div>
              <span className="text-[9px] font-black tracking-widest bg-white/10 px-2 py-0.5 rounded text-gray-300">LIVE</span>
            </div>
            
            <p className="text-gray-400 text-xs font-medium mb-6 shrink-0 border-b border-white/5 pb-4">LAST 24 HOURS SUMMARY</p>

            {/* Scrollable Content */}
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
              
              {/* Stat 1: Total & Trend */}
              <div className="flex justify-between items-end bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Total Tracked Logs</p>
                  <p className="text-4xl font-black text-white">124,592</p>
                </div>
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs font-bold mb-1">
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                     12%
                   </div>
                   <p className="text-[9px] text-gray-600 uppercase">vs yesterday</p>
                </div>
              </div>

              {/* Stat 2: Global Ratio Split */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Global Status Ratio</p>
                </div>
                <div className="flex gap-1.5 h-3 w-full rounded-full overflow-hidden mb-3 bg-white/5 p-0.5">
                  <div className="bg-linear-to-r from-red-600 to-red-500 h-full w-[68%] rounded-full relative shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                     <div className="absolute inset-0 bg-white/20 w-1/2 rounded-full blur-[2px]"></div>
                  </div>
                  <div className="bg-linear-to-r from-green-500 to-green-400 h-full w-[32%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                     <span className="text-red-400">68% Delaying</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                     <span className="text-green-400">32% Focused</span>
                  </div>
                </div>
              </div>

              {/* Map Legend & Data Filter */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Map Legend</p>
                
                {/* Legend */}
                <div className="flex justify-between items-center mb-4 text-xs font-medium text-gray-300">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 rounded-full border border-red-500/50 bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    <span className="text-[10px]">{"Delay > 60%"}</span>
                  </div>
                  <div className="w-4 h-px bg-white/10"></div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 rounded-full border border-amber-500/50 bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <span className="text-[10px]">{"Average"}</span>
                  </div>
                  <div className="w-4 h-px bg-white/10"></div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 rounded-full border border-green-500/50 bg-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[10px]">{"Focus > 60%"}</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-white/5"></div>

              {/* Stat 3: Top Regions Compare */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-950/20 rounded-xl p-3 border border-red-500/20 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl"></div>
                  <p className="text-[9px] text-red-200/50 uppercase tracking-widest mb-1.5">Most Distracted</p>
                  <p className="text-sm font-bold text-red-100 line-clamp-1 mb-1">Tokyo, Japan</p>
                  <p className="text-xl font-black text-red-400 mb-1">88%</p>
                  <p className="text-[10px] text-red-300/70 line-clamp-1">"Watching Anime"</p>
                </div>
                
                <div className="bg-green-950/20 rounded-xl p-3 border border-green-500/20 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl"></div>
                  <p className="text-[9px] text-green-200/50 uppercase tracking-widest mb-1.5">Most Focused</p>
                  <p className="text-sm font-bold text-green-100 line-clamp-1 mb-1">Berlin, DE</p>
                  <p className="text-xl font-black text-green-400 mb-1">72%</p>
                  <p className="text-[10px] text-green-300/70 line-clamp-1">"Deep Work"</p>
                </div>
              </div>

              {/* Stat 4: Popular Excuses */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                 <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Trending Excuses Right Now</p>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-300">📱 "Scrolling TikTok"</span>
                       <span className="text-xs font-medium text-gray-500">24.5k logs</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden"><div className="bg-red-500 w-3/4 h-full rounded-full"></div></div>
                    
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-300">🛋️ "Taking a quick nap"</span>
                       <span className="text-xs font-medium text-gray-500">18.2k logs</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden"><div className="bg-orange-500 w-1/2 h-full rounded-full"></div></div>

                    <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-300">☕ "Making 5th coffee"</span>
                       <span className="text-xs font-medium text-gray-500">12.8k logs</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden"><div className="bg-amber-500 w-1/3 h-full rounded-full"></div></div>
                 </div>
              </div>

              {/* Stat 5: Analytics Box */}
              <div>
                 <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Estimated Productivity Lost</p>
                 <div className="flex items-center gap-3 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                       <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                       <p className="text-2xl font-black text-white">4.2M <span className="text-sm font-medium text-red-200/60 uppercase tracking-wider">Hours</span></p>
                       <p className="text-[10px] text-gray-400 mt-0.5 mt-1 border-t border-red-500/20 pt-1">Globally wasted today.</p>
                    </div>
                 </div>
              </div>

            </div> {/* End Scrollable */}

            {/* Custom Scrollbar Style */}
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.4);
              }

              /* Animation for Marquee */
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 35s linear infinite;
              }
              .animate-marquee:hover {
                animation-play-state: paused;
              }
            `}</style>

          </div>
        </div>

        <Map userPin={userPin} onLoad={() => setIsMapLoaded(true)} />

        <div className={`absolute bottom-8 left-8 right-[430px] z-30 flex flex-col gap-2 pointer-events-none delay-300 ${isMapLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
          
          {/* Static Title ABOVE the bar */}
          <div className="flex items-center gap-2 pl-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
            <span className="text-[10px] text-gray-300 uppercase tracking-widest font-bold drop-shadow-md">
              Global Action Log
            </span>
          </div>

          {/* Scrollable Marquee Box */}
          <div className="h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden flex items-center shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto">
            <div className="flex items-center h-full w-max animate-marquee">
            {/* Loop array twice to ensure seamless infinite scroll */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center shrink-0">
                <span className="text-[11px] font-medium text-gray-300 px-6 border-r border-white/10 whitespace-nowrap">🇯🇵 Tokyo: <span className="text-red-400">Delaying (Watching Anime)</span></span>
                <span className="text-[11px] font-medium text-gray-300 px-6 border-r border-white/10 whitespace-nowrap">🇺🇸 New York: <span className="text-green-400">Focused (Coding)</span></span>
                <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">🇻🇳 Hanoi: <span className="text-red-400">Delaying (Drinking Iced Coffee)</span></span>
                <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">🇩🇪 Berlin: <span className="text-green-400">Focused (Deep Work)</span></span>
                <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">🇬🇧 London: <span className="text-red-400">Delaying (Tea Break)</span></span>
                <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">🇦🇺 Sydney: <span className="text-green-400">Focused (Analyzing Data)</span></span>
                <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">🇫🇷 Paris: <span className="text-red-400">Delaying (Eating Croissant)</span></span>
                <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">🇧🇷 Sao Paulo: <span className="text-red-400">Delaying (Dancing)</span></span>
                <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">🇨🇳 Beijing: <span className="text-green-400">Focused (Studying)</span></span>
                <span className="text-[11px] font-medium text-gray-300 px-6 border-l border-white/10 whitespace-nowrap">🇰🇷 Seoul: <span className="text-red-400">Delaying (Listening to K-Pop)</span></span>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Cấu hình animation chuẩn không phụ thuộc Next.js styled-jsx compiler issues */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes infinite-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
            to { opacity: 1; transform: translateY(0); filter: blur(0px); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
          }
          .animate-marquee {
            animation: infinite-scroll 45s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
          .delay-100 { animation-delay: 100ms; }
          .delay-200 { animation-delay: 200ms; }
          .delay-300 { animation-delay: 300ms; }
          .delay-400 { animation-delay: 400ms; }
          .delay-500 { animation-delay: 500ms; }
        `}} />
        
      </div>

      <LogActionModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        userLocation={userLocation}
        onSeePin={(type, score) => {
          if (userLocation) {
            setUserPin({ lat: userLocation.lat, lng: userLocation.lng, type, score, country: userLocation.country });
          }
          setIsLogModalOpen(false);
        }}
      />
    </main>
  );
  
}

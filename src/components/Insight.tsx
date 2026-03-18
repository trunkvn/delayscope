"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Stats {
  totalLogs: number;
  proCount: number;
  focusCount: number;
  totalGuilt: number;
  totalFocus: number;
  activeDelayers: number;
  dangerHour: string;
  hourlySparkline: number[];
}

interface LocalStats {
  proCount: number;
  focusCount: number;
  avgGuilt: number;
}

export default function Insight({ 
  isMapLoaded, 
  countryCode,
  userScore
}: { 
  isMapLoaded: boolean;
  countryCode?: string | null;
  userScore?: number;
}) {
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [local, setLocal] = useState<LocalStats | null>(null);
  const [trending, setTrending] = useState<any[]>([]);
  const [topCountries, setTopCountries] = useState<any[]>([]);

  useEffect(() => {
    if (!isMapLoaded) return;

    const fetchStats = async () => {
      try {
        const url = countryCode ? `/api/stats?country=${countryCode}` : "/api/stats";
        const res = await fetch(url);
        const data = await res.json();
        if (data.global) {
          setStats(data.global);
        }
        if (data.local) {
          setLocal(data.local);
        }
        if (data.trendingTags) {
          setTrending(data.trendingTags.slice(0, 3));
        }
        if (data.topCountries) {
          setTopCountries(data.topCountries);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [isMapLoaded, countryCode]);

  const avgGuilt = stats && stats.proCount > 0 
    ? Math.round(stats.totalGuilt / stats.proCount) 
    : 0;
  
  const getStatusLabel = (score: number) => {
    if (score < 35) return { label: "Productive", color: "text-green-500" };
    if (score < 70) return { label: "Distracted", color: "text-amber-500" };
    return { label: "Chaos", color: "text-red-500" };
  };

  const status = getStatusLabel(avgGuilt);
  const focusRatio = stats ? (stats.focusCount / (stats.proCount + stats.focusCount || 1)) * 100 : 50;

  // Mini Chart Path calculation
  const getChartPath = (data: number[]) => {
    if (!data || data.length === 0) return "";
    const max = Math.max(...data, 100);
    const width = 300; // Updated to match layout padding
    const height = 60;
    const step = width / (data.length - 1);
    
    return data.map((val, i) => {
      const x = i * step;
      const y = height - (val / max) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(" ");
  };

  return (
    <div
      className={`absolute bottom-6 right-6 z-10 transition-all duration-1000 transform w-96 max-h-[85vh] overflow-y-auto hud-scrollbar flex flex-col group ${
        isMapLoaded ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
    >
      <style jsx global>{`
        .hud-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .hud-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
        .hud-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); border-radius: 10px; }
        .hud-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
        .hud-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(59, 130, 246, 0.3) transparent; }
      `}</style>
      <div className="relative bg-zinc-950/80 backdrop-blur-3xl border border-white/5 rounded-4xl p-6 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col gap-6 overflow-hidden border-b-white/10 shrink-0">
        {/* Corner Decorators */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/10" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/10" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/10" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/10" />

        <div className="overflow-y-auto hud-scrollbar flex flex-col gap-6 pr-1">
          {/* Header - Monitor Identity */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-2.5 h-2.5">
                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-30" />
                <div className="absolute inset-0 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[11px] font-black tracking-[0.4em] text-white uppercase leading-none">
                  LATERSYNC // CORE
                </h3>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">INTENTION MONITORING SYSTEM</p>
              </div>
            </div>
            <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 ${status.color}`}>
              {status.label}
            </div>
          </div>

          {/* Color Key Guide */}
          <div className="flex items-center justify-between px-3 py-2 bg-white/2 rounded-xl border border-white/5 shrink-0">
             <p className="text-[8px] font-black text-white uppercase tracking-widest mr-2 opacity-50">Global Legend</p>
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                   <span className="text-[8px] font-black text-gray-500 uppercase">Productive</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                   <span className="text-[8px] font-black text-gray-500 uppercase">Distracted</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                   <span className="text-[8px] font-black text-gray-500 uppercase">Chaos</span>
                </div>
             </div>
          </div>

          {/* Global Statistics Grid */}
          <div className="grid grid-cols-2 gap-8 shrink-0">
            <div className="relative">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                 <span className="w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> AVG. GUILT
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                  {avgGuilt}
                </span>
                <span className="text-[10px] font-black text-gray-600">/ 100</span>
              </div>
            </div>

            <div className="relative pl-6 border-l border-white/5">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                 <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> LIVE AGENTS
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-100 tracking-tighter">
                  {stats?.activeDelayers || 0}
                </span>
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest leading-none ml-1">Live</span>
              </div>
              <p className="text-[8px] font-bold text-gray-600 mt-1">Logs: {stats?.totalLogs.toLocaleString()}</p>
            </div>
          </div>

          {/* Global Leaders Section */}
          <div className="space-y-3 shrink-0">
             <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-px bg-white/5" /> GLOBAL DELAY LEADERS
             </p>
             <div className="grid grid-cols-3 gap-2">
                {topCountries.length > 0 ? topCountries.map((c, i) => (
                  <div key={c.code} className="bg-white/2 border border-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1 group hover:border-white/20 transition-all">
                     <span className="text-[9px] font-black text-gray-600 mb-0.5">#{i+1}</span>
                     <span className="text-base font-black text-white tracking-tighter">{c.code}</span>
                     <div className="w-full h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-red-500/50" style={{ width: `${(c.count / (topCountries[0]?.count || 1)) * 100}%` }} />
                     </div>
                  </div>
                )) : (
                  <div className="col-span-3 text-center py-2 text-[10px] text-gray-600 font-black tracking-widest">AWAITING SIGNALS...</div>
                )}
             </div>
          </div>

          {/* Spectrum Analysis */}
          <div className="space-y-3 shrink-0">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
              <span className="text-gray-600 font-bold">Spectrum</span>
              <div className="flex gap-3">
                <span className="text-green-500/70">FCS {Math.round(focusRatio)}%</span>
                <span className="text-red-500/70">DLY {Math.round(100 - focusRatio)}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex relative">
              <div className="h-full bg-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all duration-1000" style={{ width: `${focusRatio}%` }} />
              <div className="h-full bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-1000" style={{ width: `${100 - focusRatio}%` }} />
            </div>
          </div>

          {/* Wave Visualization */}
          <div className="bg-white/2 border border-white/5 rounded-3xl p-5 space-y-4 shrink-0 mb-2">
            <div className="flex items-center justify-between">
               <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Hourly Pulse</span>
               <span className="text-[8px] font-black text-red-500/60 uppercase">Peak @ {stats?.dangerHour}</span>
            </div>
            
            <div className="h-16 w-full relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 60">
                <defs>
                  <linearGradient id="waveGradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
                    <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                  </linearGradient>
                </defs>
                <path
                  d={`${getChartPath(stats?.hourlySparkline || [])} L 300 60 L 0 60 Z`}
                  fill="url(#waveGradient3)"
                />
                <path
                  d={getChartPath(stats?.hourlySparkline || [])}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-red-500/70 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                />
              </svg>
            </div>

            {/* Distraction List */}
            <div className="space-y-4 pt-3 border-t border-white/5">
              {trending.map((tag, i) => {
                const colors = [
                  "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]",
                  "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]",
                  "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]",
                  "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]",
                  "bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]",
                  "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]",
                ];
                return (
                  <div key={tag.id} className="flex items-center gap-3.5 group">
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base shadow-inner group-hover:bg-white/10 transition-all">
                      {tag.emoji}
                    </div>
                    <div className="flex-1 space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                          <span className="text-gray-400 group-hover:text-white transition-colors">{tag.label}</span>
                          <span className="text-gray-600 font-mono italic group-hover:text-gray-400">{tag.count}</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-px">
                          <div 
                            className={`h-full rounded-full transition-all duration-1500 ${colors[i % colors.length]}`} 
                            style={{ width: `${(tag.count / (trending[0]?.count || 1)) * 100}%` }} 
                          />
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local Pulse */}
          {local && countryCode && (
             <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-4 relative overflow-hidden shrink-0 group hover:bg-blue-600/10 transition-all border-b-blue-500/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-1000" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                   <span className="text-[10px] font-black text-blue-400/80 uppercase tracking-widest">{countryCode} NODE MONITOR</span>
                   <span className="text-[8px] font-black text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded-sm">LIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10 font-black">
                   <div>
                      <p className="text-[7px] text-blue-400/50 uppercase mb-0.5 tracking-tighter">Avg Local</p>
                      <p className="text-2xl text-white tracking-tighter">{local.avgGuilt}<span className="text-[10px] text-blue-400/30 ml-0.5">idx</span></p>
                   </div>
                   <div className="text-right">
                      <p className="text-[7px] text-blue-400/50 uppercase mb-0.5 tracking-tighter">Signals</p>
                      <p className="text-2xl text-white tracking-tighter">{local.proCount + local.focusCount}</p>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* System Footer */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4 opacity-30 grayscale group-hover:grayscale-0 transition-all shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[7px] font-mono font-black text-gray-500 uppercase tracking-[0.3em]">SYSTEM://LATERSYNC_CORE_V1</span>
            <span className="text-[6px] font-bold text-gray-700 uppercase">Authenticated Access / 0x4F92</span>
          </div>
          <div className="text-right flex flex-col gap-0.5 items-end">
             <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                <span className="text-[7px] font-black text-green-500 uppercase tracking-widest">Sync</span>
             </div>
             <span className="text-[6px] font-mono text-gray-700 uppercase italic">MTU: 1500 / TTL: 64</span>
          </div>
        </div>
      </div>
    </div>
  );
};

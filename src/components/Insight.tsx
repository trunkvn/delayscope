"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Stats {
  totalLogs: number;
  proCount: number;
  focusCount: number;
  totalGuilt: number;
  totalFocus: number;
  avgGuilt: number;
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
  userScore,
  period,
  onPeriodChange
}: { 
  isMapLoaded: boolean;
  countryCode?: string | null;
  userScore?: number;
  period: string;
  onPeriodChange: (p: string) => void;
}) {
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [local, setLocal] = useState<LocalStats | null>(null);
  const [trending, setTrending] = useState<any[]>([]);
  const [delayLeaders, setDelayLeaders] = useState<any[]>([]);
  const [focusLeaders, setFocusLeaders] = useState<any[]>([]);

  useEffect(() => {
    if (!isMapLoaded) return;

    const fetchStats = async () => {
      try {
        let url = countryCode ? `/api/stats?country=${countryCode}` : "/api/stats";
        // Append period if available
        url += (url.includes("?") ? "&" : "?") + `period=${period}`;
        
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
        if (data.delayLeaders) {
          setDelayLeaders(data.delayLeaders);
        }
        if (data.focusLeaders) {
          setFocusLeaders(data.focusLeaders);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [isMapLoaded, countryCode, period]);

  const avgGuilt = stats?.avgGuilt || 0;
  
  const getStatusLabel = (score: number) => {
    if (score < 35) return { label: t("homeInsight.productive"), color: "text-green-500" };
    if (score < 70) return { label: t("homeInsight.distracted"), color: "text-amber-500" };
    return { label: t("homeInsight.chaos"), color: "text-red-500" };
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
        .hud-scrollbar::-webkit-scrollbar-track { background: var(--card-bg); border-radius: 10px; }
        .hud-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); border-radius: 10px; }
        .hud-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
        .hud-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(59, 130, 246, 0.3) transparent; }
      `}</style>
      <div className="relative bg-card/80 backdrop-blur-3xl border border-border-theme rounded-4xl p-6 shadow-2xl flex flex-col gap-6 overflow-hidden transition-all duration-500 shrink-0">
        {/* Corner Decorators */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-border-theme" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-border-theme" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-border-theme" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-border-theme" />

        <div className="overflow-y-auto hud-scrollbar flex flex-col gap-6 pr-1">
          {/* Header - Monitor Identity */}
          <div className="flex items-center justify-between border-b border-border-theme pb-4 shrink-0 transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative w-2.5 h-2.5">
                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-30" />
                <div className="absolute inset-0 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[12px] font-black tracking-[0.5em] text-foreground uppercase leading-none transition-colors">
                  {t("homeInsight.coreTitle")}
                </h3>
                <p className="text-[9px] font-bold text-muted-theme uppercase tracking-widest mt-2">{t("homeInsight.monitoringSystem")}</p>
              </div>
            </div>
            <div className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-sm bg-foreground/5 border border-border-theme ${status.color}`}>
              {status.label}
            </div>
          </div>

          {/* Time Period Filter Integrated */}
          <div className="flex bg-foreground/5 p-1 rounded-2xl gap-1 border border-border-theme">
            {["1h", "6h", "24h", "7d", "15d"].map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all
                  ${period === p 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "text-muted-theme hover:text-foreground hover:bg-foreground/5"}`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Color Key Guide */}
          <div className="flex items-center justify-between px-3 py-2 bg-foreground/5 rounded-xl border border-border-theme shrink-0">
             <p className="text-[8px] font-black text-foreground uppercase tracking-widest mr-2 opacity-50">{t("homeInsight.globalLegend")}</p>
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                   <span className="text-[8px] font-black text-muted-theme uppercase">{t("homeInsight.productive")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                   <span className="text-[8px] font-black text-muted-theme uppercase">{t("homeInsight.distracted")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                   <span className="text-[8px] font-black text-muted-theme uppercase">{t("homeInsight.chaos")}</span>
                </div>
             </div>
          </div>

          {/* Global Statistics Grid */}
          <div className="grid grid-cols-2 gap-8 shrink-0">
            <div className="relative">
              <p className="text-[9px] font-black text-muted-theme uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                 <span className="w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> {t("homeInsight.avgGuilt")}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-foreground tracking-tighter drop-shadow-md transition-colors">
                  {avgGuilt}
                </span>
                <span className="text-[12px] font-black text-muted-theme/80">/ 100</span>
              </div>
            </div>

            <div className="relative pl-6 border-l border-border-theme">
              <p className="text-[8px] font-black text-muted-theme uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                 <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> {t("homeInsight.liveActivity")}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-foreground/90 tracking-tighter transition-colors">
                  {stats?.activeDelayers || 0}
                </span>
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest leading-none ml-1">{t("homeInsight.live")}</span>
              </div>
              <p className="text-[8px] font-bold text-muted-theme/80 mt-1 uppercase transition-colors tracking-widest">{t("homeInsight.logs")} {stats?.totalLogs.toLocaleString()}</p>
            </div>
          </div>

          {/* Global Rankings */}
          <div className="grid grid-cols-2 gap-4 shrink-0">
             {/* Delay Leaders */}
             <div className="space-y-3">
                <p className="text-[8px] font-black text-red-500/50 uppercase tracking-widest flex items-center gap-2">
                   <span className="w-2 h-px bg-red-500/20" /> {t("homeInsight.delayLeaders")}
                </p>
                <div className="flex flex-col gap-2">
                   {delayLeaders.length > 0 ? delayLeaders.map((c, i) => (
                     <div key={`delay-${c.code}`} className="bg-foreground/5 border border-border-theme rounded-lg p-2.5 flex items-center justify-between group hover:border-red-500/20 transition-all">
                        <div className="flex items-center gap-1.5 min-w-0">
                           <span className="text-[9px] font-black text-muted-theme/80 uppercase">#{i+1}</span>
                           <span className="text-sm font-black text-foreground tracking-tighter truncate transition-colors">{c.code}</span>
                        </div>
                        <span className="text-[10px] font-bold text-red-500/60 ml-2">{c.count}</span>
                     </div>
                   )) : (
                     <div className="text-center py-2 text-[9px] text-muted-theme font-black tracking-widest uppercase opacity-20 transition-opacity">---</div>
                   )}
                </div>
             </div>

             {/* Focus Leaders */}
             <div className="space-y-3">
                <p className="text-[8px] font-black text-green-500/50 uppercase tracking-widest flex items-center gap-2">
                   <span className="w-2 h-px bg-green-500/20" /> {t("homeInsight.focusLeaders")}
                </p>
                <div className="flex flex-col gap-2">
                   {focusLeaders.length > 0 ? focusLeaders.map((c, i) => (
                     <div key={`focus-${c.code}`} className="bg-foreground/5 border border-border-theme rounded-lg p-2.5 flex items-center justify-between group hover:border-green-500/20 transition-all">
                        <div className="flex items-center gap-1.5 min-w-0">
                           <span className="text-[9px] font-black text-muted-theme/80 uppercase">#{i+1}</span>
                           <span className="text-sm font-black text-foreground tracking-tighter truncate transition-colors">{c.code}</span>
                        </div>
                        <span className="text-[10px] font-bold text-green-500/60 ml-2">{c.count}</span>
                     </div>
                   )) : (
                     <div className="text-center py-2 text-[9px] text-muted-theme font-black tracking-widest uppercase opacity-20 transition-opacity">---</div>
                   )}
                </div>
             </div>
          </div>

          {/* Spectrum Analysis */}
          <div className="space-y-3 shrink-0">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest transition-colors">
              <span className="text-muted-theme font-bold">{t("homeInsight.spectrum")}</span>
              <div className="flex gap-3">
                <span className="text-green-500/70">FCS {Math.round(focusRatio)}%</span>
                <span className="text-red-500/70">DLY {Math.round(100 - focusRatio)}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden flex relative border border-border-theme">
              <div className="h-full bg-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all duration-1000" style={{ width: `${focusRatio}%` }} />
              <div className="h-full bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-1000" style={{ width: `${100 - focusRatio}%` }} />
            </div>
          </div>

          {/* Wave Visualization */}
          <div className="bg-foreground/5 border border-border-theme rounded-3xl p-5 space-y-4 shrink-0 mb-2 transition-all">
            <div className="flex items-center justify-between">
               <span className="text-[9px] font-black text-muted-theme uppercase tracking-widest">{t("homeInsight.hourlyPulse")}</span>
               <span className="text-[8px] font-black text-red-500/60 uppercase">{t("homeInsight.peakAt")} {stats?.dangerHour}</span>
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
                  className="text-red-500/70 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)] transition-all duration-500"
                />
              </svg>
            </div>

            {/* Distraction List */}
            <div className="space-y-4 pt-3 border-t border-border-theme transition-colors">
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
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-foreground/5 border border-border-theme flex items-center justify-center text-base shadow-inner group-hover:bg-foreground/10 transition-all">
                      {tag.emoji}
                    </div>
                    <div className="flex-1 space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                          <span className="text-muted-theme group-hover:text-foreground transition-colors">{t(`insightsPage.tags.${tag.id}`)}</span>
                          <span className="text-muted-theme/80 font-mono italic group-hover:text-foreground transition-colors">{tag.count}</span>
                       </div>
                       <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden border border-border-theme">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${colors[i % colors.length]}`} 
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
                   <span className="text-[10px] font-black text-blue-400/80 uppercase tracking-widest">{t("homeInsight.nodeMonitor").replace("{country}", countryCode)}</span>
                   <span className="text-[8px] font-black text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded-sm uppercase">{t("insights.live")}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10 font-black">
                   <div>
                      <p className="text-[7px] text-blue-400/50 uppercase mb-0.5 tracking-tighter">{t("homeInsight.avgLocal")}</p>
                      <p className="text-2xl text-foreground tracking-tighter transition-colors">{local.avgGuilt}<span className="text-[10px] text-blue-400/30 ml-0.5">idx</span></p>
                   </div>
                   <div className="text-right">
                      <p className="text-[7px] text-blue-400/50 uppercase mb-0.5 tracking-tighter">{t("homeInsight.signals")}</p>
                      <p className="text-2xl text-foreground tracking-tighter transition-colors">{local.proCount + local.focusCount}</p>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* System Footer */}
        <div className="flex items-center justify-between border-t border-border-theme pt-4 opacity-30 grayscale group-hover:grayscale-0 transition-all shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[7px] font-mono font-black text-muted-theme uppercase tracking-[0.3em]">SYSTEM://LATERSYNC_CORE_V1</span>
            <span className="text-[6px] font-bold text-muted-theme/80 uppercase">Authenticated Access / 0x4F92</span>
          </div>
          <div className="text-right flex flex-col gap-0.5 items-end">
             <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                <span className="text-[7px] font-black text-green-500 uppercase tracking-widest leading-none">{t("homeInsight.sync")}</span>
             </div>
             <span className="text-[6px] font-mono text-muted-theme/80 uppercase italic">MTU: 1500 / TTL: 64</span>
          </div>
        </div>
      </div>
    </div>
  );
};

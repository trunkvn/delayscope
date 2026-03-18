"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface RankedCountry {
  code: string;
  count: number;
}

export default function InsightsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/stats");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch insight data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const global = data?.global;
  const topCountries = data?.topCountries || [];
  const trendingTags = data?.trendingTags || [];
  const hourlyData = global?.hourlySparkline || [];

  const avgGuilt = global && global.proCount > 0 
    ? Math.round(global.totalGuilt / global.proCount) 
    : 0;

  const stats = [
    { label: t("insightsPage.totalUsers"), value: global?.totalLogs.toLocaleString() || "0", trend: "LOGS", color: "text-blue-400" },
    { label: t("insights.activeUsers") || "Active DelayScopes", value: global?.activeDelayers || "0", trend: "LIVE", color: "text-green-400" },
    { label: t("insightsPage.guiltIndex"), value: `${avgGuilt}%`, trend: "AVG", color: "text-red-400" },
    { label: "Danger Hour", value: global?.dangerHour || "N/A", trend: "PEAK", color: "text-amber-400" },
  ];

  const getTagSize = (count: number, max: number) => {
    const ratio = count / (max || 1);
    if (ratio > 0.8) return "text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]";
    if (ratio > 0.5) return "text-2xl md:text-3xl font-black text-white/80";
    if (ratio > 0.3) return "text-xl font-bold text-white/60";
    return "text-sm font-medium text-white/40";
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center space-y-2">
             <p className="text-blue-400 font-black text-xs animate-pulse tracking-[0.3em] uppercase">Synchronizing Core</p>
             <p className="text-gray-600 text-[9px] font-mono tracking-widest uppercase">Fetching global focus vectors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="w-screen h-screen bg-black overflow-y-auto font-sans text-white flex flex-col relative custom-scrollbar">
      <Header />

      <div className="flex-1 max-w-6xl mx-auto px-8 py-16 w-full mt-20">
        <header className="mb-16 space-y-4 text-center">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter animate-fade-in-up">
            World <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-600">Focus Report</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto animate-fade-in-up delay-100 italic text-sm md:text-base">
            "{t("insightsPage.reportDesc")}"
          </p>
        </header>

        {/* Top Dash Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 animate-fade-in-up delay-200">
          {stats.map((stat, i) => (
            <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-3xl p-7 backdrop-blur-3xl hover:border-blue-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-1000" />
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black mb-3 group-hover:text-gray-400 transition-colors">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] text-gray-600 font-mono font-bold tracking-widest">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-3xl animate-fade-in-up delay-300 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-2xl font-black tracking-tight">{t("insightsPage.focusTrends")}</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Average Global Guilt Index / 24H</p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                <span className="text-[9px] uppercase text-gray-400 font-black tracking-widest">Live Feed</span>
              </div>
            </div>

            <div className="flex items-end justify-between h-64 gap-2.5 px-2 border-b border-white/5 pb-2 relative z-10">
              {hourlyData.map((h: number, i: number) => (
                <div key={i} className="flex-1 group/bar relative h-full flex flex-col justify-end">
                  <div 
                    className="w-full bg-linear-to-t from-blue-600/40 to-blue-400/60 rounded-t-md group-hover/bar:from-blue-500 group-hover/bar:to-blue-300 transition-all cursor-crosshair relative border-x border-white/5"
                    style={{ height: `${Math.max(h, 4)}%` }}
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all shadow-[0_8px_20px_rgba(59,130,246,0.4)] whitespace-nowrap z-30 scale-75 group-hover/bar:scale-100 border border-white/20">
                      IDX: {h}%
                    </div>
                  </div>
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 font-mono font-bold tracking-tighter opacity-50 group-hover/bar:opacity-100 transition-opacity">
                    {i}:00
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Leaderboard */}
          <div className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-3xl animate-fade-in-up delay-400">
            <h2 className="text-2xl font-black tracking-tight mb-10">Wall of Delay</h2>
            <div className="space-y-8">
              {topCountries.length > 0 ? topCountries.map((c: RankedCountry, i: number) => (
                <div key={c.code} className="flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <span className="text-3xl font-black text-white/10 group-hover:text-white/30 transition-all font-mono">0{i + 1}</span>
                    <div>
                      <p className="text-lg font-black text-white tracking-tight">{c.code}</p>
                      <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-red-500/80 mt-0.5">
                        {c.count.toLocaleString()} Vectors Detected
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-28 h-2 bg-white/5 rounded-full overflow-hidden mt-1 p-0.5 border border-white/5">
                      <div 
                        className="h-full bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all duration-1500"
                        style={{ width: `${(c.count / (topCountries[0]?.count || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-700 gap-3 border border-dashed border-white/5 rounded-3xl">
                   <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin opacity-20" />
                   <p className="font-mono text-[10px] tracking-widest uppercase">Waiting for global activity...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Excuse Cloud */}
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up delay-500 mb-16">
           <div className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <span className="text-8xl font-black">#</span>
             </div>
             <h2 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-3">
               <span className="text-red-500 animate-pulse">🔥</span> {t("insightsPage.distractionCloud") || "Trending Distractions"}
             </h2>
             <div className="flex flex-wrap gap-x-6 gap-y-4 items-center relative z-10">
                {trendingTags.length > 0 ? trendingTags.map((tag: any, i: number) => (
                  <span 
                    key={i} 
                    className={`${getTagSize(tag.count, trendingTags[0]?.count)} hover:text-blue-400 hover:scale-110 transition-all cursor-crosshair select-none`}
                  >
                    {tag.emoji} {tag.label}
                  </span>
                )) : (
                  <div className="w-full py-12 text-center">
                    <p className="text-gray-600 font-mono text-xs italic">No distraction vectors detected in current window.</p>
                  </div>
                )}
             </div>
           </div>

           <div className="bg-linear-to-br from-blue-600 to-purple-800 rounded-[2.5rem] p-0.5 transition-all hover:scale-[1.01] shadow-2xl hover:shadow-blue-500/10">
              <div className="bg-black w-full h-full rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center space-y-8">
                 <h2 className="text-4xl font-black tracking-tighter leading-none">{t("insightsPage.delayingQuest")}</h2>
                 <p className="text-gray-400 text-base italic max-w-sm">"{t("insightsPage.delayingDesc")}"</p>
                 <Link 
                    href="/"
                    className="px-10 py-4 bg-white text-black font-black rounded-full hover:bg-gray-200 transition-all uppercase tracking-widest text-[10px] shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                  >
                    {t("insightsPage.goLog")}
                 </Link>
              </div>
           </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

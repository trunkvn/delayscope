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
  const [period, setPeriod] = useState("24h");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/stats?period=${period}`);
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
  }, [period]);

  const global = data?.global;
  const delayLeaders = data?.delayLeaders || [];
  const focusLeaders = data?.focusLeaders || [];
  const trendingTags = data?.trendingTags || [];
  const hourlyData = global?.hourlySparkline || [];

  const avgGuilt = global?.avgGuilt || 0;
  const avgFocus = global?.avgFocus || 0;

  const stats = [
    { label: t("insightsPage.totalUsers"), value: global?.totalLogs?.toLocaleString() || "0", trend: "LOGS", color: "text-blue-400" },
    { label: t("insights.activeUsers"), value: global?.activeDelayers || "0", trend: "LIVE", color: "text-green-400" },
    { label: t("insightsPage.guiltIndex"), value: `${avgGuilt}%`, trend: "AVG", color: "text-red-400" },
    { label: t("insightsPage.dangerHour"), value: global?.dangerHour || "N/A", trend: "PEAK", color: "text-amber-400" },
  ];

  const getTagSize = (count: number, max: number) => {
    const ratio = count / (max || 1);
    if (ratio > 0.8) return "text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]";
    if (ratio > 0.5) return "text-2xl md:text-3xl font-black text-white/80";
    if (ratio > 0.8) return "text-4xl md:text-5xl font-black text-foreground drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]";
    if (ratio > 0.5) return "text-2xl md:text-3xl font-black text-foreground/80";
    if (ratio > 0.3) return "text-xl font-bold text-foreground/60";
    return "text-sm font-medium text-foreground/40";
  };

  if (loading && !data) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-foreground/40 font-mono text-[10px] tracking-[0.3em] uppercase animate-pulse">
            Accessing Global Consciousness...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-screen h-screen bg-background overflow-y-auto font-sans text-foreground flex flex-col relative custom-scrollbar transition-colors duration-500">
      <Header />

      <div className={`flex-1 max-w-6xl mx-auto px-8 py-16 w-full mt-20 transition-all duration-500 ${loading ? "opacity-40 grayscale-[0.5]" : "opacity-100"}`}>
        {loading && data && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-blue-600/80 backdrop-blur-md px-4 py-2 rounded-full border border-border-theme shadow-2xl animate-fade-in">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-black tracking-widest uppercase text-white">Synchronizing Data...</span>
          </div>
        )}
        <header className="mb-16 space-y-4 text-center">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter animate-fade-in-up uppercase">
            {t("insightsPage.reportTitle")}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto animate-fade-in-up delay-100 italic text-sm md:text-base">
            "{t("insightsPage.reportDesc")}"
          </p>
        </header>

        {/* Period Filter */}
        <div className="max-w-md mx-auto mb-16 animate-fade-in-up delay-150">
          <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl gap-1.5 border border-border-theme backdrop-blur-3xl shadow-2xl">
            {["1h", "6h", "24h", "7d", "15d"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setLoading(true);
                  setPeriod(p);
                }}
                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300
                  ${period === p 
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] -translate-y-px" 
                    : "text-gray-500 hover:text-white hover:bg-white/5"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Top Dash Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 animate-fade-in-up delay-200">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-card border border-border-theme rounded-[2.5rem] p-10 backdrop-blur-3xl relative overflow-hidden group hover:border-blue-500/30 transition-all ${stat.color.replace("text-", "shadow-")}`}>
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className={`w-12 h-12 rounded-full ${stat.color.replace("text-", "bg-")}`} />
              </div>
              <p className="text-[10px] font-black tracking-[0.2em] mb-4 text-muted-theme uppercase">{stat.label}</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] text-muted-theme font-mono font-bold tracking-widest">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-16">
          {/* Main Chart Area */}
          <div className="w-full bg-card border border-border-theme rounded-[2.5rem] p-10 backdrop-blur-3xl animate-fade-in-up delay-300 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  {t("insightsPage.focusTrends").split(" (")[0]} ({period})
                </h2>
                <p className="text-[10px] text-muted-theme font-black uppercase tracking-widest mt-1">
                  Average Global Guilt Index / {period}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-full border border-border-theme">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                <span className="text-[9px] uppercase text-muted-theme font-black tracking-widest">{t("insights.live")}</span>
              </div>
            </div>

            <div className="flex items-end justify-between h-64 gap-2.5 px-2 border-b border-border-theme pb-2 relative z-10">
              {hourlyData.map((h: number, i: number) => (
                <div key={i} className="flex-1 group/bar relative h-full flex flex-col justify-end">
                  <div 
                    className="w-full bg-linear-to-t from-blue-600/40 to-blue-400/60 rounded-t-md group-hover/bar:from-blue-500 group-hover/bar:to-blue-300 transition-all cursor-crosshair relative border-x border-border-theme"
                    style={{ height: `${Math.max(h, 4)}%` }}
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all shadow-[0_8px_20px_rgba(59,130,246,0.4)] whitespace-nowrap z-30 scale-75 group-hover/bar:scale-100 border border-white/20">
                      IDX: {h}%
                    </div>
                  </div>
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-muted-theme font-mono font-bold tracking-tighter opacity-50 group-hover/bar:opacity-100 transition-opacity">
                    {i}:00
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Wall of Delay */}
          <div className="bg-card border border-border-theme rounded-[2.5rem] p-10 backdrop-blur-3xl animate-fade-in-up delay-400">
            <h2 className="text-2xl font-black tracking-tight mb-10 flex items-center gap-3 text-foreground">
               <span className="text-red-500">💀</span> {t("insightsPage.wallOfShame")}
            </h2>
            <div className="space-y-8">
              {delayLeaders.length > 0 ? delayLeaders.map((c: RankedCountry, i: number) => (
                <div key={c.code} className="flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <span className="text-3xl font-black text-foreground/10 group-hover:text-foreground/30 transition-all font-mono">0{i + 1}</span>
                    <div>
                      <p className="text-lg font-black text-foreground tracking-tight">{c.code}</p>
                      <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-red-500/80 mt-0.5">
                        {c.count.toLocaleString()} {t("homeInsight.signals")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-28 h-2 bg-foreground/5 rounded-full overflow-hidden mt-1 p-0.5 border border-border-theme">
                      <div 
                        className="h-full bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all duration-1500"
                        style={{ width: `${(c.count / (delayLeaders[0]?.count || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-64 flex flex-col items-center justify-center text-muted-theme gap-3 border border-dashed border-border-theme rounded-3xl">
                   <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin opacity-20" />
                   <p className="font-mono text-[10px] tracking-widest uppercase">{t("home.statusLocating")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Wall of Fame */}
          <div className="bg-card border border-border-theme rounded-[2.5rem] p-10 backdrop-blur-3xl animate-fade-in-up delay-400">
            <h2 className="text-2xl font-black tracking-tight mb-10 flex items-center gap-3 text-foreground">
               <span className="text-green-500">👑</span> {t("insightsPage.hallOfFame")}
            </h2>
            <div className="space-y-8">
              {focusLeaders.length > 0 ? focusLeaders.map((c: RankedCountry, i: number) => (
                <div key={c.code} className="flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <span className="text-3xl font-black text-foreground/10 group-hover:text-foreground/30 transition-all font-mono">0{i + 1}</span>
                    <div>
                      <p className="text-lg font-black text-foreground tracking-tight">{c.code}</p>
                      <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-green-500/80 mt-0.5">
                        {c.count.toLocaleString()} {t("homeInsight.signals")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-28 h-2 bg-foreground/5 rounded-full overflow-hidden mt-1 p-0.5 border border-border-theme">
                      <div 
                        className="h-full bg-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.5)] transition-all duration-1500"
                        style={{ width: `${(c.count / (focusLeaders[0]?.count || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-64 flex flex-col items-center justify-center text-muted-theme gap-3 border border-dashed border-border-theme rounded-3xl">
                   <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin opacity-20" />
                   <p className="font-mono text-[10px] tracking-widest uppercase">{t("home.statusLocating")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Excuse Cloud */}
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up delay-500 mb-16">
           <div className="bg-card border border-border-theme rounded-[2.5rem] p-10 backdrop-blur-3xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-8xl font-black text-foreground">#</span>
             </div>
             <h2 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-3 text-foreground">
               <span className="text-red-500 animate-pulse">🔥</span> {t("insightsPage.distractionCloud") || "Trending Distractions"}
             </h2>
             <div className="space-y-6 relative z-10">
                {trendingTags.length > 0 ? (
                  trendingTags.slice(0, 10).map((tag: any, i: number) => {
                    const colors = [
                      "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]",
                      "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]",
                      "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]",
                      "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]",
                      "bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.4)]",
                      "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]",
                      "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]",
                    ];
                    return (
                      <div key={i} className="flex items-center gap-4 group/tag">
                        <div className="w-12 h-12 shrink-0 bg-foreground/5 rounded-2xl flex items-center justify-center text-2xl border border-border-theme border-b-2 border-b-foreground/10 group-hover/tag:bg-foreground/10 transition-all">
                          {tag.emoji}
                        </div>
                        <div className="flex-1 space-y-2">
                           <div className="flex justify-between items-center px-1">
                              <p className="text-[10px] font-black tracking-widest text-muted-theme uppercase group-hover/tag:text-foreground transition-colors">
                                {t(`insightsPage.tags.${tag.id}`)}
                              </p>
                              <p className="text-[11px] font-mono font-black italic text-foreground/40 group-hover/tag:text-foreground/60 transition-colors">
                                {tag.count}
                              </p>
                           </div>
                           <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden border border-border-theme">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${colors[i % colors.length]}`}
                                style={{ width: `${(tag.count / (trendingTags[0]?.count || 1)) * 100}%` }}
                              />
                           </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full py-12 text-center text-muted-theme">
                    <p className="text-muted-theme font-mono text-xs italic">{t("insights.noData") || "No distraction vectors detected in current window."}</p>
                  </div>
                )}
             </div>
           </div>

           <div className="bg-card border border-border-theme rounded-[2.5rem] p-10 backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-8xl font-black text-foreground">?</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-3 text-foreground">
                <span className="text-purple-500">❓</span> {t("insightsPage.delayingQuest")}
              </h2>
              <p className="text-muted-theme font-black italic relative z-10 leading-relaxed group-hover:text-foreground transition-colors">
                "{t("insightsPage.delayingDesc")}"
              </p>
              <div className="mt-12 flex flex-col gap-4 relative z-10">
                 <Link href="/" className="group/btn relative inline-flex items-center justify-center bg-blue-600 text-white font-black text-[10px] tracking-[0.3em] uppercase transition-all hover:bg-blue-500 px-8 py-5 rounded-2xl shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:translate-y-[-2px] active:translate-y-[1px]">
                   {t("insightsPage.goLog")}
                   <span className="ml-3 group-hover/btn:translate-x-1 transition-transform">→</span>
                 </Link>
              </div>
           </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

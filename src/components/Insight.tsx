"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

const Insight = ({ isMapLoaded }: { isMapLoaded: boolean }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div
      className={`absolute bottom-24 md:top-6 md:bottom-6 right-4 md:right-8 z-20 pointer-events-none flex flex-col items-end max-w-[calc(100%-2rem)] md:max-w-sm w-full transition-all duration-500 delay-500 ${isMapLoaded ? "animate-fade-in-up" : "opacity-0"}`}
    >
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden pointer-events-auto flex items-center gap-2 bg-zinc-900/90 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full mb-2 shadow-lg"
      >
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        <span className="text-[10px] font-black tracking-widest text-white uppercase">
          {isOpen ? "Hide Insights" : t("insights.title")}
        </span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <div className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 w-full shadow-[0_4px_30px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col h-full max-h-[400px] md:max-h-[800px] transition-all duration-500 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto"}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            <h3 className="text-white font-bold text-xs tracking-widest uppercase">
              {t("insights.title")}
            </h3>
          </div>
          <span className="text-[8px] md:text-[9px] font-black tracking-widest bg-white/10 px-1.5 md:px-2 py-0.5 rounded text-gray-300">
            {t("insights.live")}
          </span>
        </div>
        <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-4 md:mb-6 shrink-0 border-b border-white/5 pb-3 md:pb-4">
          {t("insights.summary")}
        </p>
        
        {/* Scrollable Content */}
        <div className="space-y-4 md:space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {/* Stat 1: Total & Trend */}
          <div className="flex justify-between items-end bg-white/5 p-3 md:p-4 rounded-xl border border-white/5">
            <div>
              <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-1 md:mb-1.5">
                {t("insights.totalLogs")}
              </p>
              <p className="text-3xl md:text-4xl font-black text-white">124,592</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold mb-1">
                <svg
                  className="w-2.5 md:w-3 h-2.5 md:h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                12%
              </div>
              <p className="text-[8px] md:text-[9px] text-gray-600 uppercase">{t("insights.vsYesterday")}</p>
            </div>
          </div>

          {/* Stat 2: Global Ratio Split */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest">
                {t("insights.ratioTitle")}
              </p>
            </div>
            <div className="flex gap-1.5 h-2.5 md:h-3 w-full rounded-full overflow-hidden mb-3 bg-white/5 p-0.5">
              <div className="bg-linear-to-r from-red-600 to-red-500 h-full w-[68%] rounded-full relative shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                <div className="absolute inset-0 bg-white/20 w-1/2 rounded-full blur-[2px]"></div>
              </div>
              <div className="bg-linear-to-r from-green-500 to-green-400 h-full w-[32%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            </div>
            <div className="flex justify-between text-[10px] md:text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-red-500"></div>
                <span className="text-red-400">{`68% ${t("insights.delaying")}`}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-green-500"></div>
                <span className="text-green-400">{`32% ${t("insights.focused")}`}</span>
              </div>
            </div>
          </div>

          {/* Map Legend & Data Filter */}
          <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/5">
            <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-3">
              {t("insights.legendTitle")}
            </p>

            {/* Legend */}
            <div className="flex justify-between items-center mb-1 text-[10px] font-medium text-gray-300">
              <div className="flex flex-col items-center gap-1">
                <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full border border-red-500/50 bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                <span className="text-[8px] md:text-[10px]">{`${t("insights.delaying")} > 60%`}</span>
              </div>
              <div className="w-3 md:w-4 h-px bg-white/10"></div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full border border-amber-500/50 bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                <span className="text-[8px] md:text-[10px]">{t("insights.average")}</span>
              </div>
              <div className="w-3 md:w-4 h-px bg-white/10"></div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full border border-green-500/50 bg-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="text-[8px] md:text-[10px]">{`${t("insights.focused")} > 60%`}</span>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-white/5"></div>

          {/* Stat 3: Top Regions Compare */}
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div className="bg-red-950/20 rounded-xl p-2.5 md:p-3 border border-red-500/20 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-12 md:w-16 h-12 md:h-16 bg-red-500/10 rounded-full blur-xl"></div>
              <p className="text-[8px] md:text-[9px] text-red-200/50 uppercase tracking-widest mb-1 md:mb-1.5">
                {t("insights.mostDistracted")}
              </p>
              <p className="text-xs md:text-sm font-bold text-red-100 line-clamp-1 mb-1">
                Tokyo, Japan
              </p>
              <p className="text-lg md:text-xl font-black text-red-400 mb-0.5 md:mb-1">88%</p>
              <p className="text-[9px] md:text-[10px] text-red-300/70 line-clamp-1">
                "{t("insights.anime")}"
              </p>
            </div>

            <div className="bg-green-950/20 rounded-xl p-2.5 md:p-3 border border-green-500/20 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-12 md:w-16 h-12 md:h-16 bg-green-500/10 rounded-full blur-xl"></div>
              <p className="text-[8px] md:text-[9px] text-green-200/50 uppercase tracking-widest mb-1 md:mb-1.5">
                {t("insights.mostFocused")}
              </p>
              <p className="text-xs md:text-sm font-bold text-green-100 line-clamp-1 mb-1">
                Berlin, DE
              </p>
              <p className="text-lg md:text-xl font-black text-green-400 mb-0.5 md:mb-1">72%</p>
              <p className="text-[9px] md:text-[10px] text-green-300/70 line-clamp-1">
                "{t("insights.deepWork")}"
              </p>
            </div>
          </div>

          {/* Stat 5: Analytics Box */}
          <div>
            <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-2">
              {t("insights.productivityLost")}
            </p>
            <div className="flex items-center gap-3 bg-red-500/10 p-3 md:p-4 rounded-xl border border-red-500/20">
              <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 md:w-5 h-4 md:h-5 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-white">
                  4.2M{" "}
                  <span className="text-[10px] md:text-sm font-medium text-red-200/60 uppercase tracking-wider">
                    {t("insights.hours")}
                  </span>
                </p>
                <p className="text-[8px] md:text-[10px] text-gray-400 mt-1 border-t border-red-500/20 pt-1">
                  {t("insights.globallyWasted")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insight;

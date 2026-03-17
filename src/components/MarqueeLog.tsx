"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

const MarqueeLog = ({ isMapLoaded }: { isMapLoaded: boolean }) => {
  const { t } = useLanguage();

  const logs = [
    { city: "🇯🇵 Tokyo", state: t("marquee.delaying"), action: t("marquee.anime"), color: "text-red-400" },
    { city: "🇺🇸 New York", state: t("marquee.focused"), action: t("marquee.coding"), color: "text-green-400" },
    { city: "🇻🇳 Hanoi", state: t("marquee.delaying"), action: t("marquee.coffee"), color: "text-red-400" },
    { city: "🇩🇪 Berlin", state: t("marquee.focused"), action: t("marquee.deepWork"), color: "text-green-400" },
    { city: "🇬🇧 London", state: t("marquee.delaying"), action: t("marquee.tea"), color: "text-red-400" },
    { city: "🇦🇺 Sydney", state: t("marquee.focused"), action: t("marquee.data"), color: "text-green-400" },
    { city: "🇫🇷 Paris", state: t("marquee.delaying"), action: t("marquee.croissant"), color: "text-red-400" },
    { city: "🇧🇷 Sao Paulo", state: t("marquee.delaying"), action: t("marquee.dancing"), color: "text-red-400" },
    { city: "🇨🇳 Beijing", state: t("marquee.focused"), action: t("marquee.studying"), color: "text-green-400" },
    { city: "🇰🇷 Seoul", state: t("marquee.delaying"), action: t("marquee.kpop"), color: "text-red-400" },
  ];

  return (
    <div
      className={`absolute bottom-8 left-8 right-[430px] z-30 flex flex-col gap-2 pointer-events-none delay-300 ${isMapLoaded ? "animate-fade-in-up" : "opacity-0"}`}
    >
      {/* Static Title ABOVE the bar */}
      <div className="flex items-center gap-2 pl-4">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
        <span className="text-[10px] text-gray-300 uppercase tracking-widest font-bold drop-shadow-md">
          {t("marquee.title")}
        </span>
      </div>

      {/* Scrollable Marquee Box */}
      <div className="h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden flex items-center shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto">
        <div className="flex items-center h-full w-max animate-marquee">
          {/* Loop array twice to ensure seamless infinite scroll */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              {logs.map((log, index) => (
                <span key={index} className="text-[11px] font-medium text-gray-300 px-6 border-r border-white/10 whitespace-nowrap">
                  {log.city}:{" "}
                  <span className={log.color}>
                    {log.state} ({log.action})
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarqueeLog;
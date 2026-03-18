"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface MarqueeItem {
  id: string;
  type: string;
  score: number;
  label: string;
  emoji: string;
  country: string;
  timestamp: string;
}

export default function MarqueeLog({ isMapLoaded }: { isMapLoaded: boolean }) {
  const { t } = useLanguage();
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    if (!isMapLoaded) return;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.trendingTags) {
          setTrending(data.trendingTags);
        }
      } catch (error) {
        console.error("Failed to fetch trending tags:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [isMapLoaded]);

  const totalCount = trending.reduce((acc, curr) => acc + curr.count, 0);

  if (trending.length === 0) return null;

  return (
    <div
      className={`absolute bottom-6 left-6 right-110 z-10 transition-all duration-1000 transform ${
        isMapLoaded ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
    >
      <div className="bg-[#0f0f13]/90 backdrop-blur-xl border border-white/5 rounded-2xl px-6 py-2 shadow-2xl flex flex-col gap-1 overflow-hidden">
        <div className="flex items-center gap-2">
          {/* <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> */}
          <h3 className="text-[10px] font-mono font-black tracking-[0.2em] text-gray-500 uppercase">
            {t("marquee.title") || "Global Activity Stream"}
          </h3>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
            {trending.map((tag) => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-2 bg-[#1a1a20] hover:bg-[#25252d] transition-colors border border-white/5 rounded-full px-3 py-0.5 group cursor-default"
              >
                <span className="text-base">{tag.emoji}</span>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">
                  {tag.label}
                </span>
                <span className={`text-[10px] font-mono font-black ml-1 ${tag.type === 'FOCUS' ? 'text-green-500' : 'text-red-500'}`}>
                  {((tag.count / totalCount) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
            {/* Duplicated for smooth loop */}
            {trending.map((tag) => (
              <div
                key={`${tag.id}-dup`}
                className="inline-flex items-center gap-2 bg-[#1a1a20] hover:bg-[#25252d] transition-colors border border-white/5 rounded-full px-3 py-0.5 group cursor-default"
              >
                <span className="text-base">{tag.emoji}</span>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">
                  {tag.label}
                </span>
                <span className={`text-[10px] font-mono font-black ml-1 ${tag.type === 'FOCUS' ? 'text-green-500' : 'text-red-500'}`}>
                  {((tag.count / totalCount) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

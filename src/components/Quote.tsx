"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

const Quote = ({
  isMapLoaded,
  locationStatus,
  setIsLogModalOpen,
}: {
  isMapLoaded: boolean;
  locationStatus: "checking" | "granted" | "denied";
  setIsLogModalOpen: (open: boolean) => void;
}) => {
  const { t } = useLanguage();

  return (
    <div className="absolute top-6 left-8 z-10 pointer-events-none flex flex-col items-start max-w-sm">
      <div
        className={`inline-block mb-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md delay-100 ${isMapLoaded ? "animate-fade-in-up" : "opacity-0"}`}
      >
        <span className="text-[10px] font-semibold tracking-widest text-blue-300 uppercase">
          {t("home.trackerTag")}
        </span>
      </div>
      <h2
        className={`text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white via-gray-200 to-gray-500 drop-shadow-md leading-tight text-left delay-200 ${isMapLoaded ? "animate-fade-in-up" : "opacity-0"}`}
      >
        {t("home.rhythmLine1")} <br />
        <span className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {t("home.rhythmLine2")}
        </span>
      </h2>
      <p
        className={`mt-2 text-gray-400 text-sm font-light tracking-wide text-shadow-sm text-left delay-300 ${isMapLoaded ? "animate-fade-in-up" : "opacity-0"}`}
      >
        {t("home.rhythmSub")}
      </p>

      <button
        onClick={() => setIsLogModalOpen(true)}
        disabled={locationStatus !== "granted"}
        className={`mt-8 pointer-events-auto group relative px-8 py-3.5 bg-black/60 backdrop-blur-xl rounded-full border transition-all duration-500 shadow-[0_0_25px_rgba(59,130,246,0.2)] flex items-center gap-3 overflow-hidden delay-400 ${isMapLoaded ? "animate-fade-in-up" : "opacity-0"} ${
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
          <div
            className={`absolute inset-0 rounded-full animate-ping opacity-75 ${locationStatus === "granted" ? "bg-blue-500" : "bg-gray-500"}`}
          ></div>
          <div
            className={`relative w-2 h-2 rounded-full ${locationStatus === "granted" ? "bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,1)]" : "bg-gray-400 shadow-[0_0_10px_rgba(156,163,175,1)]"}`}
          ></div>
        </div>

        <span className="relative font-bold text-white tracking-widest text-sm uppercase">
          {locationStatus === "checking"
            ? t("home.statusLocating")
            : locationStatus === "denied"
              ? t("home.statusRequired")
              : t("home.statusLog")}
        </span>

        {locationStatus === "granted" && (
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
            <svg
              className="w-3.5 h-3.5 text-blue-300 group-hover:text-white group-hover:translate-x-0.5 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
};

export default Quote;

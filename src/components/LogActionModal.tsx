"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface LogActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number; country: string } | null;
  onSeePin: (type: string, score: number) => void;
}

export default function LogActionModal({
  isOpen,
  onClose,
  userLocation,
  onSeePin,
}: LogActionModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(0);
  const [actionType, setActionType] = useState<
    "focus" | "procrastinate" | null
  >(null);
  const [activityInput, setActivityInput] = useState("");

  if (!isOpen) return null;

  const handleNext = () => setStep((prev) => prev + 1);

  const handleClose = () => {
    setStep(1);
    setActionType(null);
    setActivityInput("");
    onClose();
  };

  const handleSubmit = () => {
    // Random score
    const randomScore = Math.floor(Math.random() * 40) + 60; // 60-99
    setScore(randomScore);
    setStep(3); // Loading Sync
    setTimeout(() => {
      setStep(4); // Component Card
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            <h2 className="text-lg font-bold tracking-wider text-white uppercase">
              {t("modal.logStatus")}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
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
        <div className="p-8 min-h-[300px] flex flex-col justify-center">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-modal-up">
              <h3 className="text-2xl font-black text-center mb-2">
                {t("modal.stateQuestion")}
              </h3>
              <p className="text-gray-400 text-center mb-8 text-sm">
                {t("modal.stateSub")}
              </p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setActionType("procrastinate");
                    handleNext();
                  }}
                  className="group relative px-6 py-4 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-all flex items-center gap-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 text-red-400 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6"
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
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-red-100 text-lg">
                      {t("modal.procrastinating")}
                    </p>
                    <p className="text-sm text-red-300/60">
                      {t("modal.proDescription")}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActionType("focus");
                    handleNext();
                  }}
                  className="group relative px-6 py-4 rounded-xl border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-all flex items-center gap-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 text-green-400 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-100 text-lg">{t("modal.focusing")}</p>
                    <p className="text-sm text-green-300/60">
                      {t("modal.focusDescription")}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate-modal-left">
              <h3 className="text-2xl font-black text-center mb-2">
                {actionType === "procrastinate"
                  ? t("modal.insteadQuestion")
                  : t("modal.workingQuestion")}
              </h3>
              <p className="text-gray-400 text-center mb-8 text-sm">
                {actionType === "procrastinate"
                  ? t("modal.confessSins")
                  : t("modal.impressUs")}
              </p>

              <input
                type="text"
                autoFocus
                placeholder={
                  actionType === "procrastinate"
                    ? t("modal.placeholderPro")
                    : t("modal.placeholderFocus")
                }
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center text-lg"
              />

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  {t("modal.back")}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={activityInput.trim().length === 0}
                  className="px-6 py-2 rounded-lg bg-white text-black font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                >
                  {t("modal.submit")}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 (Syncing) */}
          {step === 3 && (
            <div className="animate-modal-zoom flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-500/20 border-2 border-blue-500 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-ping opacity-20" />
                <div className="w-8 h-8 rounded-full bg-blue-400 animate-pulse relative z-10" />
              </div>
              <h3 className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500 mb-4">
                {t("modal.syncing")}
              </h3>
              <p className="text-gray-400">
                {t("modal.syncingSub")}
              </p>
            </div>
          )}

          {/* STEP 4 (Result Card) */}
          {step === 4 && (
            <div className="animate-modal-up w-full max-w-sm mx-auto">
              <div
                className={`p-6 rounded-2xl border ${actionType === "procrastinate" ? "bg-red-950/20 border-red-500/30" : "bg-green-950/20 border-green-500/30"} flex flex-col relative overflow-hidden backdrop-blur-xl`}
              >
                {/* Glow behind */}
                <div
                  className={`absolute -top-20 -right-20 w-40 h-40 blur-[80px] rounded-full opacity-50 ${actionType === "procrastinate" ? "bg-red-500" : "bg-green-500"}`}
                ></div>

                {/* Score */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <p
                      className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${actionType === "procrastinate" ? "text-red-400" : "text-green-400"}`}
                    >
                      {actionType === "procrastinate"
                        ? t("modal.guiltIndex")
                        : t("modal.focusScore")}
                    </p>
                    <h4 className="text-6xl font-black text-white">
                      {score}
                      <span className="text-xl text-gray-500 font-medium tracking-normal">
                        /100
                      </span>
                    </h4>
                  </div>
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg ${actionType === "procrastinate" ? "border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "border-green-500/50 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"}`}
                  >
                    {actionType === "procrastinate" ? (
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

                {/* Quotes */}
                <div className="mb-8 relative z-10 border-l-2 border-white/20 pl-4 py-1">
                  <h5 className="text-xl font-bold text-white mb-1.5">
                    {actionType === "procrastinate"
                      ? t("modal.masterDelay")
                      : t("modal.unstoppableForce")}
                  </h5>
                  <p className="text-sm text-gray-400 italic font-medium">
                    "
                    {actionType === "procrastinate"
                      ? t("modal.proQuote")
                      : t("modal.focusQuote")}
                    "
                  </p>
                </div>

                {/* Compare Stats */}
                <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
                  <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-between">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                      {t("modal.globalAvg")}
                    </p>
                    <div>
                      <p className="text-xl font-bold text-gray-200">
                        {actionType === "procrastinate" ? "72/100" : "65/100"}
                      </p>
                      <p
                        className={`text-[11px] font-semibold mt-1 ${score > 72 && actionType === "procrastinate" ? "text-red-400" : "text-green-400"}`}
                      >
                        {score > 72 ? `▲ ${t("modal.aboveAvg")}` : `▼ ${t("modal.belowAvg")}`}
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-between">
                    <p
                      className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 truncate"
                      title={userLocation?.country}
                    >
                      {userLocation?.country || "Local"} {t("modal.localAvg")}
                    </p>
                    <div>
                      <p className="text-xl font-bold text-gray-200">
                        {actionType === "procrastinate" ? "85/100" : "60/100"}
                      </p>
                      <p
                        className={`text-[11px] font-semibold mt-1 ${(score > 85 && actionType === "procrastinate") || (score < 60 && actionType === "focus") ? "text-red-400" : "text-green-400"}`}
                      >
                        {score > 85 ? `▲ ${t("modal.settingRecords")}` : `▼ ${t("modal.playingSafe")}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onSeePin(actionType || "procrastinate", score)}
                  className={`relative z-10 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-1 ${
                    actionType === "procrastinate"
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                      : "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <circle cx="12" cy="11" r="3" fill="currentColor" />
                  </svg>
                  {t("modal.seePin")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

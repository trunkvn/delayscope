"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { TAGS, Tag } from "@/constants/tags";
import { logActivity } from "@/app/actions/logActions";
import { motion, AnimatePresence } from "framer-motion";

interface LogActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number; country: string } | null;
  countryCode: string | null;
  onSeePin: (type: string, score: number, description: string, id?: string) => void;
}

export default function LogActionModal({
  isOpen,
  onClose,
  userLocation,
  countryCode,
  onSeePin,
}: LogActionModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(0);
  const [actionType, setActionType] = useState<
    "focus" | "procrastinate" | null
  >(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastLogId, setLastLogId] = useState<string | undefined>(undefined);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [syncMessageIndex, setSyncMessageIndex] = useState(0);
  const [stats, setStats] = useState<any>(null);

  const syncMessages = [
    "Encrypting neural signal...",
    "Locating global vectors...",
    "Synchronizing with DelayScope Core...",
    "Calculating collective guilt...",
    "Finalizing broadcast..."
  ];

  React.useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setSyncMessageIndex((prev) => (prev + 1) % syncMessages.length);
      }, 400); 
      return () => clearInterval(interval);
    }
    
    if (step === 4) {
      const fetchCurrentStats = async () => {
        try {
          const res = await fetch(`/api/stats?period=24h${countryCode ? `&country=${countryCode}` : ""}`);
          const data = await res.json();
          setStats(data);
        } catch (e) {
          console.error("Failed to fetch result stats:", e);
        }
      };
      fetchCurrentStats();
    }
  }, [step, countryCode]);

  if (!isOpen) return null;

  const handleNext = () => setStep((prev) => prev + 1);

  const handleClose = () => {
    setStep(1);
    setActionType(null);
    setSelectedTag(null);
    setIsSubmitting(false);
    setErrorHeader(null);
    onClose();
  };

  const handleTagSelect = (tag: Tag) => {
    setSelectedTag(tag);
  };

  const handleSubmit = async () => {
    if (!selectedTag || !userLocation) return;
    setIsSubmitting(true);
    setErrorHeader(null);

    let calculatedScore = 0;
    if (actionType === "procrastinate") { // Guilt Index
      if (selectedTag.level === 1) calculatedScore = Math.floor(Math.random() * 21) + 10; // 10-30
      else if (selectedTag.level === 2) calculatedScore = Math.floor(Math.random() * 31) + 40; // 40-70
      else calculatedScore = Math.floor(Math.random() * 26) + 75; // 75-100
    } else { // Focus Score
      calculatedScore = Math.floor(Math.random() * 20) + 80; // 80-99
    }

    try {
      // Call Real Backend Server Action
      const result = await logActivity({
        lat: userLocation.lat,
        lng: userLocation.lng,
        countryCode: countryCode || userLocation.country,
        tagId: selectedTag.id,
        score: calculatedScore
      });

      if (result.success && result.id) {
        setScore(calculatedScore);
        setLastLogId(result.id);
        setStep(3); // Loading Sync
        setTimeout(() => {
          setStep(4); // Component Card
        }, 1500);
      } else {
        setErrorHeader(result.error || "An unexpected error occurred.");
      }
    } catch (error) {
      console.error("Failed to log activity:", error);
      setErrorHeader("Failed to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTags = TAGS.filter(tag => 
    actionType === "focus" ? tag.type === "FOCUS" : tag.type === "PROCRASTINATE"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-card border border-border-theme rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-500">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-border-theme bg-foreground/5 transition-colors">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            <h2 className="text-sm md:text-lg font-bold tracking-wider text-foreground uppercase truncate transition-colors">
              {t("modal.logStatus")}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-theme hover:text-foreground transition-colors"
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
        <div className="p-4 md:p-8 min-h-100 flex flex-col justify-center overflow-y-auto custom-scrollbar max-h-[calc(100vh-120px)]">
          {errorHeader && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-shake">
              <div className="flex items-center gap-3 text-red-400">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-bold leading-tight uppercase tracking-wide">{errorHeader}</p>
              </div>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-modal-up">
              <h3 className="text-xl md:text-2xl font-black text-center mb-1 md:mb-2 text-foreground transition-colors">
                {t("modal.stateQuestion")}
              </h3>
              <p className="text-muted-theme text-center mb-6 md:mb-8 text-xs md:text-sm transition-colors">
                {t("modal.stateSub")}
              </p>

              <div className="flex flex-col gap-3 md:gap-4">
                <button
                  onClick={() => {
                    setActionType("procrastinate");
                    handleNext();
                  }}
                  className="group relative px-4 md:px-6 py-3 md:py-4 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-all flex items-center gap-3 md:gap-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-red-500/0 via-red-500/5 to-red-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 text-red-400 group-hover:scale-110 transition-transform shrink-0">
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6"
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
                    <p className="font-bold text-red-100 text-base md:text-lg">
                      {t("modal.procrastinating")}
                    </p>
                    <p className="text-[11px] md:text-sm text-red-300/60 leading-tight">
                      {t("modal.proDescription")}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActionType("focus");
                    handleNext();
                  }}
                  className="group relative px-4 md:px-6 py-3 md:py-4 rounded-xl border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-all flex items-center gap-3 md:gap-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-green-500/0 via-green-500/5 to-green-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 text-green-400 group-hover:scale-110 transition-transform shrink-0">
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6"
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
                    <p className="font-bold text-green-100 text-base md:text-lg">{t("modal.focusing")}</p>
                    <p className="text-[11px] md:text-sm text-green-300/60 leading-tight">
                      {t("modal.focusDescription")}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Tag Selection */}
          {step === 2 && (
            <div className="animate-modal-left flex flex-col h-full overflow-hidden">
              <div className="shrink-0">
                <h3 className="text-xl md:text-2xl font-black text-center mb-1 md:mb-2 text-foreground transition-colors">
                  {actionType === "procrastinate"
                    ? t("modal.insteadQuestion")
                    : t("modal.workingQuestion")}
                </h3>
                <p className="text-muted-theme text-center mb-6 md:mb-8 text-xs md:text-sm uppercase tracking-widest font-bold transition-colors">
                  {actionType === "procrastinate"
                    ? "Confess your current level of delay"
                    : "Embrace your flow state activity"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 overflow-y-auto pr-2 custom-scrollbar min-h-0 flex-1">
                {currentTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagSelect(tag)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group/tag ${
                      selectedTag?.id === tag.id
                        ? actionType === "procrastinate"
                          ? "bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : "bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                        : "bg-foreground/5 border-border-theme hover:bg-foreground/10"
                    }`}
                  >
                    <span className="text-2xl group-hover/tag:scale-110 transition-transform drop-shadow-md">{tag.emoji}</span>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-[11px] md:text-xs font-bold truncate transition-colors ${selectedTag?.id === tag.id ? "text-foreground" : "text-muted-theme"}`}>
                        {tag.label}
                      </span>
                      {actionType === "procrastinate" && (
                        <span className={`text-[8px] uppercase tracking-widest font-black ${
                          tag.level === 1 ? "text-blue-400" : tag.level === 2 ? "text-amber-400" : "text-red-500 opacity-80"
                        }`}>
                          {tag.level === 1 ? "Light" : tag.level === 2 ? "Medium" : "Heavy"}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 flex justify-between shrink-0 border-t border-border-theme transition-colors">
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedTag(null);
                  }}
                  className="px-5 py-2 rounded-lg text-muted-theme hover:text-foreground transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  {t("modal.back")}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedTag || isSubmitting}
                  className={`px-8 py-2 rounded-lg font-black uppercase tracking-widest transition-all ${
                    selectedTag && !isSubmitting
                      ? "bg-foreground text-background hover:bg-foreground/90 shadow-lg" 
                      : "bg-foreground/10 text-muted-theme/40 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "Syncing..." : t("modal.submit")}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 (Syncing) */}
          {step === 3 && (
            <div className="animate-modal-zoom flex flex-col items-center justify-center text-center py-10">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Outer rotating ring */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-blue-500/20 rounded-full"
                />
                
                {/* Secondary scanning ring */}
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border border-blue-400/30 rounded-full border-t-transparent border-r-transparent"
                />

                {/* Core pulse */}
                <div className="relative w-24 h-24 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center overflow-hidden">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="absolute inset-4 bg-blue-500 rounded-full blur-xl"
                  />
                  <div className="relative z-10 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
                </div>

                {/* Orbiting data points */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5 + i, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <div 
                      className="w-1.5 h-1.5 bg-blue-300 rounded-full absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_8px_rgba(147,197,253,0.8)]"
                    />
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 space-y-3 min-h-16">
                <h3 className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-foreground to-purple-500 uppercase tracking-tighter transition-colors">
                  {t("modal.syncing")}
                </h3>
                <div className="h-4 flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={syncMessageIndex}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-500 text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                    >
                      {syncMessages[syncMessageIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Loader Line */}
              <div className="w-48 h-px bg-foreground/5 mt-8 relative overflow-hidden transition-colors">
                 <motion.div 
                   initial={{ x: "-100%" }}
                   animate={{ x: "100%" }}
                   transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-0 bg-linear-to-r from-transparent via-blue-500 to-transparent w-full"
                 />
              </div>
            </div>
          )}

          {/* STEP 4 (Result Card) */}
          {step === 4 && (
            <div className="animate-modal-up w-full max-w-sm mx-auto">
              <div
                className={`p-6 rounded-2xl border ${actionType === "procrastinate" ? "bg-red-950/20 border-red-500/30" : "bg-green-950/20 border-green-500/30"} flex flex-col relative overflow-hidden backdrop-blur-xl shadow-2xl`}
              >
                {/* Glow behind */}
                <div
                  className={`absolute -top-20 -right-20 w-40 h-40 blur-[80px] rounded-full opacity-50 ${actionType === "procrastinate" ? "bg-red-500" : "bg-green-500"}`}
                ></div>

                {/* Score */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <p
                      className={`text-[9px] md:text-[10px] uppercase tracking-widest font-black mb-1 ${actionType === "procrastinate" ? "text-red-400" : "text-green-400"}`}
                    >
                      {actionType === "procrastinate"
                        ? t("modal.guiltIndex")
                        : t("modal.focusScore")}
                    </p>
                    <h4 className="text-4xl md:text-6xl font-black text-foreground transition-colors">
                      {score}
                      <span className="text-base md:text-xl text-muted-theme/80 font-medium tracking-normal transition-colors">
                        /100
                      </span>
                    </h4>
                  </div>
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg bg-foreground/10 transition-colors ${actionType === "procrastinate" ? "border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "border-green-500/50 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"}`}
                  >
                    <span className="text-3xl drop-shadow-md">{selectedTag?.emoji}</span>
                  </div>
                </div>

                {/* Quotes */}
                <div className="mb-8 relative z-10 border-l-2 border-border-theme pl-4 py-1 transition-colors">
                  <h5 className="text-xl font-bold text-foreground mb-1.5 uppercase tracking-wide transition-colors">
                    {selectedTag?.label}
                  </h5>
                  <p className="text-sm text-muted-theme italic font-medium leading-relaxed transition-colors">
                    "
                    {actionType === "procrastinate"
                      ? t("modal.proQuote")
                      : t("modal.focusQuote")}
                    "
                  </p>
                </div>

                {/* Compare Stats */}
                <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
                  <div className="bg-foreground/10 rounded-xl p-3 border border-border-theme flex flex-col justify-between transition-colors">
                    <p className="text-[10px] text-muted-theme/80 uppercase tracking-widest mb-2 font-bold opacity-70 transition-colors">
                      {t("modal.globalAvg")}
                    </p>
                    <div>
                      <p className="text-xl font-black text-foreground transition-colors">
                        {actionType === "procrastinate" 
                           ? `${stats?.global?.avgGuilt || 70}/100` 
                           : `${stats?.global?.avgFocus || 80}/100`}
                      </p>
                      <p
                        className={`text-[11px] font-bold mt-1 ${
                          actionType === "procrastinate"
                            ? (score > (stats?.global?.avgGuilt || 70) ? "text-red-400" : "text-green-400")
                            : (score > (stats?.global?.avgFocus || 80) ? "text-green-400" : "text-red-400")
                        }`}
                      >
                        {actionType === "procrastinate"
                          ? (score > (stats?.global?.avgGuilt || 70) ? `▲ ${t("modal.aboveAvg")}` : `▼ ${t("modal.belowAvg")}`)
                          : (score > (stats?.global?.avgFocus || 80) ? `▲ ${t("modal.aboveAvg")}` : `▼ ${t("modal.belowAvg")}`)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-foreground/10 rounded-xl p-3 border border-border-theme flex flex-col justify-between transition-colors">
                    <p
                      className="text-[10px] text-muted-theme/80 uppercase tracking-widest mb-2 truncate font-bold opacity-70 transition-colors"
                      title={userLocation?.country}
                    >
                      {userLocation?.country || "Local"} {t("modal.localAvg")}
                    </p>
                    <div>
                      <p className="text-xl font-black text-foreground transition-colors">
                        {actionType === "procrastinate" 
                           ? `${stats?.local?.avgGuilt || 65}/100` 
                           : `${stats?.local?.avgFocus || 75}/100`}
                      </p>
                      <p
                        className={`text-[11px] font-bold mt-1 ${
                          actionType === "procrastinate"
                            ? (score > (stats?.local?.avgGuilt || 65) ? "text-red-400" : "text-green-400")
                            : (score > (stats?.local?.avgFocus || 75) ? "text-green-400" : "text-red-400")
                        }`}
                      >
                        {score > (actionType === "procrastinate" ? (stats?.local?.avgGuilt || 65) : (stats?.local?.avgFocus || 75)) 
                          ? `▲ ${t("modal.settingRecords")}` 
                          : `▼ ${t("modal.playingSafe")}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onSeePin(actionType || "procrastinate", score, `${selectedTag?.emoji} ${selectedTag?.label}`, lastLogId)}
                  className={`relative z-10 w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-1 ${
                    actionType === "procrastinate"
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                      : "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]"
                  }`}
                >
                  <svg
                    className="w-5 h-5 shadow-sm"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
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

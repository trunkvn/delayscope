"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <main className="w-screen h-screen bg-black overflow-y-auto font-sans text-white flex flex-col relative custom-scrollbar">
      <Header />

      <div className="flex-1 max-w-4xl mx-auto px-8 py-20 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <section className="relative z-10 space-y-16">
          {/* Hero Section */}
          <div className="space-y-6 text-center">
            <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 backdrop-blur-md animate-fade-in-up">
              <span className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">
                {t("about.heroTagline")}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter animate-fade-in-up transition-all delay-100">
              {t("about.heroTitle").split("DelayScope")[0]} <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-500 to-pink-500">DelayScope</span>?
            </h1>
            
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              {t("about.heroDesc")}
            </p>
          </div>

          {/* Core Concept */}
          <div className="grid md:grid-cols-2 gap-12 items-center py-10 animate-fade-in-up delay-300">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold border-l-4 border-blue-500 pl-6">{t("about.conceptTitle")}</h2>
              <p className="text-gray-400 leading-relaxed">
                {t("about.conceptDesc1")}
              </p>
              <p className="text-gray-400 leading-relaxed">
                {t("about.conceptDesc2")}
              </p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    <span className="text-sm font-medium text-gray-300 uppercase tracking-widest">{t("about.delayTraps")}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[85%]"></div>
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-sm font-medium text-gray-300 uppercase tracking-widest">{t("about.focusFlow")}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[15%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-12 py-10 animate-fade-in-up delay-350">
            <h2 className="text-3xl font-bold text-center">{t("about.howItWorksTitle")}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: t("about.step1Title"), desc: t("about.step1Desc") },
                { step: "02", title: t("about.step2Title"), desc: t("about.step2Desc") },
                { step: "03", title: t("about.step3Title"), desc: t("about.step3Desc") }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                  <span className="text-4xl font-black text-blue-500/30 group-hover:text-blue-500/60 transition-colors">{item.step}</span>
                  <h3 className="text-xl font-bold mt-4 mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Anonymity */}
          <div className="relative group animate-fade-in-up delay-400">
             <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
             <div className="relative bg-zinc-900/40 border border-blue-500/20 rounded-3xl p-10 backdrop-blur-xl flex flex-col md:flex-row gap-10 items-center">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                   <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                   </svg>
                </div>
                <div className="space-y-4">
                   <h2 className="text-3xl font-bold italic">{t("about.privacyTitle")}</h2>
                   <p className="text-gray-400 leading-relaxed">
                      {t("about.privacyDesc")}
                   </p>
                </div>
             </div>
          </div>

          {/* FAQ */}
          <div className="space-y-8 animate-fade-in-up delay-450">
             <h2 className="text-3xl font-bold text-center">{t("about.faqTitle")}</h2>
             <div className="space-y-4 max-w-2xl mx-auto">
                {[
                   { q: t("about.faq1Q"), a: t("about.faq1A") },
                   { q: t("about.faq2Q"), a: t("about.faq2A") },
                   { q: t("about.faq3Q"), a: t("about.faq3A") }
                ].map((faq, i) => (
                   <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                      <div className="bg-white/5 p-4 font-bold text-sm text-blue-300 tracking-wide uppercase">{faq.q}</div>
                      <div className="p-4 text-gray-400 text-sm leading-relaxed border-t border-white/5">{faq.a}</div>
                   </div>
                ))}
             </div>
          </div>

          {/* Mission */}
          <div className="bg-linear-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-12 text-center space-y-8 animate-fade-in-up delay-500">
            <h2 className="text-4xl font-black italic tracking-tight">{t("about.missionTitle")}</h2>
            <p className="text-2xl text-blue-100/80 font-medium italic leading-relaxed">
              {t("about.missionText")}
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
            >
              {t("common.backToMap")}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Footer Info */}
          <div className="text-center pt-20 border-t border-white/5 animate-fade-in-up delay-500">
            <p className="text-sm text-gray-500 uppercase tracking-[0.4em]">
              {t("about.footerTagline")}
            </p>
            <p className="mt-4 text-[10px] text-gray-600 font-mono">
              &copy; 2026 DELAYSCOPE LABS. VERSION 1.0.4-BETA
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}

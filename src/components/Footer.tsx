"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-card border-t border-border-theme pt-16 pb-8 px-8 relative z-20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        {/* Brand Section */}
        <div className="space-y-6 max-w-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-6 h-6">
              <div className="absolute inset-0 rounded-full bg-blue-500 blur-sm opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-white relative z-10"></div>
            </div>
            <span className="text-lg font-black tracking-tighter uppercase text-foreground transition-colors">
              Delay<span className="text-blue-500">Scope</span>
            </span>
          </div>
          <p className="text-muted-theme text-sm leading-relaxed italic transition-colors">
            "{t("footer.tagline")}"
          </p>
          <div className="flex gap-4">
            {['Twitter', 'Github', 'Instagram'].map((social) => (
              <a 
                key={social} 
                href="#" 
                className="text-[10px] font-bold uppercase tracking-widest text-muted-theme hover:text-blue-400 transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-theme/80 transition-colors">{t("footer.navTitle")}</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-muted-theme hover:text-foreground transition-colors">{t("footer.globalMap")}</Link></li>
              <li><Link href="/insights" className="text-sm text-muted-theme hover:text-foreground transition-colors">{t("footer.detailedInsights")}</Link></li>
              <li><Link href="/about" className="text-sm text-muted-theme hover:text-foreground transition-colors">{t("footer.aboutProject")}</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-theme hover:text-foreground transition-colors">{t("footer.contact")}</Link></li>
            </ul>
          </div>
          {/* <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-theme/80 transition-colors">{t("footer.resourcesTitle")}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-theme hover:text-foreground transition-colors">{t("footer.privacyPolicy")}</a></li>
              <li><a href="#" className="text-sm text-muted-theme hover:text-foreground transition-colors">{t("footer.apiAccess")}</a></li>
              <li><a href="#" className="text-sm text-muted-theme hover:text-foreground transition-colors">{t("footer.openData")}</a></li>
            </ul>
          </div> */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-theme/80 transition-colors">{t("footer.statusTitle")}</h4>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-foreground/5 border border-border-theme transition-all">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-[10px] font-mono text-muted-theme transition-colors">{t("footer.allSystems")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border-theme flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
        <p className="text-[10px] text-muted-theme/60 font-mono transition-colors">
          &copy; 2026 DELAYSCOPE LABS. COORDINATES: 21.0285° N, 105.8542° E
        </p>
        <div className="flex items-center gap-6">
           <span className="text-[10px] text-muted-theme/60 uppercase tracking-widest transition-colors">{t("footer.builtFor")}</span>
           <div className="h-4 w-px bg-border-theme hidden md:block transition-colors"></div>
           <span className="text-[10px] text-muted-theme/60 font-mono uppercase transition-colors">Ver: 1.0.4-B</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

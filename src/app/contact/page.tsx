"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <main className="w-screen h-screen bg-background overflow-y-auto font-sans text-foreground flex flex-col relative custom-scrollbar transition-colors duration-500">
      <Header />

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-20 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-start">
          {/* Header & Info */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 backdrop-blur-md animate-fade-in-up">
                <span className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">
                  {t("footer.contact")}
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter animate-fade-in-up transition-all delay-100 italic">
                {t("contact.title")}
              </h1>
              
              <p className="text-xl text-muted-theme font-light max-w-md leading-relaxed animate-fade-in-up delay-200 transition-colors">
                {t("contact.subtitle")}
              </p>
            </div>

            <div className="pt-10 animate-fade-in-up delay-400">
               <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl backdrop-blur-xl">
                  <p className="text-sm text-muted-theme leading-relaxed">
                     <span className="font-bold text-blue-400 mr-2">i</span>
                     {t("contact.privacyNote")}
                  </p>
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-10 lg:mt-0 animate-fade-in-up delay-300">
             <div className="bg-card border border-border-theme rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-500">
                <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">
                   {t("contact.formTitle")}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-theme/80 ml-1">
                         {t("contact.name")}
                      </label>
                      <input 
                         type="text"
                         required
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         placeholder={t("contact.namePlaceholder")}
                         className="w-full bg-foreground/5 border border-border-theme rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-medium text-foreground placeholder:text-muted-theme/40"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-theme/80 ml-1">
                         {t("contact.email")}
                      </label>
                      <input 
                         type="email"
                         required
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         placeholder={t("contact.emailPlaceholder")}
                         className="w-full bg-foreground/5 border border-border-theme rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-medium text-foreground placeholder:text-muted-theme/40"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-theme/80 ml-1">
                         {t("contact.message")}
                      </label>
                      <textarea 
                         required
                         rows={5}
                         value={formData.message}
                         onChange={(e) => setFormData({...formData, message: e.target.value})}
                         placeholder={t("contact.messagePlaceholder")}
                         className="w-full bg-foreground/5 border border-border-theme rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-medium text-foreground placeholder:text-muted-theme/40 resize-none"
                      />
                   </div>

                   <button 
                      type="submit"
                      disabled={status === "sending"}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group ${
                         status === "sending" 
                         ? "bg-foreground/10 text-muted-theme cursor-not-allowed" 
                         : "bg-foreground text-background hover:bg-foreground/90 shadow-xl"
                      }`}
                   >
                      <span className="relative z-10">
                        {status === "sending" ? t("contact.sending") : t("contact.send")}
                      </span>
                      {status !== "sending" && (
                        <motion.div 
                           className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                           initial={false}
                        />
                      )}
                   </button>

                   <AnimatePresence>
                      {status === "success" && (
                        <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0 }}
                           className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center"
                        >
                           <p className="text-sm font-bold text-green-500">{t("contact.success")}</p>
                        </motion.div>
                      )}
                      {status === "error" && (
                        <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0 }}
                           className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center"
                        >
                           <p className="text-sm font-bold text-red-500">{t("contact.error")}</p>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </form>
             </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}

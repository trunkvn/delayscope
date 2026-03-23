"use client";

import React, { useState, useEffect } from "react";
import Map from "@/components/Map";
import LogActionModal from "@/components/LogActionModal";
import Quote from "@/components/Quote";
import Insight from "@/components/Insight";
import MarqueeLog from "@/components/MarqueeLog";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "checking" | "granted" | "denied"
  >("checking");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    country: string;
  } | null>(null);
  const [userPin, setUserPin] = useState<{
    id?: string;
    lat: number;
    lng: number;
    type: string;
    score: number;
    country: string;
    desc: string;
  } | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [period, setPeriod] = useState<string>("24h");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            );
            const data = await res.json();
            setCountryCode(data.countryCode);
            setUserLocation({
              lat: latitude,
              lng: longitude,
              country: data.countryName || "Unknown",
            });
            setLocationStatus("granted");
          } catch (error) {
            // Vẫn cho phép tính là có location nếu API lỗi tạm thời
            setUserLocation({
              lat: latitude,
              lng: longitude,
              country: "Unknown",
            });
            setLocationStatus("granted");
          }
        },
        () => {
          setLocationStatus("denied");
        },
      );
    } else {
      setLocationStatus("denied");
    }
  }, []);

  return (
    <main className="w-screen h-screen bg-background overflow-y-auto select-none font-sans text-foreground flex flex-col relative custom-scrollbar transition-colors duration-500">
      <Header />

      <div className="relative shrink-0 h-[calc(100vh-73px)] md:h-[calc(100vh-82px)] w-full bg-background overflow-hidden transition-colors duration-500">
        {/* Quote */}
        <Quote
          isMapLoaded={isMapLoaded}
          locationStatus={locationStatus}
          setIsLogModalOpen={setIsLogModalOpen}
        />

        <Insight 
          isMapLoaded={isMapLoaded} 
          countryCode={countryCode} 
          userScore={userPin?.score} 
          period={period}
          onPeriodChange={setPeriod}
        />
        <Map userPin={userPin} onLoad={() => setIsMapLoaded(true)} period={period} />
        <MarqueeLog isMapLoaded={isMapLoaded} period={period} />
      </div>

      <Footer />

      <LogActionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        userLocation={userLocation}
        countryCode={countryCode}
        onSeePin={(type, score, desc, id) => {
          if (userLocation) {
            setUserPin({
              id,
              lat: userLocation.lat,
              lng: userLocation.lng,
              type,
              score,
              country: userLocation.country,
              desc: desc
            });
          }
          setIsLogModalOpen(false);
        }}
      />
    </main>
  );
}

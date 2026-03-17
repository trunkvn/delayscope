"use client";

import React, { useState, useEffect } from "react";
import Map from "@/components/Map";
import LogActionModal from "@/components/LogActionModal";
import Header from "@/components/Header";
import Quote from "@/components/Quote";
import Insight from "@/components/Insight";
import MarqueeLog from "@/components/MarqueeLog";

export default function Home() {
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
    lat: number;
    lng: number;
    type: string;
    score: number;
    country: string;
  } | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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
    <main className="w-screen h-screen bg-black overflow-hidden select-none font-sans text-white flex flex-col relative">
      <Header />

      {/* Main Content Area */}
      <div className="relative flex-1 w-full bg-black">
        {/* Quote - Nhỏ lại & góc trái trên */}
        <Quote
          isMapLoaded={isMapLoaded}
          locationStatus={locationStatus}
          setIsLogModalOpen={setIsLogModalOpen}
        />

        <Insight isMapLoaded={isMapLoaded} />
        <Map userPin={userPin} onLoad={() => setIsMapLoaded(true)} />
        <MarqueeLog isMapLoaded={isMapLoaded} />
      </div>

      <LogActionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        userLocation={userLocation}
        onSeePin={(type, score) => {
          if (userLocation) {
            setUserPin({
              lat: userLocation.lat,
              lng: userLocation.lng,
              type,
              score,
              country: userLocation.country,
            });
          }
          setIsLogModalOpen(false);
        }}
      />
    </main>
  );
}

import { TAGS } from "../src/constants/tags";

const API_URL = "http://localhost:3002/api/log";

const countries = [
  { code: "VN", name: "Vietnam", latRange: [10, 20], lngRange: [105, 108] },
  { code: "US", name: "USA", latRange: [30, 45], lngRange: [-120, -80] },
  { code: "JP", name: "Japan", latRange: [34, 40], lngRange: [135, 140] },
  { code: "GB", name: "UK", latRange: [51, 55], lngRange: [-2, 1] },
  { code: "FR", name: "France", latRange: [43, 48], lngRange: [0, 5] },
  { code: "AU", name: "Australia", latRange: [-35, -20], lngRange: [120, 150] },
];

async function simulate() {
  console.log("🚀 Starting LIVE Global Simulation...");
  console.log("📍 Target API:", API_URL);
  
  while (true) {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const tag = TAGS[Math.floor(Math.random() * TAGS.length)];
    
    const lat = country.latRange[0] + Math.random() * (country.latRange[1] - country.latRange[0]);
    const lng = country.lngRange[0] + Math.random() * (country.lngRange[1] - country.lngRange[0]);

    console.log(`📡 Broadcasting from ${country.name}: [${tag.emoji} ${tag.label}]`);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagId: tag.id,
          lat,
          lng,
          countryCode: country.code,
        }),
      });

      if (!response.ok) {
        console.error("❌ Failed to broadcast:", await response.text());
      }
    } catch (err) {
      console.error("❌ Network Error:", (err as any).message);
    }

    // Wait 2-5 seconds between logs
    const delay = Math.floor(Math.random() * 3000) + 2000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

simulate();

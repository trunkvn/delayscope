import { baseCities } from "@/mocks/citiesData";

export const mockGlobalPins = Array.from({ length: 500 }).map((_, i) => {
  const baseCity = baseCities[Math.floor(Math.random() * baseCities.length)];
  const latOffset = (Math.random() - 0.5) * 10; // Càng to thì phân tán càng rộng
  const lngOffset = (Math.random() - 0.5) * 10;
  const isProcrastinating = Math.random() > 0.4; // 60% tỉ lệ trì hoãn (cho thực tế)
  return {
    id: String(i + 1),
    lat: baseCity.lat + latOffset,
    lng: baseCity.lng + lngOffset,
    type: isProcrastinating ? "procrastinate" : "focus",
    score: Math.floor(Math.random() * 40) + 60, // 60-99
    country: baseCity.country,
    iso: baseCity.iso,
    desc: baseCity.desc[Math.floor(Math.random() * baseCity.desc.length)],
  };
});
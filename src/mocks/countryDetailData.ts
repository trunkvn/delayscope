export const countryDetails: Record<
  string,
  {
    name: string;
    delayIndex: number;
    topReason: string;
    activeAvoidance: string;
    deadlineMissed: number;
  }
> = {
  VN: {
    name: "Việt Nam",
    delayIndex: 85,
    topReason: "Lướt Facebook/Tiktok",
    activeAvoidance: "Uống trà đá",
    deadlineMissed: 245000,
  },
  RU: {
    name: "Russia",
    delayIndex: 60,
    topReason: "Watching dashcam videos",
    activeAvoidance: "Drinking tea",
    deadlineMissed: 120000,
  },
  CN: {
    name: "China",
    delayIndex: 75,
    topReason: "Scrolling Weibo",
    activeAvoidance: "Playing mobile games",
    deadlineMissed: 890000,
  },
  US: {
    name: "United States",
    delayIndex: 92,
    topReason: "Binge-watching Netflix",
    activeAvoidance: "Online shopping",
    deadlineMissed: 1540000,
  },
  ID: {
    name: "Indonesia",
    delayIndex: 78,
    topReason: "Traffic jam excuse",
    activeAvoidance: "Hanging out",
    deadlineMissed: 320000,
  },
  FR: {
    name: "France",
    delayIndex: 88,
    topReason: "Coffee & Croissant breaks",
    activeAvoidance: "Striking",
    deadlineMissed: 450000,
  },
  JP: {
    name: "Japan",
    delayIndex: 45,
    topReason: "Polite socializing",
    activeAvoidance: "Cleaning workspace",
    deadlineMissed: 50000,
  },
  BR: {
    name: "Brazil",
    delayIndex: 82,
    topReason: "Watching football",
    activeAvoidance: "Beach time",
    deadlineMissed: 560000,
  },
  IN: {
    name: "India",
    delayIndex: 70,
    topReason: "Chai breaks",
    activeAvoidance: "Watching Cricket",
    deadlineMissed: 1100000,
  },
  AU: {
    name: "Australia",
    delayIndex: 65,
    topReason: "Surfing",
    activeAvoidance: "BBQ prep",
    deadlineMissed: 180000,
  },
  ZA: {
    name: "South Africa",
    delayIndex: 72,
    topReason: "Load shedding",
    activeAvoidance: "Braai",
    deadlineMissed: 210000,
  },
  CA: {
    name: "Canada",
    delayIndex: 55,
    topReason: "Apologizing",
    activeAvoidance: "Watching hockey",
    deadlineMissed: 95000,
  },
  GB: {
    name: "United Kingdom",
    delayIndex: 76,
    topReason: "Complaining about weather",
    activeAvoidance: "Making tea",
    deadlineMissed: 380000,
  },
};

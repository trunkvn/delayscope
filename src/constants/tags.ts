export type ActivityType = "PROCRASTINATE" | "FOCUS";

export interface Tag {
  id: string;
  label: string;
  emoji: string;
  level: number;
  type: ActivityType;
}

export const TAGS: Tag[] = [
  // PROCRASTINATE - Level 1: Light
  {
    id: "coffee_tea",
    label: "Drinking Coffee/Tea",
    emoji: "☕",
    level: 1,
    type: "PROCRASTINATE",
  },
  {
    id: "iced_tea",
    label: "Iced Tea Chatting",
    emoji: "🍹",
    level: 1,
    type: "PROCRASTINATE",
  },
  {
    id: "clean_desk",
    label: "Cleaning Desk",
    emoji: "🧼",
    level: 1,
    type: "PROCRASTINATE",
  },
  {
    id: "quick_nap",
    label: "Quick Nap",
    emoji: "😴",
    level: 1,
    type: "PROCRASTINATE",
  },
  {
    id: "daydreaming",
    label: "Daydreaming",
    emoji: "💭",
    level: 1,
    type: "PROCRASTINATE",
  },
  {
    id: "strolling",
    label: "Strolling Around",
    emoji: "🚶",
    level: 1,
    type: "PROCRASTINATE",
  },

  // PROCRASTINATE - Level 2: Medium
  {
    id: "snack",
    label: "Eating a Snack",
    emoji: "🍪",
    level: 2,
    type: "PROCRASTINATE",
  },
  {
    id: "shopping",
    label: "Online Shopping",
    emoji: "🛍️",
    level: 2,
    type: "PROCRASTINATE",
  },
  {
    id: "fast_food",
    label: "Eating Fast Food",
    emoji: "🍔",
    level: 2,
    type: "PROCRASTINATE",
  },
  {
    id: "window_shopping",
    label: "Window Shopping",
    emoji: "🛒",
    level: 2,
    type: "PROCRASTINATE",
  },
  {
    id: "social_feed",
    label: "Checking Social Feed",
    emoji: "📸",
    level: 2,
    type: "PROCRASTINATE",
  },
  {
    id: "random_news",
    label: "Reading Random News",
    emoji: "📰",
    level: 2,
    type: "PROCRASTINATE",
  },

  // PROCRASTINATE - Level 3: Heavy
  {
    id: "tiktok_reels",
    label: "Scrolling TikTok/Reels",
    emoji: "📱",
    level: 3,
    type: "PROCRASTINATE",
  },
  {
    id: "anime_netflix",
    label: "Watching Anime/Netflix",
    emoji: "🎬",
    level: 3,
    type: "PROCRASTINATE",
  },
  {
    id: "gaming",
    label: "Playing Games",
    emoji: "🎮",
    level: 3,
    type: "PROCRASTINATE",
  },
  {
    id: "binge_watching",
    label: "Binge Watching",
    emoji: "🎭",
    level: 3,
    type: "PROCRASTINATE",
  },
  {
    id: "couch_potato",
    label: "Couch Potatoing",
    emoji: " 🎰 ",
    level: 3,
    type: "PROCRASTINATE",
  }, // Fixed emoji issue in string
  {
    id: "gacha",
    label: "Mobile Gambling/Gacha",
    emoji: "🎰",
    level: 3,
    type: "PROCRASTINATE",
  },
  {
    id: "other_procrastinate",
    label: "Other Procrastination",
    emoji: "🌀",
    level: 2,
    type: "PROCRASTINATE",
  },

  // FOCUS
  {
    id: "coding",
    label: "Coding Session",
    emoji: "💻",
    level: 1,
    type: "FOCUS",
  },
  { id: "studying", label: "Studying", emoji: "📚", level: 1, type: "FOCUS" },
  {
    id: "ui_ux",
    label: "Designing UI/UX",
    emoji: "🎨",
    level: 1,
    type: "FOCUS",
  },
  { id: "deep_work", label: "Deep Work", emoji: "🧘", level: 1, type: "FOCUS" },
  {
    id: "reading",
    label: "Reading Books",
    emoji: "📖",
    level: 1,
    type: "FOCUS",
  },
  { id: "writing", label: "Writing", emoji: "✍️", level: 1, type: "FOCUS" },
  {
    id: "workout",
    label: "Workout Session",
    emoji: "🏋️",
    level: 1,
    type: "FOCUS",
  },
  {
    id: "research",
    label: "Conducting Research",
    emoji: "🧪",
    level: 1,
    type: "FOCUS",
  },
  {
    id: "building",
    label: "Building Project",
    emoji: "🏗️",
    level: 1,
    type: "FOCUS",
  },
  {
    id: "language",
    label: "Learning Language",
    emoji: "🗣️",
    level: 1,
    type: "FOCUS",
  },
  {
    id: "data_analysis",
    label: "Data Analysis",
    emoji: "📊",
    level: 1,
    type: "FOCUS",
  },
  {
    id: "puzzles",
    label: "Solving Puzzles",
    emoji: "🧩",
    level: 1,
    type: "FOCUS",
  },
  {
    id: "other_focus",
    label: "Other Focus Activity",
    emoji: "✨",
    level: 1,
    type: "FOCUS",
  },
];

export const getTagById = (id: string) => TAGS.find((t) => t.id === id);

import { mockGlobalPins } from "./mockGlobalPins";

// Calculate dynamic country colors based on pins
export const calculateDynamicCountryColors = () => {
  const stats: Record<string, { delay: number; focus: number }> = {};

  mockGlobalPins.forEach((pin) => {
    if (!stats[pin.iso]) stats[pin.iso] = { delay: 0, focus: 0 };
    if (pin.type === "procrastinate") stats[pin.iso].delay++;
    else stats[pin.iso].focus++;
  });

  const colors: Record<string, string> = {};
  Object.keys(stats).forEach((iso) => {
    const total = stats[iso].delay + stats[iso].focus;
    if (total === 0) return;

    const delayRatio = stats[iso].delay / total;

    // Dynamic color logic:
    // DelayRatio > 0.6 -> Đỏ (red-500 rgba)
    // DelayRatio > 0.4 -> Cam (amber-500 rgba)
    // DelayRatio <= 0.4 -> Xanh lá (green-500 rgba)

    if (delayRatio > 0.6) colors[iso] = "rgba(239, 68, 68, 0.95)";
    else if (delayRatio > 0.4) colors[iso] = "rgba(245, 158, 11, 0.95)";
    else colors[iso] = "rgba(34, 197, 94, 0.95)";
  });

  return colors;
};

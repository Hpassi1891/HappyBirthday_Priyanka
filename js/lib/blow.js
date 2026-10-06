// A "blow" is sustained loud mic input: the average of the last WINDOW
// samples is above THRESHOLD, and most of the window is loud (not just a spike).
export const WINDOW = 20;
export const THRESHOLD = 0.12;

export function detectBlow(levels) {
  const recent = levels.slice(-WINDOW);
  if (recent.length < WINDOW) return false;
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const loud = recent.filter((v) => v > THRESHOLD).length;
  return mean > THRESHOLD && loud >= WINDOW * 0.7;
}

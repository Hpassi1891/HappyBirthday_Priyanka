// Birthday: 11 Nov 2026 (local time of the viewer).
export const BIRTHDAY = new Date(2026, 10, 11, 0, 0, 0);

export function isUnlocked(now = new Date(), { preview = false } = {}) {
  return preview || now >= BIRTHDAY;
}

export function timeLeft(now = new Date()) {
  const ms = Math.max(0, BIRTHDAY - now);
  const total = Math.floor(ms / 1000);
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

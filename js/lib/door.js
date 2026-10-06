// Answers are stored as salted hashes, so they aren't readable in the page source.
const norm = (s) => String(s).trim().toLowerCase();
const hash = (s) => {
  let x = 2166136261;
  for (const c of 'pk11:' + s) {
    x ^= c.charCodeAt(0);
    x = Math.imul(x, 16777619);
  }
  return (x >>> 0).toString(16);
};

const OPEN_HASH = hash('rakshas');
const NAME_HASH = hash('himanshu');

export function checkAnswer(raw) {
  const v = hash(norm(raw));
  if (v === OPEN_HASH) return { result: 'open' };
  if (v === NAME_HASH) return { result: 'funny' };
  return { result: 'wrong' };
}

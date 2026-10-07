// Small DOM helpers shared by the wall scenes.
export function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// A picture tile for a content item: emoji on a coloured background,
// swapped for a real image when `item.image` loads. A missing or broken image keeps the emoji.
export function picture(item) {
  const pic = el('div', 'pic');
  pic.style.setProperty('--c', item.color || '#ffc2dd');
  const emoji = el('span', 'pic-emoji', item.emoji || '💖');
  if (item.image) {
    const img = new Image();
    img.alt = item.title || item.caption || '';
    img.onload = () => { emoji.remove(); pic.appendChild(img); };
    img.src = item.image;
  }
  pic.appendChild(emoji);
  return pic;
}

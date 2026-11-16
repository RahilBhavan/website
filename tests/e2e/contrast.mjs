// Run inside a browser page. Composite translucent backgrounds through the actual cascade.
export function readingContrast() {
  const rgba = value => {
    const channels = value.match(/[\d.]+/g).map(Number);
    return [...channels.slice(0, 3), channels[3] ?? 1];
  };
  const over = (front, back) => front.slice(0, 3).map((v, i) => v * front[3] + back[i] * (1 - front[3]));
  const luminance = color => color.map(v => v / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const failures = [];
  let checked = 0;
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg,script,style,noscript,canvas')) continue;
    const text = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    const style = getComputedStyle(el);
    if (!text || !el.getClientRects().length || style.visibility === 'hidden' || +style.opacity === 0) continue;
    const layers = [];
    for (let node = el; node; node = node.parentElement) layers.push(rgba(getComputedStyle(node).backgroundColor));
    let background = [255, 255, 255];
    for (const layer of layers.reverse()) background = over(layer, background);
    const foreground = over(rgba(style.color), background);
    const values = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
    const ratio = (values[1] + .05) / (values[0] + .05);
    checked++;
    if (ratio < 4.5) failures.push({ tag: el.tagName, class: String(el.className), text: text.slice(0, 70), foreground: style.color, background, ratio });
  }
  return { checked, failures };
}

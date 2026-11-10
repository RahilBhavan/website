// Numeric-only public evidence. A missing plot never hides the guide or its data link.
const chapters = [...document.querySelectorAll('.chapter')];
document.querySelector('#expand').addEventListener('click', () => chapters.forEach((el) => { el.open = true; }));
document.querySelector('#collapse').addEventListener('click', () => chapters.forEach((el) => { el.open = false; }));
document.querySelector('#print').addEventListener('click', () => window.print());
let printState = [];
window.addEventListener('beforeprint', () => {
  printState = [...document.querySelectorAll('details')].map((el) => [el, el.open]);
  printState.forEach(([el]) => { el.open = true; });
});
window.addEventListener('afterprint', () => printState.forEach(([el, open]) => { el.open = open; }));
function openTarget() {
  const target = document.getElementById(location.hash.slice(1));
  if (target?.tagName === 'DETAILS') target.open = true;
}
window.addEventListener('hashchange', openTarget);
openTarget();
const svgNS = 'http://www.w3.org/2000/svg';
function drawTrace(name, windowData) {
  if (!windowData || !Array.isArray(windowData.samples) || windowData.samples.length !== 301) throw new Error('Invalid measurement window');
  const panel = document.createElement('figure');
  panel.className = 'trace-panel';
  const label = document.createElement('figcaption');
  label.className = 'trace-label';
  const title = document.createElement('b'); title.textContent = name;
  const scale = document.createElement('span'); scale.textContent = 'Reply time: 0–5 ms';
  label.append(title, scale);
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 -5 1000 160'); svg.setAttribute('preserveAspectRatio', 'none');
  svg.classList.add('plot'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `${name}: 301 recorded replies over 60 seconds, all below 5 milliseconds.`);
  const grid = document.createElementNS(svgNS, 'path');
  grid.setAttribute('d', 'M0 0H1000 M0 150H1000');grid.setAttribute('stroke', 'var(--rule)'); svg.append(grid);
  for (const row of windowData.samples) {
    if (!Array.isArray(row) || row.length !== 3 || !row.every(Number.isFinite) || row[0] < 0 || row[0] > 61 || row[1] < 0 || row[1] > 5) throw new Error('Invalid sample');
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', String(Math.min(60, row[0]) / 60 * 1000));
    circle.setAttribute('cy', String(150 - row[1] / 5 * 150));
    circle.setAttribute('r', '2.7');circle.setAttribute('fill', 'var(--accent)');svg.append(circle);
  }
  const ticks = document.createElement('div'); ticks.className = 'ticks';
  for (const text of ['0 s', '30 s', '60 s']) { const span = document.createElement('span');span.textContent = text;ticks.append(span); }
  panel.append(label, svg, ticks);return panel;
}
fetch('/guides/box-ram/measurements.json').then((response) => {
  if (!response.ok) throw new Error('Measurements unavailable');return response.json();
}).then((data) => {
  const first = drawTrace('First minute', data.first), repeat = drawTrace('Repeat minute', data.repeat);
  document.querySelector('#traces').replaceChildren(first, repeat);
}).catch(() => {
  document.querySelector('#traces').textContent = 'The interactive traces could not load. The summary values and direct numeric download remain available.';
});

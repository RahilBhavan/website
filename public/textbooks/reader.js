/* Progressive enhancement; native contents links and text remain usable without JS. */
const menu = document.querySelector('.library-contents');
const search = document.querySelector('#library-chapter-search');
const entries = [...document.querySelectorAll('.library-menu li')];
search?.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  let count = 0;
  for (const item of entries) {
    item.hidden = !item.textContent.toLowerCase().includes(query);
    if (!item.hidden) count++;
  }
  document.querySelector('#library-chapter-count').textContent = `${count} sections${count ? '' : '. Try another search.'}`;
});
menu?.addEventListener('keydown', event => {
  if (event.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); }
});
menu?.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  menu.open = false;
  const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
  if (target) {
    const article = target.closest('article');
    if (article?.id) document.querySelector(`[data-page="${CSS.escape(article.id)}"]`)?.click();
    target.setAttribute('tabindex', '-1');
    requestAnimationFrame(() => { target.focus({ preventScroll: true }); target.scrollIntoView(); });
  }
});
document.querySelector('#library-print')?.addEventListener('click', () => {
  const nativePrint = document.querySelector('#print,#print-book');
  if (nativePrint) nativePrint.click(); else window.print();
});
// Make broad diagrams and tables keyboard-scrollable without widening the document.
for (const element of document.querySelectorAll('table,svg')) {
  if (element.closest('.scroll-region') || element.closest('svg') !== (element.tagName.toLowerCase() === 'svg' ? element : null)) continue;
  if (element.tagName.toLowerCase() === 'svg' && element.closest('.machine-frame,.iso,.diagram-mobile,.compact')) continue;
  const wrapper = document.createElement('div');
  wrapper.className = 'scroll-region';
  wrapper.tabIndex = 0;
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', element.tagName.toLowerCase() === 'table' ? 'Data table; scroll horizontally for more columns' : 'Diagram; scroll horizontally for detail');
  element.before(wrapper); wrapper.append(element);
}

// The shorter Strategy companion uses tabbed articles; bridge native hash links to those tabs.
function revealHash() {
  let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  const article = target?.closest('article');
  if (article?.id) document.querySelector(`[data-page="${CSS.escape(article.id)}"]`)?.click();
}
window.addEventListener('hashchange', revealHash);
revealHash();
for (const region of document.querySelectorAll('.scroll-region')) {
  const updateHint = () => region.classList.toggle('has-overflow', region.scrollWidth > region.clientWidth + 2);
  updateHint(); new ResizeObserver(updateHint).observe(region);
}
// D3 cells are buttons as well as pointer targets. Their existing handlers own the calculation.
for (const cell of document.querySelectorAll('svg *')) {
  if (!cell.__on?.some(handler => handler.type === 'click')) continue;
  cell.setAttribute('tabindex', '0'); cell.setAttribute('role', 'button');
  const data = cell.__data__;
  const label = data && typeof data === 'object' ? Object.entries(data).filter(([,v]) => ['string','number'].includes(typeof v)).map(([k,v]) => `${k}: ${v}`).join(', ') : 'Chart cell';
  cell.setAttribute('aria-label', `Inspect ${label}`);
  cell.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault(); cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}
// Diagram annotations have a text route on touch devices, alongside the existing hover affordance.
for (const svg of document.querySelectorAll('svg')) {
  const notes = [...new Set([...svg.querySelectorAll('[data-tip]')].map(node => node.getAttribute('data-tip')).filter(Boolean))];
  if (!notes.length) continue;
  const details = document.createElement('details'); details.className = 'figure-notes';
  const summary = document.createElement('summary'); summary.textContent = 'Read the diagram notes';
  const list = document.createElement('ul');
  for (const note of notes) { const item = document.createElement('li'); item.textContent = note.replaceAll('**', ''); list.append(item); }
  details.append(summary, list); (svg.closest('.scroll-region') || svg).after(details);
}
// Keep SVG labels at reading size. Dense figures pan inside their own region on a phone.
for (const svg of document.querySelectorAll('.scroll-region>svg')) {
  const widths = [...svg.querySelectorAll('text')].map(text => parseFloat(getComputedStyle(text).fontSize)).filter(size => Number.isFinite(size) && size > 0);
  if (!widths.length || !svg.viewBox?.baseVal.width) continue;
  const minimum = svg.viewBox.baseVal.width * 14 / Math.min(...widths);
  svg.parentElement.style.setProperty('--diagram-min', `${Math.ceil(minimum)}px`);
}

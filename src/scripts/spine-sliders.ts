// Moves the readout and table highlight to the selected stop. Values come from the JSON the page embeds;
// nothing is computed here.
interface Figure { usd: string; share: string; width: number }
interface Cell { unserved: Figure; loss: Figure }
interface Grid {
  cap: { id: string; text: string }[];
  lltv: { value: number; label: string }[];
  cells: Record<string, Record<string, Cell>>;
}

const el = <T extends HTMLElement>(id: string): T => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`spine sliders: missing #${id}`);
  return node as T;
};

const grid: Grid = JSON.parse(el('grid-data').textContent ?? '');
const cap = el<HTMLInputElement>('cap');
const lltv = el<HTMLInputElement>('lltv');
const last = grid.lltv.length - 1;

function show() {
  const c = grid.cap[Number(cap.value)];
  const l = grid.lltv[Number(lltv.value)];
  const cell = grid.cells[c.id][l.value];
  const lltvText = l.label + (Number(lltv.value) === last ? ' (today)' : '');
  el('cap-out').textContent = c.text;
  el('lltv-out').textContent = lltvText;
  cap.setAttribute('aria-valuetext', c.text);
  lltv.setAttribute('aria-valuetext', lltvText);
  el('scenario').textContent = `${l.label} LLTV, ${c.text}`;
  for (const key of ['unserved', 'loss'] as const) {
    el(`${key}-usd`).textContent = cell[key].usd;
    el(`${key}-share`).textContent = cell[key].share;
    el(`${key}-bar`).style.width = `${cell[key].width}%`;
  }
  for (const td of document.querySelectorAll<HTMLElement>('td[data-cap]')) {
    const on = td.dataset.cap === c.id && Number(td.dataset.lltv) === l.value;
    td.classList.toggle('sel', on);
    if (on) td.setAttribute('aria-current', 'true');
    else td.removeAttribute('aria-current');
  }
}

cap.addEventListener('input', show);
lltv.addEventListener('input', show);
el('controls').hidden = false;
show();

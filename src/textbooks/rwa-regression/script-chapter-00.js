(()=>{

// ===========================================================
// Figure 1.1 — synthetic but realistic RWA token panel
// 170 weeks, 7 tokens, mcap + velocity, listings marked
// ===========================================================

const TOKENS = [
  { name: "BUIDL", color: "#52545a", treated: false, launchWeek:  62, mcapMax: 2400, vBase: 0.005, vSpread: 0.02 },
  { name: "OUSG",  color: "#52545a", treated: true,  launchWeek:   1, listingWeek:  44, mcapMax:  650, vBase: 0.3, vSpread: 0.6, vPost: 2.5 },
  { name: "USDY",  color: "#52545a", treated: true,  launchWeek:  30, listingWeek:  68, mcapMax: 1100, vBase: 0.6, vSpread: 0.8, vPost: 4.0 },
  { name: "BENJI", color: "#52545a", treated: false, launchWeek:   0, mcapMax:  430, vBase: 0.15, vSpread: 0.20 },
  { name: "USTB",  color: "#52545a", treated: false, launchWeek:  40, mcapMax:  680, vBase: 0.10, vSpread: 0.20 },
  { name: "USYC",  color: "#52545a", treated: false, launchWeek:  22, mcapMax:  490, vBase: 0.20, vSpread: 0.30 },
  { name: "STBT",  color: "#111214", treated: true,  launchWeek:  10, listingWeek:  92, mcapMax:  140, vBase: 0.4, vSpread: 0.5, vPost: 2.0 },
];

const N_WEEKS = 170;
const START_DATE = new Date("2023-01-08");

function seedRandom(seed){let s=seed%2147483647; if(s<=0) s+=2147483646;
  return ()=>{s=(s*16807)%2147483647; return (s-1)/2147483646;};}

const rand = seedRandom(42);

function buildData() {
  const data = {};
  for (const tok of TOKENS) {
    const series = [];
    for (let w = 0; w < N_WEEKS; w++) {
      if (w < tok.launchWeek) {
        series.push({ week: w, mcap: 0, velocity: null });
        continue;
      }
      const since = w - tok.launchWeek;
      const ramp = 1 - Math.exp(-since / 30);
      const mcap = tok.mcapMax * ramp * (0.85 + 0.3 * rand());
      let vel;
      if (tok.treated && w >= tok.listingWeek) {
        const sinceList = w - tok.listingWeek;
        const postRamp = 1 - Math.exp(-sinceList / 6);
        const target = tok.vBase + (tok.vPost - tok.vBase) * postRamp;
        vel = target * (0.65 + 0.7 * rand());
      } else {
        vel = tok.vBase * (1 - 0.5 + rand()) + tok.vSpread * (rand() - 0.5);
      }
      vel = Math.max(0, vel);
      series.push({ week: w, mcap: mcap, velocity: vel });
    }
    for (let w = 0; w < N_WEEKS; w++) {
      const slice = series.slice(Math.max(0, w-3), w+1).filter(d => d.velocity != null);
      series[w].velSmooth = slice.length ? slice.reduce((a,b) => a + b.velocity, 0) / slice.length : null;
    }
    data[tok.name] = series;
  }
  return data;
}

const DATA = buildData();

const svg = d3.select("#mcapVelChart");
const W = 860, H = 420;
const margin = { top: 24, right: 110, bottom: 36, left: 56 };
const topH = 180, botH = 180;
const innerW = W - margin.left - margin.right;

const xScale = d3.scaleLinear().domain([0, N_WEEKS - 1]).range([0, innerW]);
const yMcap  = d3.scaleLinear().domain([0, 2600]).range([topH, 0]);
const yVel   = d3.scaleLinear().domain([0, 5]).range([botH, 0]);

const gTop = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
const gBot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top + topH + 24})`);

gTop.append("g").attr("class", "grid")
  .selectAll("line").data(yMcap.ticks(5)).enter().append("line")
  .attr("x1", 0).attr("x2", innerW).attr("y1", d => yMcap(d)).attr("y2", d => yMcap(d));
gTop.append("g").attr("class", "axis").attr("transform", `translate(0,${topH})`)
  .call(d3.axisBottom(xScale).ticks(8).tickFormat(w => {
    const d = new Date(START_DATE); d.setDate(d.getDate() + w * 7);
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }));
gTop.append("g").attr("class", "axis")
  .call(d3.axisLeft(yMcap).ticks(5).tickFormat(d => `$${d}M`));
gTop.append("text").attr("class", "label")
  .attr("x", -40).attr("y", -8).text("Market cap (USD millions)");

gBot.append("g").attr("class", "grid")
  .selectAll("line").data(yVel.ticks(5)).enter().append("line")
  .attr("x1", 0).attr("x2", innerW).attr("y1", d => yVel(d)).attr("y2", d => yVel(d));
gBot.append("g").attr("class", "axis").attr("transform", `translate(0,${botH})`)
  .call(d3.axisBottom(xScale).ticks(8).tickFormat(w => {
    const d = new Date(START_DATE); d.setDate(d.getDate() + w * 7);
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }));
gBot.append("g").attr("class", "axis")
  .call(d3.axisLeft(yVel).ticks(5));
gBot.append("text").attr("class", "label")
  .attr("x", -40).attr("y", -8).text("Velocity (annualized, 4w avg)");

const listingMarkers = TOKENS.filter(t => t.treated);
[gTop, gBot].forEach((g, idx) => {
  const h = idx === 0 ? topH : botH;
  g.selectAll(".listing-mark").data(listingMarkers).enter().append("line")
    .attr("class", "listing-mark")
    .attr("x1", d => xScale(d.listingWeek)).attr("x2", d => xScale(d.listingWeek))
    .attr("y1", 0).attr("y2", h)
    .attr("stroke", d => d.color)
    .attr("stroke-dasharray", "3 3")
    .attr("opacity", 0.5);
});

const lineMcap = d3.line().x(d => xScale(d.week)).y(d => yMcap(d.mcap)).defined(d => d.mcap > 0);
const lineVel  = d3.line().x(d => xScale(d.week)).y(d => yVel(Math.min(d.velSmooth ?? 0, 5))).defined(d => d.velSmooth != null);

for (const tok of TOKENS) {
  gTop.append("path").datum(DATA[tok.name])
    .attr("fill", "none").attr("stroke", tok.color).attr("stroke-width", tok.treated ? 2.2 : 1.4)
    .attr("opacity", tok.treated ? 0.95 : 0.55)
    .attr("d", lineMcap);
  gBot.append("path").datum(DATA[tok.name])
    .attr("fill", "none").attr("stroke", tok.color).attr("stroke-width", tok.treated ? 2.2 : 1.4)
    .attr("opacity", tok.treated ? 0.95 : 0.55)
    .attr("d", lineVel);
}

const legendG = svg.append("g")
  .attr("transform", `translate(${margin.left + innerW + 14},${margin.top})`);
TOKENS.forEach((tok, i) => {
  const row = legendG.append("g").attr("transform", `translate(0,${i * 22})`);
  row.append("line").attr("x1", 0).attr("x2", 18).attr("y1", 8).attr("y2", 8)
    .attr("stroke", tok.color).attr("stroke-width", tok.treated ? 2.5 : 1.5);
  row.append("text").attr("x", 24).attr("y", 12).attr("class", "label")
    .style("font-weight", tok.treated ? 600 : 400)
    .text(tok.name);
});

const cursorTop = gTop.append("line").attr("y1", 0).attr("y2", topH)
  .attr("stroke", "#111214").attr("stroke-width", 1.5);
const cursorBot = gBot.append("line").attr("y1", 0).attr("y2", botH)
  .attr("stroke", "#111214").attr("stroke-width", 1.5);

function update(w) {
  cursorTop.attr("x1", xScale(w)).attr("x2", xScale(w));
  cursorBot.attr("x1", xScale(w)).attr("x2", xScale(w));
  const d = new Date(START_DATE); d.setDate(d.getDate() + w * 7);
  document.getElementById("weekValue").textContent =
    `Week ${w} (${d.toISOString().slice(0,10)})`;
  const readout = TOKENS.map(t => {
    const obs = DATA[t.name][w];
    if (!obs || obs.mcap === 0) return `<strong>${t.name}</strong>: pre-launch`;
    const treated = t.treated && w >= t.listingWeek ? " (listed)" : "";
    return `<strong>${t.name}</strong>${treated}: mcap=$${obs.mcap.toFixed(0)}M, vel=${(obs.velSmooth ?? 0).toFixed(2)}`;
  }).join(" &nbsp;|&nbsp; ");
  document.getElementById("figReadout").innerHTML = readout;
}

const slider = document.getElementById("weekSlider");
slider.addEventListener("input", e => update(+e.target.value));
update(60);

let playing = false, timer = null;
document.getElementById("playBtn").addEventListener("click", function() {
  if (playing) { clearInterval(timer); this.textContent = "▶ Play"; playing = false; return; }
  this.textContent = "❚❚ Pause"; playing = true;
  timer = setInterval(() => {
    let v = +slider.value;
    if (v >= N_WEEKS - 1) v = 0;
    else v++;
    slider.value = v;
    update(v);
  }, 80);
});
document.getElementById("resetBtn").addEventListener("click", () => {
  slider.value = 60; update(60);
  if (playing) { clearInterval(timer); document.getElementById("playBtn").textContent = "▶ Play"; playing = false; }
});

})();
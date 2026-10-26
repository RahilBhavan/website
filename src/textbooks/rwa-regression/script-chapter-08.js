(()=>{

{
  const svg = d3.select("#attGrid");
  const cohorts = [44, 68, 92];
  const periods = d3.range(1, 21).map(i => 40 + (i-1)*8);
  const margin = { top: 28, right: 24, bottom: 36, left: 80 };
  const innerW = 720 - margin.left - margin.right;
  const innerH = 280 - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xBand = d3.scaleBand().domain(periods.map(String)).range([0, innerW]).padding(0.06);
  const yBand = d3.scaleBand().domain(cohorts.map(String)).range([0, innerH]).padding(0.06);

  // Seeded PRNG so the grid is stable across clicks
  function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
  const _rng = mulberry32(123);
  const _cache = new Map();
  function attEst(g_, t) {
    if (t < g_) return null;
    const key = g_+":"+t;
    if (_cache.has(key)) return _cache.get(key);
    const e = t - g_;
    const baseEff = g_ === 44 ? 0.6 : g_ === 68 ? 0.9 : 0.4;
    const v = baseEff * (1 - Math.exp(-e/12)) + (_rng()-0.5)*0.08;
    _cache.set(key, v);
    return v;
  }

  const color = d3.scaleSequential(d3.interpolateGreys).domain([0, 1.2]);

  const cells = [];
  for (const c of cohorts) {
    for (const t of periods) {
      cells.push({ g: c, t, att: attEst(c, t) });
    }
  }

  g.selectAll("rect").data(cells).enter().append("rect")
    .attr("x", d => xBand(String(d.t))).attr("y", d => yBand(String(d.g)))
    .attr("width", xBand.bandwidth()).attr("height", yBand.bandwidth())
    .attr("fill", d => d.att == null ? "#e9e9e2" : color(d.att))
    .attr("stroke", "white").attr("stroke-width", 1)
    .style("cursor", "pointer")
    .on("click", function(_, d) {
      d3.selectAll("#attGrid rect").attr("stroke-width", 1).attr("stroke", "white");
      d3.select(this).attr("stroke-width", 2.5).attr("stroke", "#52545a");
      if (d.att == null) {
        document.getElementById("attGridReadout").innerHTML =
          `<strong>ATT(g=${d.g}, t=${d.t}):</strong> pre-treatment cell (t < g). No estimate.`;
      } else {
        const e = d.t - d.g;
        document.getElementById("attGridReadout").innerHTML =
          `<strong>ATT(g=${d.g}, t=${d.t}):</strong> ${d.att.toFixed(3)} (event-time e=${e}).
           This is a 2×2 DiD between cohort ${d.g} and the never-treated group, comparing the change between week ${d.g - 1} and week ${d.t}.`;
      }
    });

  g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xBand).tickValues(periods.filter((_,i)=>i%2===0).map(String)));
  g.append("g").attr("class", "axis").call(d3.axisLeft(yBand).tickFormat(d => `g=${d}`));

  g.append("text").attr("class", "label").attr("x", innerW/2).attr("y", innerH + 30)
    .attr("text-anchor", "middle").text("Calendar week t");
  g.append("text").attr("class", "label")
    .attr("transform", "rotate(-90)").attr("x", -innerH/2).attr("y", -60)
    .attr("text-anchor", "middle").text("Cohort g (first-treatment week)");
  g.append("text").attr("x", 0).attr("y", -10).attr("class", "label")
    .style("font-weight", 600).text("Color: ATT magnitude (darker = larger positive effect)");
}

{
  const svg = d3.select("#eventStudy");
  const margin = { top: 24, right: 24, bottom: 40, left: 56 };
  const innerW = 720 - margin.left - margin.right;
  const innerH = 340 - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const eRange = d3.range(-8, 13);
  const xScale = d3.scaleLinear().domain([-8, 12]).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([-0.8, 2.0]).range([innerH, 0]);

  g.append("g").attr("class", "grid")
    .selectAll("line").data(yScale.ticks(6)).enter().append("line")
    .attr("x1", 0).attr("x2", innerW).attr("y1", d => yScale(d)).attr("y2", d => yScale(d));
  g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(11));
  g.append("g").attr("class", "axis").call(d3.axisLeft(yScale).ticks(6));
  g.append("text").attr("class", "label").attr("x", innerW/2).attr("y", innerH + 32)
    .attr("text-anchor", "middle").text("Event time (weeks relative to listing)");
  g.append("text").attr("class", "label")
    .attr("transform", "rotate(-90)").attr("x", -innerH/2).attr("y", -42)
    .attr("text-anchor", "middle").text("ATT on IHS(velocity)");

  g.append("line").attr("x1", xScale(0)).attr("x2", xScale(0))
    .attr("y1", 0).attr("y2", innerH)
    .attr("stroke", "#52545a").attr("stroke-dasharray", "4 4").attr("opacity", 0.6);
  g.append("text").attr("x", xScale(0) + 4).attr("y", 14)
    .attr("class", "label").style("fill", "#52545a").text("Listing (e=0)");

  g.append("line").attr("x1", 0).attr("x2", innerW)
    .attr("y1", yScale(0)).attr("y2", yScale(0))
    .attr("stroke", "#111214").attr("stroke-width", 0.5);

  const ciBand = g.append("path").attr("fill", "#111214").attr("opacity", 0.18);
  const pointLine = g.append("path").attr("fill", "none").attr("stroke", "#111214").attr("stroke-width", 2);
  const pointsG = g.append("g");

  function redraw() {
    const staticE = +document.getElementById("evStaticEff").value;
    const dynE = +document.getElementById("evDynEff").value;
    const preSlope = +document.getElementById("evPreSlope").value;
    const noise = +document.getElementById("evNoise").value;
    document.getElementById("evStaticV").textContent = staticE.toFixed(1);
    document.getElementById("evDynV").textContent = dynE.toFixed(2);
    document.getElementById("evPreV").textContent = preSlope.toFixed(3);
    document.getElementById("evNoiseV").textContent = noise.toFixed(2);

    const series = eRange.map(e => {
      let mean = 0;
      if (e < 0) mean = preSlope * e;
      else mean = staticE + dynE * e;
      const se = noise * (1 + Math.abs(e)/20);
      return { e, mean, lo: mean - 1.96*se, hi: mean + 1.96*se };
    });

    const upperLine = d3.line().x(d => xScale(d.e)).y(d => yScale(d.hi));
    const lowerLine = d3.line().x(d => xScale(d.e)).y(d => yScale(d.lo));
    ciBand.attr("d",
      upperLine(series) + "L" + lowerLine([...series].reverse()).slice(1) + "Z");

    pointLine.attr("d", d3.line().x(d => xScale(d.e)).y(d => yScale(d.mean))(series));

    const sel = pointsG.selectAll("circle").data(series, d => d.e);
    sel.enter().append("circle")
      .merge(sel)
      .attr("cx", d => xScale(d.e))
      .attr("cy", d => yScale(d.mean))
      .attr("r", 3.5)
      .attr("fill", d => d.e >= 0 ? "#111214" : "#52545a");

    const prePts = series.filter(d => d.e < 0);
    const maxPreAbs = Math.max(...prePts.map(d => Math.abs(d.mean)));
    document.getElementById("eventStudyReadout").innerHTML = `
      Max absolute pre-treatment ATT: <strong>${maxPreAbs.toFixed(3)}</strong>
      ${maxPreAbs > 0.15 ? "<strong style='color:#52545a'>(pre-trend test would reject parallel trends)</strong>" : "<strong style='color:#111214'>(consistent with parallel pre-trends)</strong>"}
      &nbsp;|&nbsp; Post-treatment ATT at e=12: <strong>${series.find(d=>d.e===12).mean.toFixed(2)}</strong>.
    `;
  }
  ["evStaticEff","evDynEff","evPreSlope","evNoise"].forEach(id => document.getElementById(id).addEventListener("input", redraw));
  redraw();
}

})();
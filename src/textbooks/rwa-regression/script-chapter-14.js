(()=>{

{
  const svg = d3.select("#powerChart");
  const margin = { top: 24, right: 24, bottom: 40, left: 56 };
  const innerW = 720 - margin.left - margin.right;
  const innerH = 280 - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().domain([0, 2]).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

  g.append("g").attr("class", "grid")
    .selectAll("line").data(yScale.ticks(5)).enter().append("line")
    .attr("x1", 0).attr("x2", innerW).attr("y1", d => yScale(d)).attr("y2", d => yScale(d));
  g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(10));
  g.append("g").attr("class", "axis")
    .call(d3.axisLeft(yScale).tickValues([0, 0.2, 0.4, 0.6, 0.8, 1])
      .tickFormat(d => `${(d*100).toFixed(0)}%`));
  g.append("text").attr("class", "label").attr("x", innerW/2).attr("y", innerH + 32)
    .attr("text-anchor", "middle").text("True effect size (IHS units)");
  g.append("text").attr("class", "label")
    .attr("transform", "rotate(-90)").attr("x", -innerH/2).attr("y", -42)
    .attr("text-anchor", "middle").text("Statistical power");

  g.append("line").attr("x1", 0).attr("x2", innerW)
    .attr("y1", yScale(0.8)).attr("y2", yScale(0.8))
    .attr("stroke", "#111214").attr("stroke-dasharray", "4 4").attr("opacity", 0.7);
  g.append("text").attr("x", innerW - 4).attr("y", yScale(0.8) - 4)
    .attr("class", "label").attr("text-anchor", "end").style("fill", "#111214")
    .text("80% power threshold");

  function normCDF(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x*x/2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  }

  const powerLine = g.append("path").attr("fill", "none").attr("stroke", "#111214").attr("stroke-width", 2.5);
  const currentLine = g.append("line").attr("stroke", "#52545a").attr("stroke-dasharray", "3 3");
  const currentDot = g.append("circle").attr("r", 5).attr("fill", "#52545a");

  function redraw() {
    const nT = +document.getElementById("nTreated").value;
    const nC = +document.getElementById("nControls").value;
    const T = +document.getElementById("nWeeks").value;
    const eff = +document.getElementById("effSize").value;
    const noise = +document.getElementById("resNoise").value;
    document.getElementById("nTreatedV").textContent = nT;
    document.getElementById("nControlsV").textContent = nC;
    document.getElementById("nWeeksV").textContent = T;
    document.getElementById("effSizeV").textContent = eff.toFixed(2);
    document.getElementById("resNoiseV").textContent = noise.toFixed(2);

    const N = nT + nC;
    const effectivePostFrac = 0.4;
    // Account for within-cluster correlation via a design-effect adjustment.
    // Effective sample size n_eff = N*T / (1 + (T-1)*rho).
    // With token-level clustering and weekly noise, a realistic rho is ~0.3.
    const rho = 0.3;
    const designEffect = 1 + (T * effectivePostFrac - 1) * rho;
    function power(e) {
      const denom = noise * Math.sqrt(designEffect) / Math.sqrt(N * T * effectivePostFrac);
      const z = Math.abs(e) / denom - 1.96;
      return normCDF(z);
    }

    const xs = d3.range(0, 2.01, 0.025);
    powerLine.attr("d", d3.line().x(d => xScale(d)).y(d => yScale(power(d)))(xs));

    const p = power(eff);
    currentLine.attr("x1", xScale(eff)).attr("x2", xScale(eff))
      .attr("y1", innerH).attr("y2", yScale(p));
    currentDot.attr("cx", xScale(eff)).attr("cy", yScale(p));

    document.getElementById("powerReadout").innerHTML = `
      N = ${N} tokens, T = ${T} weeks, σ = ${noise.toFixed(2)}.
      &nbsp;|&nbsp; <strong>Power to detect ATT = ${eff.toFixed(2)}: ${(p * 100).toFixed(1)}%</strong>
      ${p > 0.8 ? " <span style='color:#111214'>✓ above 80% threshold</span>" : p > 0.5 ? " <span style='color:#52545a'>moderate</span>" : " <span style='color:#52545a'>underpowered</span>"}
      &nbsp;|&nbsp; Power for ATT=0.50: ${(power(0.5)*100).toFixed(0)}%.
      &nbsp;|&nbsp; Power for ATT=1.00: ${(power(1.0)*100).toFixed(0)}%.
    `;
  }
  ["nTreated","nControls","nWeeks","effSize","resNoise"].forEach(id => document.getElementById(id).addEventListener("input", redraw));
  redraw();
}

})();
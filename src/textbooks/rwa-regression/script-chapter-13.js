(()=>{

{
  const svg = d3.select("#placeboHist");
  const margin = { top: 24, right: 24, bottom: 40, left: 56 };
  const innerW = 720 - margin.left - margin.right;
  const innerH = 320 - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().domain([-1.2, 1.2]).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

  g.append("g").attr("class", "axis xaxis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(10));
  g.append("g").attr("class", "axis yaxis").call(d3.axisLeft(yScale).ticks(5));
  g.append("text").attr("class", "label").attr("x", innerW/2).attr("y", innerH + 32)
    .attr("text-anchor", "middle").text("Placebo ATT estimate");
  g.append("text").attr("class", "label")
    .attr("transform", "rotate(-90)").attr("x", -innerH/2).attr("y", -42)
    .attr("text-anchor", "middle").text("Density");

  const bars = g.append("g");
  const actualLine = g.append("line")
    .attr("y1", 0).attr("y2", innerH)
    .attr("stroke", "#52545a").attr("stroke-width", 2.5);
  const actualLabel = g.append("text").attr("y", 14).attr("class", "label")
    .style("font-weight", 600).style("fill", "#52545a");

  function gaussian() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function runPlacebo() {
    const trueEff = +document.getElementById("trueEffect").value;
    const noise = +document.getElementById("placeboNoise").value;
    document.getElementById("trueEffectV").textContent = trueEff.toFixed(2);
    document.getElementById("placeboNoiseV").textContent = noise.toFixed(2);

    const N = 500;
    const placebos = [];
    for (let i = 0; i < N; i++) {
      placebos.push(gaussian() * noise);
    }
    const actual = trueEff + gaussian() * (noise * 0.5);

    placebos.sort((a, b) => a - b);
    const pValue = placebos.filter(p => Math.abs(p) >= Math.abs(actual)).length / N;

    const binCount = 30;
    const bins = d3.histogram().domain([-1.2, 1.2]).thresholds(binCount)(placebos);
    const maxBin = d3.max(bins, b => b.length / N);
    yScale.domain([0, maxBin * 1.2]);
    g.select(".yaxis").remove();
    g.append("g").attr("class", "axis yaxis").call(d3.axisLeft(yScale).ticks(5));

    const sel = bars.selectAll("rect").data(bins);
    sel.enter().append("rect").merge(sel)
      .attr("x", d => xScale(d.x0))
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("y", d => yScale(d.length / N))
      .attr("height", d => innerH - yScale(d.length / N))
      .attr("fill", "#111214").attr("opacity", 0.45);
    sel.exit().remove();

    actualLine.attr("x1", xScale(actual)).attr("x2", xScale(actual));
    actualLabel.attr("x", xScale(actual) + 4).text(`actual = ${actual.toFixed(2)}`);

    document.getElementById("placeboReadout").innerHTML = `
      Actual ATT: <strong style="color:#52545a">${actual.toFixed(3)}</strong>
      &nbsp;|&nbsp; Mean placebo: <strong>${d3.mean(placebos).toFixed(3)}</strong>
      (should be ~0 under no effect)
      &nbsp;|&nbsp; SD of placebos: <strong>${d3.deviation(placebos).toFixed(3)}</strong>
      &nbsp;|&nbsp; Placebo p-value: <strong style="color:${pValue < 0.05 ? '#111214' : '#52545a'}">${pValue.toFixed(3)}</strong>
      ${pValue < 0.05 ? " ← reject null of zero effect." : " ← cannot reject null; effect indistinguishable from noise."}
    `;
  }

  document.getElementById("runPlacebo").addEventListener("click", runPlacebo);
  runPlacebo();
}

})();
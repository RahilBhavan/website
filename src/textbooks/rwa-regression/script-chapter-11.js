(()=>{

{
  const svg = d3.select("#rothChart");
  const margin = { top: 24, right: 130, bottom: 40, left: 56 };
  const innerW = 720 - margin.left - margin.right;
  const innerH = 280 - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().domain([-1, 3]).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

  g.append("g").attr("class", "axis xaxis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(8));
  g.append("g").attr("class", "axis yaxis").call(d3.axisLeft(yScale).ticks(5));
  g.append("text").attr("class", "label").attr("x", innerW/2).attr("y", innerH + 32)
    .attr("text-anchor", "middle").text("Post-treatment estimate (true effect = 1.0)");
  g.append("text").attr("class", "label")
    .attr("transform", "rotate(-90)").attr("x", -innerH/2).attr("y", -42)
    .attr("text-anchor", "middle").text("Density");

  const passBars = g.append("g");
  const failBars = g.append("g");
  g.append("line")
    .attr("x1", xScale(1)).attr("x2", xScale(1)).attr("y1", 0).attr("y2", innerH)
    .attr("stroke", "#111214").attr("stroke-width", 1).attr("stroke-dasharray", "3 3");
  g.append("text").attr("x", xScale(1) + 4).attr("y", 14).attr("class", "label")
    .text("true effect");

  const leg = svg.append("g").attr("transform", `translate(${margin.left + innerW + 12}, ${margin.top + 12})`);
  [["PT test PASSED", "#111214"], ["PT test REJECTED", "#52545a"], ["True effect", "#111214"]].forEach((d, i) => {
    leg.append("rect").attr("x", 0).attr("y", i*22 - 6).attr("width", 14).attr("height", 10)
      .attr("fill", d[1]).attr("opacity", i === 2 ? 0 : 0.6).attr("stroke", d[1]).attr("stroke-dasharray", i === 2 ? "3 3" : null);
    leg.append("text").attr("x", 20).attr("y", i*22 + 4).attr("class", "label").text(d[0]);
  });

  function gaussian() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function simulate() {
    const trueSlope = +document.getElementById("trueSlope").value;
    const noise = +document.getElementById("noiseSE").value;
    const preLen = +document.getElementById("prePeriod").value;
    document.getElementById("trueSlopeV").textContent = trueSlope.toFixed(2) + " per week";
    document.getElementById("noiseSEV").textContent = noise.toFixed(2);
    document.getElementById("prePeriodV").textContent = preLen;

    const NSIM = 1000;
    const passEst = [], failEst = [];
    // Joint Wald-style test: sum of squared standardized pre-coefficients ~ chi-sq(preLen).
    // Reject parallel trends if W > critical value at alpha = 0.05.
    // chi-sq 95th-percentile critical values for df = 1..16
    const CHI95 = [3.84, 5.99, 7.81, 9.49, 11.07, 12.59, 14.07, 15.51,
                   16.92, 18.31, 19.68, 21.03, 22.36, 23.68, 25.00, 26.30];
    for (let s = 0; s < NSIM; s++) {
      const preCoefs = d3.range(1, preLen+1).map(eMag => -trueSlope * eMag + gaussian() * noise);
      const W = preCoefs.reduce((sum, c) => sum + (c/noise)*(c/noise), 0);
      const passes = W < CHI95[preLen-1];
      const postEst = 1.0 + trueSlope * 4 + gaussian() * noise;
      if (passes) passEst.push(postEst);
      else failEst.push(postEst);
    }

    const binCount = 30;
    const bins = (data) => d3.histogram().domain([-1, 3]).thresholds(binCount)(data);
    const passBins = bins(passEst), failBins = bins(failEst);
    const maxFrac = Math.max(
      d3.max(passBins, b => passEst.length ? b.length / passEst.length : 0),
      d3.max(failBins, b => failEst.length ? b.length / failEst.length : 0)
    );
    yScale.domain([0, (maxFrac || 0.1) * 1.1]);
    g.select(".yaxis").remove();
    g.append("g").attr("class", "axis yaxis").call(d3.axisLeft(yScale).ticks(5));

    function bind(group, bins, total, color) {
      const sel = group.selectAll("rect").data(bins);
      sel.enter().append("rect").merge(sel)
        .attr("x", d => xScale(d.x0))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("y", d => yScale(total ? d.length / total : 0))
        .attr("height", d => innerH - yScale(total ? d.length / total : 0))
        .attr("fill", color).attr("opacity", 0.55);
      sel.exit().remove();
    }
    bind(passBars, passBins, passEst.length, "#111214");
    bind(failBars, failBins, failEst.length, "#52545a");

    const passMean = passEst.length ? d3.mean(passEst) : null;
    const passBias = passMean != null ? passMean - 1.0 : null;
    const failPct = (failEst.length / NSIM) * 100;
    document.getElementById("rothReadout").innerHTML = `
      <strong>${passEst.length}/${NSIM} simulations (${(100 - failPct).toFixed(1)}%)</strong> passed the pre-trend test.
      &nbsp;|&nbsp; Mean post-treatment estimate among passing: <strong>${passMean?.toFixed(3) ?? "—"}</strong>
      &nbsp;|&nbsp; <strong style="color:${Math.abs(passBias ?? 0) > 0.15 ? '#52545a' : '#111214'}">Bias among passing studies: ${passBias?.toFixed(3) ?? "—"}</strong>
      ${Math.abs(passBias ?? 0) > 0.15 ? " ← the pretesting selection bias is real." : ""}
    `;
  }
  document.getElementById("runSim").addEventListener("click", simulate);
  ["trueSlope", "noiseSE", "prePeriod"].forEach(id => document.getElementById(id).addEventListener("input", () => {
    document.getElementById(id+"V").textContent =
      id === "trueSlope" ? (+document.getElementById(id).value).toFixed(2) + " per week"
      : id === "noiseSE" ? (+document.getElementById(id).value).toFixed(2)
      : document.getElementById(id).value;
  }));
  simulate();
}

})();
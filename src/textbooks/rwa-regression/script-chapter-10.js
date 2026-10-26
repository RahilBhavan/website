(()=>{

{
  const N_CLUSTERS = 7;
  const clusterMeans = [0.45, -0.20, 0.10, 0.25, -0.05, 0.30, -0.15];
  const observedBeta = clusterMeans.reduce((a,b) => a+b, 0) / N_CLUSTERS;
  // Conventional cluster-robust SE = sqrt(var of cluster-level β contributions / G).
  // Apply the CR1 small-N correction factor sqrt(G/(G-1)) so the comparison reflects
  // what fixest would actually report.
  const meanCm = clusterMeans.reduce((a,b)=>a+b,0)/N_CLUSTERS;
  const varCm = clusterMeans.reduce((s,x)=>s+(x-meanCm)*(x-meanCm),0)/(N_CLUSTERS-1);
  const seConventional = Math.sqrt(varCm / N_CLUSTERS) * Math.sqrt(N_CLUSTERS/(N_CLUSTERS-1));

  const svg = d3.select("#bootHist");
  const margin = { top: 24, right: 24, bottom: 40, left: 56 };
  const innerW = 720 - margin.left - margin.right;
  const innerH = 320 - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().domain([-1, 1]).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

  g.append("g").attr("class", "axis xaxis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(8));
  g.append("g").attr("class", "axis yaxis").call(d3.axisLeft(yScale).ticks(5));
  g.append("text").attr("class", "label").attr("x", innerW/2).attr("y", innerH + 32)
    .attr("text-anchor", "middle").text("Bootstrap β*");
  g.append("text").attr("class", "label")
    .attr("transform", "rotate(-90)").attr("x", -innerH/2).attr("y", -42)
    .attr("text-anchor", "middle").text("Density");

  const conventionalCI = [observedBeta - 1.96*seConventional, observedBeta + 1.96*seConventional];
  g.append("rect")
    .attr("x", xScale(conventionalCI[0])).attr("y", 0)
    .attr("width", xScale(conventionalCI[1]) - xScale(conventionalCI[0]))
    .attr("height", innerH)
    .attr("fill", "#52545a").attr("opacity", 0.1)
    .attr("stroke", "#52545a").attr("stroke-dasharray", "4 4");

  g.append("line").attr("x1", xScale(observedBeta)).attr("x2", xScale(observedBeta))
    .attr("y1", 0).attr("y2", innerH)
    .attr("stroke", "#52545a").attr("stroke-width", 2);

  const bars = g.append("g");
  const bootCIRect = g.append("rect")
    .attr("fill", "rgba(24,95,165,0.10)").attr("stroke", "#111214").attr("stroke-width", 1.5);

  function rademacher() { return Math.random() < 0.5 ? -1 : 1; }
  function webb() {
    const u = Math.random();
    const opts = [-Math.sqrt(1.5), -1, -Math.sqrt(0.5), Math.sqrt(0.5), 1, Math.sqrt(1.5)];
    return opts[Math.floor(u * 6)];
  }

  function runBoot() {
    const B = +document.getElementById("B").value;
    const wts = document.getElementById("wts").value;
    document.getElementById("BV").textContent = B;
    const drawWt = wts === "rademacher" ? rademacher : webb;
    const betas = [];
    for (let b = 0; b < B; b++) {
      const flipped = clusterMeans.map(m => m * drawWt());
      betas.push(flipped.reduce((a,b)=>a+b, 0) / N_CLUSTERS);
    }
    betas.sort((a,b) => a-b);
    const bootCI = [betas[Math.floor(B*0.025)], betas[Math.floor(B*0.975)]];

    const binCount = 30;
    const bins = d3.histogram().domain([-1, 1]).thresholds(binCount)(betas);
    const maxBin = d3.max(bins, d => d.length);
    yScale.domain([0, maxBin / B * binCount * 1.1]);
    g.select(".yaxis").remove();
    g.append("g").attr("class", "axis yaxis").call(d3.axisLeft(yScale).ticks(5));

    const sel = bars.selectAll("rect").data(bins);
    sel.enter().append("rect").merge(sel)
      .attr("x", d => xScale(d.x0))
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("y", d => yScale(d.length / B * binCount))
      .attr("height", d => innerH - yScale(d.length / B * binCount))
      .attr("fill", "#111214").attr("opacity", 0.55);
    sel.exit().remove();

    bootCIRect
      .attr("x", xScale(bootCI[0])).attr("y", -8)
      .attr("width", xScale(bootCI[1]) - xScale(bootCI[0])).attr("height", 6);

    const widthRatio = (bootCI[1] - bootCI[0]) / (conventionalCI[1] - conventionalCI[0]);
    document.getElementById("bootReadout").innerHTML = `
      Observed β = <strong>${observedBeta.toFixed(3)}</strong>
      &nbsp;|&nbsp; Conventional CR-SE 95% CI: <strong style="color:#52545a">(${conventionalCI[0].toFixed(2)}, ${conventionalCI[1].toFixed(2)})</strong>
      &nbsp;|&nbsp; Wild bootstrap 95% CI: <strong style="color:#111214">(${bootCI[0].toFixed(2)}, ${bootCI[1].toFixed(2)})</strong>
      &nbsp;<br/>Bootstrap CI is ${widthRatio.toFixed(2)}× as wide as the conventional one.
      With ${wts} weights and B=${B} iterations.
    `;
  }

  document.getElementById("runBoot").addEventListener("click", runBoot);
  document.getElementById("B").addEventListener("input", e =>
    document.getElementById("BV").textContent = e.target.value);
  runBoot();
}

})();
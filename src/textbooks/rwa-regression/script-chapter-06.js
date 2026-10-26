(()=>{

{
  const svg = d3.select("#did22");
  const W = 720, H = 320;
  const margin = { top: 24, right: 130, bottom: 40, left: 56 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scalePoint().domain(["Before", "After"]).range([60, innerW - 40]).padding(0.5);
  const yScale = d3.scaleLinear().domain([0, 5]).range([innerH, 0]);

  g.append("g").attr("class", "grid")
    .selectAll("line").data(yScale.ticks(6)).enter().append("line")
    .attr("x1", 0).attr("x2", innerW).attr("y1", d => yScale(d)).attr("y2", d => yScale(d));
  g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale));
  g.append("g").attr("class", "axis").call(d3.axisLeft(yScale).ticks(6));
  g.append("text").attr("class", "label")
    .attr("transform", `rotate(-90)`).attr("x", -innerH/2).attr("y", -42)
    .attr("text-anchor", "middle").text("Outcome (velocity)");

  const ousgLine = g.append("line").attr("stroke", "#111214").attr("stroke-width", 2.5);
  const ousgPre  = g.append("circle").attr("r", 6).attr("fill", "#111214");
  const ousgPost = g.append("circle").attr("r", 6).attr("fill", "#111214");
  const buidlLine = g.append("line").attr("stroke", "#52545a").attr("stroke-width", 2.5).attr("stroke-dasharray", "2 3");
  const buidlPre  = g.append("circle").attr("r", 6).attr("fill", "#52545a");
  const buidlPost = g.append("circle").attr("r", 6).attr("fill", "#52545a");
  const cfLine   = g.append("line").attr("stroke", "#52545a").attr("stroke-width", 2.5).attr("stroke-dasharray", "5 4").attr("opacity", 0.7);
  const cfPost   = g.append("circle").attr("r", 5).attr("fill", "none").attr("stroke", "#52545a").attr("stroke-width", 2);

  const leg = svg.append("g").attr("transform", `translate(${margin.left + innerW + 10}, ${margin.top + 20})`);
  [["OUSG (treated)", "#111214", null], ["BUIDL (control)", "#52545a", "2 3"], ["OUSG counterfactual", "#52545a", "5 4"]].forEach((d, i) => {
    leg.append("line").attr("x1", 0).attr("x2", 16).attr("y1", i*20).attr("y2", i*20)
      .attr("stroke", d[1]).attr("stroke-width", 2.5).attr("stroke-dasharray", d[2]);
    leg.append("text").attr("x", 22).attr("y", i*20 + 4).attr("class", "label").text(d[0]);
  });

  function redraw() {
    const Opre = +document.getElementById("Opre").value;
    const Opost = +document.getElementById("Opost").value;
    const Bpre = +document.getElementById("Bpre").value;
    const Bpost = +document.getElementById("Bpost").value;
    ["Opre", "Opost", "Bpre", "Bpost"].forEach(id => document.getElementById(id+"V").textContent = (+document.getElementById(id).value).toFixed(1));

    ousgLine.attr("x1", xScale("Before")).attr("y1", yScale(Opre)).attr("x2", xScale("After")).attr("y2", yScale(Opost));
    ousgPre.attr("cx", xScale("Before")).attr("cy", yScale(Opre));
    ousgPost.attr("cx", xScale("After")).attr("cy", yScale(Opost));
    buidlLine.attr("x1", xScale("Before")).attr("y1", yScale(Bpre)).attr("x2", xScale("After")).attr("y2", yScale(Bpost));
    buidlPre.attr("cx", xScale("Before")).attr("cy", yScale(Bpre));
    buidlPost.attr("cx", xScale("After")).attr("cy", yScale(Bpost));

    const cfPostY = Opre + (Bpost - Bpre);
    cfLine.attr("x1", xScale("Before")).attr("y1", yScale(Opre)).attr("x2", xScale("After")).attr("y2", yScale(cfPostY));
    cfPost.attr("cx", xScale("After")).attr("cy", yScale(cfPostY));

    const did = (Opost - Opre) - (Bpost - Bpre);
    document.getElementById("did22Readout").innerHTML = `
      ΔOUSG = ${(Opost-Opre).toFixed(2)} &nbsp;|&nbsp;
      ΔBUIDL = ${(Bpost-Bpre).toFixed(2)} &nbsp;|&nbsp;
      <strong>DiD = ΔOUSG − ΔBUIDL = ${did.toFixed(2)}</strong>
      &nbsp;|&nbsp; OUSG counterfactual ${(cfPostY).toFixed(2)}, observed-vs-cf gap ${(Opost - cfPostY).toFixed(2)}.
    `;
  }
  ["Opre","Opost","Bpre","Bpost"].forEach(id => document.getElementById(id).addEventListener("input", redraw));
  redraw();
}

{
  const svg = d3.select("#parallelSandbox");
  const W = 720, H = 360;
  const margin = { top: 24, right: 130, bottom: 40, left: 56 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().domain([0, 20]).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, 5]).range([innerH, 0]);

  g.append("g").attr("class", "grid")
    .selectAll("line").data(yScale.ticks(6)).enter().append("line")
    .attr("x1", 0).attr("x2", innerW).attr("y1", d => yScale(d)).attr("y2", d => yScale(d));
  g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(10));
  g.append("g").attr("class", "axis").call(d3.axisLeft(yScale).ticks(6));
  g.append("text").attr("class", "label").attr("x", innerW/2).attr("y", innerH + 32)
    .attr("text-anchor", "middle").text("Week (treatment at week 10)");

  g.append("line").attr("x1", xScale(10)).attr("x2", xScale(10))
    .attr("y1", 0).attr("y2", innerH)
    .attr("stroke", "#111214").attr("stroke-dasharray", "4 4").attr("opacity", 0.6);
  g.append("text").attr("x", xScale(10) + 4).attr("y", 12)
    .attr("class", "label").style("fill", "#111214").text("AMM listing");

  const ctrlData = d3.range(0, 21).map(t => ({ t, y: 0.2 + t * 0.02 + Math.sin(t/3) * 0.05 }));
  g.append("path").datum(ctrlData)
    .attr("fill", "none").attr("stroke", "#52545a").attr("stroke-width", 2)
    .attr("d", d3.line().x(d => xScale(d.t)).y(d => yScale(d.y)));

  const treatedObs = d3.range(0, 21).map(t => {
    if (t < 10) return { t, y: 0.6 + t * 0.02 + Math.sin(t/3) * 0.05 };
    const sinceList = t - 10;
    return { t, y: 0.6 + 10*0.02 + 2 * (1 - Math.exp(-sinceList/3)) };
  });
  g.append("path").datum(treatedObs)
    .attr("fill", "none").attr("stroke", "#52545a").attr("stroke-width", 2.5)
    .attr("d", d3.line().x(d => xScale(d.t)).y(d => yScale(d.y)));

  let cfEnd = 0.85;
  const cfStart = treatedObs[10].y;
  const cfLine = g.append("line")
    .attr("stroke", "#52545a").attr("stroke-dasharray", "5 4")
    .attr("opacity", 0.7).attr("stroke-width", 2);
  const cfHandle = g.append("circle")
    .attr("r", 9).attr("fill", "#fff").attr("stroke", "#52545a").attr("stroke-width", 2.5)
    .style("cursor", "ns-resize");
  const effectBand = g.append("rect")
    .attr("fill", "rgba(226,75,74,0.08)").attr("stroke", "none");

  const leg = svg.append("g").attr("transform", `translate(${margin.left + innerW + 10}, ${margin.top + 20})`);
  [["Treated (observed)", "#52545a", null], ["Control (BUIDL)", "#52545a", null], ["Counterfactual (drag)", "#52545a", "5 4"]].forEach((d, i) => {
    leg.append("line").attr("x1", 0).attr("x2", 16).attr("y1", i*20).attr("y2", i*20)
      .attr("stroke", d[1]).attr("stroke-width", 2.5).attr("stroke-dasharray", d[2]);
    leg.append("text").attr("x", 22).attr("y", i*20 + 4).attr("class", "label").text(d[0]);
  });

  function redraw() {
    cfLine
      .attr("x1", xScale(10)).attr("y1", yScale(cfStart))
      .attr("x2", xScale(20)).attr("y2", yScale(cfEnd));
    cfHandle.attr("cx", xScale(20)).attr("cy", yScale(cfEnd));
    const ctrlChange = ctrlData[20].y - ctrlData[10].y;
    const didEstimate = (treatedObs[20].y - treatedObs[10].y) - ctrlChange;
    const trueEffect = treatedObs[20].y - cfEnd;

    effectBand
      .attr("x", xScale(19)).attr("y", yScale(treatedObs[20].y))
      .attr("width", 16).attr("height", yScale(cfEnd) - yScale(treatedObs[20].y));

    document.getElementById("ptReadout").innerHTML = `
      DiD estimate (assumes control trend = counterfactual trend): <strong>${didEstimate.toFixed(2)}</strong>
      &nbsp;|&nbsp; True effect (assuming your dragged counterfactual is right): <strong style="color:#52545a">${trueEffect.toFixed(2)}</strong>
      &nbsp;|&nbsp; Bias from PT violation: <strong>${(didEstimate - trueEffect).toFixed(2)}</strong>
      ${Math.abs(didEstimate - trueEffect) > 0.1 ? "&nbsp; ← parallel trends fails; DiD is biased." : "&nbsp; ← roughly parallel; DiD ≈ true effect."}
    `;
  }

  const drag = d3.drag().on("drag", function(event) {
    cfEnd = Math.max(0, Math.min(5, yScale.invert(event.y)));
    redraw();
  });
  cfHandle.call(drag);
  redraw();
}

})();

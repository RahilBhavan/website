(()=>{

{
  const svg = d3.select("#transforms");
  const W = 720, H = 340;
  const margin = { top: 18, right: 24, bottom: 44, left: 56 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().domain([0, 20]).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([-1, 4]).range([innerH, 0]);

  g.append("g").attr("class", "grid")
    .selectAll("line").data(yScale.ticks(6)).enter().append("line")
    .attr("x1", 0).attr("x2", innerW).attr("y1", d => yScale(d)).attr("y2", d => yScale(d));
  g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(10));
  g.append("g").attr("class", "axis").call(d3.axisLeft(yScale).ticks(6));
  g.append("text").attr("class", "label").attr("x", innerW/2).attr("y", innerH + 36)
    .attr("text-anchor", "middle").text("Velocity V");
  g.append("text").attr("class", "label")
    .attr("transform", `rotate(-90)`).attr("x", -innerH/2).attr("y", -42)
    .attr("text-anchor", "middle").text("Transform value");

  const xs = d3.range(0, 20.01, 0.05);
  const fRaw = v => v / 5;
  const fLog = v => Math.log(v + 1);
  const fIHS = v => Math.log(v + Math.sqrt(v * v + 1));

  const lineGen = f => d3.line().x(d => xScale(d)).y(d => yScale(f(d)));
  g.append("path").datum(xs).attr("fill", "none").attr("stroke", "#52545a")
    .attr("stroke-width", 2).attr("stroke-dasharray", "4 4").attr("d", lineGen(fRaw));
  g.append("path").datum(xs).attr("fill", "none").attr("stroke", "#111214")
    .attr("stroke-width", 2).attr("d", lineGen(fLog));
  g.append("path").datum(xs).attr("fill", "none").attr("stroke", "#52545a")
    .attr("stroke-width", 2.5).attr("d", lineGen(fIHS));

  const leg = g.append("g").attr("transform", `translate(${innerW - 200}, 12)`);
  [["raw V (÷5 for display)", "#52545a", "4 4"], ["log(V+1)", "#111214", null], ["IHS(V)", "#52545a", null]].forEach((d, i) => {
    leg.append("line").attr("x1", 0).attr("x2", 18).attr("y1", i*18).attr("y2", i*18)
      .attr("stroke", d[1]).attr("stroke-width", 2.5)
      .attr("stroke-dasharray", d[2]);
    leg.append("text").attr("x", 24).attr("y", i*18 + 4).attr("class", "label").text(d[0]);
  });

  const cursor = g.append("circle").attr("r", 5).attr("fill", "#52545a").attr("stroke", "white").attr("stroke-width", 2);
  const cursorLog = g.append("circle").attr("r", 5).attr("fill", "#111214").attr("stroke", "white").attr("stroke-width", 2);
  const xLine = g.append("line").attr("stroke", "#111214").attr("stroke-dasharray", "3 3").attr("opacity", 0.5);

  function update() {
    const v = +document.getElementById("vSlider").value;
    document.getElementById("vValue").textContent = `V = ${v.toFixed(2)}`;
    cursor.attr("cx", xScale(v)).attr("cy", yScale(fIHS(v)));
    cursorLog.attr("cx", xScale(v)).attr("cy", yScale(fLog(v)));
    xLine.attr("x1", xScale(v)).attr("x2", xScale(v)).attr("y1", innerH).attr("y2", 0);
    document.getElementById("transformReadout").innerHTML = `
      At V = ${v.toFixed(2)}:&nbsp;
      raw = ${v.toFixed(3)}, log(V+1) = <strong style="color:#111214">${fLog(v).toFixed(3)}</strong>,
      IHS(V) = <strong style="color:#52545a">${fIHS(v).toFixed(3)}</strong>.
      ${v < 0.5 ? "&nbsp; Note how IHS and log(V+1) are close to V itself here — small-value regime." : ""}
      ${v > 2 ? "&nbsp; Note how IHS ≈ log(2V) here — large-value regime where the transform behaves like a true log." : ""}
    `;
  }
  document.getElementById("vSlider").addEventListener("input", update);
  update();
}

})();
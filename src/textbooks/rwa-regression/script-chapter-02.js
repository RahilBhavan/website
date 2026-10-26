(()=>{

// Figure 3.1 — constant product x*y = k
{
  const svg = d3.select("#ammCurve");
  const W = 720, H = 380;
  const margin = { top: 24, right: 32, bottom: 44, left: 56 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().domain([0, 200]).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, 200]).range([innerH, 0]);

  g.append("g").attr("class", "grid")
    .selectAll("line.h").data(yScale.ticks(8)).enter().append("line")
    .attr("x1", 0).attr("x2", innerW).attr("y1", d => yScale(d)).attr("y2", d => yScale(d));
  g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(8));
  g.append("g").attr("class", "axis").call(d3.axisLeft(yScale).ticks(8));
  g.append("text").attr("class", "label").attr("x", innerW/2).attr("y", innerH + 36)
    .attr("text-anchor", "middle").text("Reserve of Token A (x)");
  g.append("text").attr("class", "label")
    .attr("transform", `rotate(-90)`).attr("x", -innerH/2).attr("y", -42)
    .attr("text-anchor", "middle").text("Reserve of Token B (y)");

  const curvePath = g.append("path").attr("fill", "none").attr("stroke", "#111214").attr("stroke-width", 2);
  const dot = g.append("circle").attr("r", 7).attr("fill", "#52545a").attr("stroke", "white").attr("stroke-width", 2);
  const tangentLine = g.append("line").attr("stroke", "#52545a").attr("stroke-dasharray", "3 3").attr("opacity", 0.7);

  function redraw() {
    const k = +document.getElementById("kSlider").value;
    const dy = +document.getElementById("tradeSlider").value;
    document.getElementById("kValue").textContent = `k = ${k.toLocaleString()}`;
    document.getElementById("tradeValue").textContent = `Δy = ${dy >= 0 ? '+' : ''}${dy.toFixed(1)}`;

    const pts = [];
    const xMin = Math.max(0.5, k / 200);
    const xMax = 200;
    for (let i = 0; i <= 200; i++) {
      const x = xMin + (xMax - xMin) * (i/200);
      pts.push([x, k/x]);
    }
    curvePath.attr("d", d3.line().x(d => xScale(d[0])).y(d => yScale(d[1]))(pts));

    const xs = Math.sqrt(k), ys = Math.sqrt(k);
    const newY = ys + dy;
    const newX = k / newY;
    const safeX = Math.max(0.5, Math.min(200, newX));
    const safeY = Math.max(0.5, Math.min(200, newY));
    dot.attr("cx", xScale(safeX)).attr("cy", yScale(safeY));

    const slope = -safeY / safeX;
    const x1 = Math.max(0, safeX - 80), x2 = Math.min(200, safeX + 80);
    const y1 = safeY + slope * (x1 - safeX);
    const y2 = safeY + slope * (x2 - safeX);
    tangentLine
      .attr("x1", xScale(x1)).attr("y1", yScale(y1))
      .attr("x2", xScale(x2)).attr("y2", yScale(y2));

    const marginalPriceStart = 1;  // y/x at balanced start = sqrt(k)/sqrt(k) = 1
    const marginalPrice = safeY / safeX;
    const dxRequired = newX - xs;
    const realizedPrice = dy !== 0 ? -dxRequired / dy : marginalPrice;
    const slippagePct = dy !== 0 ? Math.abs((realizedPrice / marginalPriceStart - 1) * 100) : 0;

    document.getElementById("ammReadout").innerHTML = `
      Reserves: <strong>x = ${safeX.toFixed(2)}</strong>, <strong>y = ${safeY.toFixed(2)}</strong>
      &nbsp;|&nbsp; Marginal price y/x: <strong>${marginalPrice.toFixed(4)}</strong>
      &nbsp;|&nbsp; Δx required: ${dxRequired.toFixed(3)}
      &nbsp;|&nbsp; Realized price: ${realizedPrice.toFixed(4)}
      &nbsp;|&nbsp; Slippage vs. pre-trade marginal: <strong>${slippagePct.toFixed(2)}%</strong>
    `;
  }
  document.getElementById("kSlider").addEventListener("input", redraw);
  document.getElementById("tradeSlider").addEventListener("input", redraw);
  redraw();
}

// Figure 3.2 — Uniswap v3 concentrated liquidity
{
  const svg = d3.select("#v3Liquidity");
  const W = 720, H = 320;
  const margin = { top: 18, right: 24, bottom: 40, left: 56 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const priceMin = 0.90, priceMax = 1.10;
  const tickStep = 0.001;
  const ticks = [];
  for (let p = priceMin; p <= priceMax + 1e-9; p += tickStep) ticks.push(p);

  const xScale = d3.scaleLinear().domain([priceMin, priceMax]).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

  g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(11).tickFormat(d => `$${d.toFixed(2)}`));
  g.append("text").attr("class", "label").attr("x", innerW/2).attr("y", innerH + 36)
    .attr("text-anchor", "middle").text("Price (token A / token B)");
  g.append("text").attr("class", "label")
    .attr("transform", `rotate(-90)`).attr("x", -innerH/2).attr("y", -42)
    .attr("text-anchor", "middle").text("Liquidity per tick");

  const bars = g.append("g");
  const priceLine = g.append("line")
    .attr("y1", 0).attr("y2", innerH)
    .attr("stroke", "#111214").attr("stroke-width", 2);

  function redraw() {
    const rangeBps = +document.getElementById("rangeSlider").value;
    const tvl = +document.getElementById("tvlSlider").value;
    document.getElementById("rangeValue").textContent = `±${rangeBps} bps`;
    document.getElementById("tvlValue").textContent = `$${tvl.toLocaleString()}`;

    const range = rangeBps / 10000;
    const pLow = 1.00 - range, pHigh = 1.00 + range;
    const ticksInRange = ticks.filter(p => p >= pLow && p <= pHigh).length;
    const perTickLiquidity = ticksInRange > 0 ? tvl / ticksInRange : 0;

    const data = ticks.map(p => ({
      price: p,
      liquidity: (p >= pLow && p <= pHigh) ? perTickLiquidity : 0
    }));
    const maxL = d3.max(data, d => d.liquidity) || 1;
    yScale.domain([0, maxL * 1.15]);

    const sel = bars.selectAll("rect").data(data, d => d.price);
    sel.enter().append("rect")
      .attr("x", d => xScale(d.price) - 2)
      .attr("width", 4)
      .merge(sel)
      .attr("y", d => yScale(d.liquidity))
      .attr("height", d => innerH - yScale(d.liquidity))
      .attr("fill", "#111214").attr("opacity", 0.85);
    sel.exit().remove();

    priceLine.attr("x1", xScale(1.00)).attr("x2", xScale(1.00));

    document.getElementById("v3Readout").innerHTML = `
      Active ticks: <strong>${ticksInRange}</strong>
      &nbsp;|&nbsp; Liquidity per tick at current price: <strong>$${perTickLiquidity.toFixed(0)}</strong>
      &nbsp;|&nbsp; If you tighten the range from ±${rangeBps} bps to ±10 bps,
      effective depth at $1.00 multiplies by <strong>${(rangeBps/10).toFixed(1)}×</strong>.
    `;
  }
  document.getElementById("rangeSlider").addEventListener("input", redraw);
  document.getElementById("tvlSlider").addEventListener("input", redraw);
  redraw();
}

// Figure 3.3 — Stableswap vs constant product slippage curves
{
  const svg = d3.select("#curveCompare");
  const W = 720, H = 340;
  const margin = { top: 18, right: 32, bottom: 44, left: 56 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const tradeXs = d3.range(1000, 200000, 2000);

  const xScale = d3.scaleLinear().domain([0, 200000]).range([0, innerW]);
  const yScale = d3.scaleLog().domain([0.0001, 1]).range([innerH, 0]).clamp(true);

  g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => `$${d/1000}k`));
  g.append("g").attr("class", "axis")
    .call(d3.axisLeft(yScale).tickValues([0.0001, 0.001, 0.01, 0.1, 1])
      .tickFormat(d => `${(d*100).toFixed(2)}%`));
  g.append("text").attr("class", "label").attr("x", innerW/2).attr("y", innerH + 36)
    .attr("text-anchor", "middle").text("Trade size (USD)");
  g.append("text").attr("class", "label")
    .attr("transform", `rotate(-90)`).attr("x", -innerH/2).attr("y", -42)
    .attr("text-anchor", "middle").text("Slippage (log scale)");

  const TVL = 2_000_000;
  function cpSlip(trade) { const x = TVL / 2; return Math.max(1e-6, trade / (x + trade)); }
  function v3Slip(trade) { return Math.max(1e-6, cpSlip(trade) / 100); }
  function curveSlip(trade, A) { return Math.max(1e-6, Math.pow(trade / TVL, 2) / (A * 0.05)); }

  const cpPath    = g.append("path").attr("fill", "none").attr("stroke", "#52545a").attr("stroke-width", 2);
  const v3Path    = g.append("path").attr("fill", "none").attr("stroke", "#111214").attr("stroke-width", 2);
  const curvePath = g.append("path").attr("fill", "none").attr("stroke", "#111214").attr("stroke-width", 2.5);

  const leg = g.append("g").attr("transform", `translate(${innerW - 220}, 12)`);
  [["Constant product (v2)", "#52545a"], ["Uniswap v3 ±50bps", "#111214"], ["Curve stableswap", "#111214"]].forEach((d, i) => {
    leg.append("line").attr("x1", 0).attr("x2", 18).attr("y1", i*18).attr("y2", i*18).attr("stroke", d[1]).attr("stroke-width", 2.5);
    leg.append("text").attr("x", 24).attr("y", i*18 + 4).attr("class", "label").text(d[0]);
  });

  function redraw() {
    const A = +document.getElementById("aSlider").value;
    document.getElementById("aValue").textContent = `A = ${A}`;
    const lineGen = f => d3.line().x(d => xScale(d)).y(d => yScale(f(d)));
    cpPath.attr("d", lineGen(cpSlip)(tradeXs));
    v3Path.attr("d", lineGen(v3Slip)(tradeXs));
    curvePath.attr("d", lineGen(t => curveSlip(t, A))(tradeXs));

    const t = 50000;
    document.getElementById("curveReadout").innerHTML = `
      For a <strong>$50,000</strong> trade against a $2M pool:
      &nbsp;Constant product: <strong>${(cpSlip(t)*100).toFixed(2)}%</strong>
      &nbsp;|&nbsp; v3 ±50bps: <strong>${(v3Slip(t)*100).toFixed(3)}%</strong>
      &nbsp;|&nbsp; Curve (A=${A}): <strong>${(curveSlip(t, A)*100).toFixed(4)}%</strong>
      &nbsp;<br/>The qualitative ranking holds across all reasonable A — Curve dominates for assets that trade near the peg.
    `;
  }
  document.getElementById("aSlider").addEventListener("input", redraw);
  redraw();
}

})();
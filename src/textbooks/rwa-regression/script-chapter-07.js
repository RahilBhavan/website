(()=>{

{
  const T = 24;
  const earlyT = 8;

  const top = d3.select("#baconOutcomes");
  const bot = d3.select("#baconDecomp");
  const margin = { top: 24, right: 130, bottom: 36, left: 56 };
  const innerW = 720 - margin.left - margin.right;
  const topH = 220 - margin.top - margin.bottom;
  const botH = 280 - margin.top - margin.bottom;

  const gTop = top.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const gBot = bot.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().domain([0, T-1]).range([0, innerW]);
  const yScaleTop = d3.scaleLinear().domain([-0.5, 3.5]).range([topH, 0]);

  gTop.append("g").attr("class", "axis").attr("transform", `translate(0,${topH})`)
    .call(d3.axisBottom(xScale).ticks(8));
  gTop.append("g").attr("class", "axis").call(d3.axisLeft(yScaleTop).ticks(5));
  gTop.append("text").attr("class", "label").attr("x", innerW/2).attr("y", topH + 30)
    .attr("text-anchor", "middle").text("Period");
  gTop.append("text").attr("class", "label")
    .attr("transform", "rotate(-90)").attr("x", -topH/2).attr("y", -42)
    .attr("text-anchor", "middle").text("Outcome Y");

  const earlyLine = gTop.append("path").attr("fill", "none").attr("stroke", "#52545a").attr("stroke-width", 2.5);
  const lateLine  = gTop.append("path").attr("fill", "none").attr("stroke", "#52545a").attr("stroke-width", 2.5);
  const neverLine = gTop.append("path").attr("fill", "none").attr("stroke", "#52545a").attr("stroke-width", 2);
  const earlyMark = gTop.append("line").attr("stroke", "#52545a").attr("stroke-dasharray", "3 3");
  const lateMark  = gTop.append("line").attr("stroke", "#52545a").attr("stroke-dasharray", "3 3");

  const topLeg = top.append("g").attr("transform", `translate(${margin.left + innerW + 14}, ${margin.top + 16})`);
  [["Early-treated (t*=8)", "#52545a"], ["Late-treated (t*=?)", "#52545a"], ["Never-treated", "#52545a"]].forEach((d, i) => {
    topLeg.append("line").attr("x1", 0).attr("x2", 16).attr("y1", i*20).attr("y2", i*20)
      .attr("stroke", d[1]).attr("stroke-width", 2.5);
    topLeg.append("text").attr("x", 22).attr("y", i*20 + 4).attr("class", "label").text(d[0]);
  });

  const yScaleBot = d3.scaleLinear().domain([-1.2, 1.2]).range([botH, 0]);
  const compKeys = ["E vs N", "L vs N", "E vs L pre", "L vs E post (forbidden)"];
  const xBand = d3.scaleBand().domain(compKeys).range([0, innerW]).padding(0.3);

  gBot.append("g").attr("class", "axis").attr("transform", `translate(0,${yScaleBot(0)})`)
    .call(d3.axisBottom(xBand));
  gBot.append("g").attr("class", "axis").call(d3.axisLeft(yScaleBot).ticks(5));
  gBot.append("text").attr("class", "label")
    .attr("transform", "rotate(-90)").attr("x", -botH/2).attr("y", -42)
    .attr("text-anchor", "middle").text("Bacon weight × ATT contribution");

  const bars = gBot.append("g");
  const weightLabels = gBot.append("g");

  function generate(staticE, dynE, lateT) {
    const baseDrift = t => 0.1 + 0.005 * t;
    const series = (treatT) => d3.range(T).map(t => {
      const base = baseDrift(t);
      if (treatT == null || t < treatT) return { t, y: base + (Math.sin(t/2)*0.02) };
      const since = t - treatT;
      return { t, y: base + staticE + dynE * since };
    });
    return {
      early: series(earlyT),
      late:  series(lateT),
      never: series(null),
    };
  }

  function decompose(d, staticE, dynE, lateT) {
    const meanY = (arr, lo, hi) => d3.mean(arr.slice(lo, hi+1), x => x.y);
    const att_EvN = (meanY(d.early, earlyT, T-1) - meanY(d.early, 0, earlyT-1))
                  - (meanY(d.never, earlyT, T-1) - meanY(d.never, 0, earlyT-1));
    const att_LvN = (meanY(d.late, lateT, T-1) - meanY(d.late, 0, lateT-1))
                  - (meanY(d.never, lateT, T-1) - meanY(d.never, 0, lateT-1));
    const att_EvLpre = (meanY(d.early, earlyT, lateT-1) - meanY(d.early, 0, earlyT-1))
                    - (meanY(d.late,  earlyT, lateT-1) - meanY(d.late,  0, earlyT-1));
    const att_LvEpost = (meanY(d.late, lateT, T-1) - meanY(d.late, 0, lateT-1))
                     - (meanY(d.early, lateT, T-1) - meanY(d.early, 0, lateT-1));
    const w_EvN = 0.30, w_LvN = 0.25, w_EvLpre = 0.20, w_LvEpost = 0.25;
    const dynamicBiasOfE = dynE * (T-1 - lateT);
    return [
      { key: "E vs N",                 att: att_EvN,    weight: w_EvN,    isForbidden: false },
      { key: "L vs N",                 att: att_LvN,    weight: w_LvN,    isForbidden: false },
      { key: "E vs L pre",             att: att_EvLpre, weight: w_EvLpre, isForbidden: false },
      { key: "L vs E post (forbidden)",att: att_LvEpost, weight: w_LvEpost, isForbidden: true, dynBias: dynamicBiasOfE },
    ];
  }

  function redraw() {
    const staticE = +document.getElementById("staticEff").value;
    const dynE = +document.getElementById("dynEff").value;
    const lateT = +document.getElementById("lateT").value;
    document.getElementById("staticEffV").textContent = staticE.toFixed(1);
    document.getElementById("dynEffV").textContent = dynE.toFixed(3) + " per period";
    document.getElementById("lateTV").textContent = `period ${lateT}`;

    const d = generate(staticE, dynE, lateT);
    const lineGen = d3.line().x(p => xScale(p.t)).y(p => yScaleTop(p.y));
    earlyLine.attr("d", lineGen(d.early));
    lateLine.attr("d", lineGen(d.late));
    neverLine.attr("d", lineGen(d.never));
    earlyMark.attr("x1", xScale(earlyT)).attr("x2", xScale(earlyT)).attr("y1", 0).attr("y2", topH);
    lateMark.attr("x1", xScale(lateT)).attr("x2", xScale(lateT)).attr("y1", 0).attr("y2", topH);

    const decomp = decompose(d, staticE, dynE, lateT);
    const sel = bars.selectAll("rect").data(decomp, dd => dd.key);
    sel.enter().append("rect")
      .attr("x", dd => xBand(dd.key)).attr("width", xBand.bandwidth())
      .merge(sel)
      .attr("y", dd => Math.min(yScaleBot(0), yScaleBot(dd.att * dd.weight)))
      .attr("height", dd => Math.abs(yScaleBot(dd.att * dd.weight) - yScaleBot(0)))
      .attr("fill", dd => dd.isForbidden && dynE > 0.01 ? "#52545a" : "#111214")
      .attr("opacity", 0.8);

    const labSel = weightLabels.selectAll("text").data(decomp, dd => dd.key);
    labSel.enter().append("text").merge(labSel)
      .attr("x", dd => xBand(dd.key) + xBand.bandwidth()/2)
      .attr("y", dd => yScaleBot(dd.att * dd.weight) + (dd.att * dd.weight >= 0 ? -6 : 14))
      .attr("text-anchor", "middle")
      .attr("class", "label")
      .style("font-weight", 600)
      .text(dd => `w=${dd.weight.toFixed(2)}, ATT=${dd.att.toFixed(2)}`);

    const twfe = decomp.reduce((s, c) => s + c.weight * c.att, 0);
    const trueATT = staticE + dynE * ((T-1 - earlyT) + (T-1 - lateT)) / 2;
    document.getElementById("baconReadout").innerHTML = `
      Approximate TWFE coefficient: <strong>${twfe.toFixed(3)}</strong>
      &nbsp;|&nbsp; True average ATT across treated periods: <strong style="color:#111214">${trueATT.toFixed(3)}</strong>
      &nbsp;|&nbsp; Bias: <strong>${(twfe - trueATT).toFixed(3)}</strong>
      &nbsp;<br/>${Math.abs(twfe - trueATT) > 0.15 ? "<strong style='color:#52545a'>Substantial bias.</strong>" : "Bias is small here — try increasing dynamic effect slope."}
      The forbidden comparison's contribution turns red when the dynamic effect is non-trivial.
    `;
  }
  ["staticEff", "dynEff", "lateT"].forEach(id => document.getElementById(id).addEventListener("input", redraw));
  redraw();
}

})();